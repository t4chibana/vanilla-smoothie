(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.smoothie = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  /* general methods */
  var gm = {};
  if (typeof Object.assign === 'function') {
    gm.margeObject = Object.assign;
  } else {
    gm.margeObject = function(target) {
      var args = Array.prototype.slice.call(arguments).slice(1);
      args.forEach(function(element) {
        Object.keys(element).forEach(function(key) {
          target[key] = element[key];
        });
      });
      return target;
    };
  }
  gm.getQuery = function() {
    var result = {};
    var str = location.search.substring(1);
    if (!str) {
      return false;
    }
    var params = str.split('&');
    params.forEach(function(element) {
      var kv = element.split('=');
      result[kv[0]] = decodeURIComponent(kv[1]);
    });
    return result;
  };
  gm.getOffset = function(element,parent) {
    var position = 0;
    do {
      position += element.offsetTop || 0;
      element = element.offsetParent;
    } while(element && element !== parent);
    return position;
  }
  var EventSwitch = function(target, type, listener, option){
    this.listener = listener;
    this.target = target;
    this.type = type;
    this.option = option || false;
    this.switch('on');
  }
  EventSwitch.prototype.switch = function(order){
    var _this = this;
    var option = _this.option;
    var listenerType = order === 'on' ? 'addEventListener' : 'removeEventListener' ;
    if(typeof _this.target === 'string'){
      Array.prototype.slice.call(document.querySelectorAll(_this.target)).forEach(function(element){
        element[listenerType](_this.type, _this.listener, option);
      });
    }else{
      _this.target[listenerType](_this.type, _this.listener, option);
    }
  }

  /*default easing math functions */
  Math.linear = function(t, b, c, d) {
    return (c * t) / d + b;
  };
  Math.easeInQuad = function(t, b, c, d) {
    t /= d;
    return c * t * t + b;
  };
  Math.easeOutQuad = function(t, b, c, d) {
    t /= d;
    return -c * t * (t - 2) + b;
  };
  Math.easeInOutQuad = function(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return (c / 2) * t * t + b;
    t--;
    return (-c / 2) * (t * (t - 2) - 1) + b;
  };
  var defaultOption = {
    parent: '',
    offset: 0,
    beforeScroll: false,
    afterScroll: false,
    duration: 500,
    easing: 'easeInQuad',
    query: 'anchor',
    customData: 'target',
    responsive: []
  };
  /* main class */
  var VanillaSmoothie = function(trigger,option){
    this.trigger = trigger;
    this.animation = false;
    this.target = false;
    this.targetOffset = 0;
    this.option = gm.margeObject({}, defaultOption, option || {});
    this.setting = {};
    this.events = [];
    this.parent = window;
    this.init();
  }
  VanillaSmoothie.prototype = {
    init:function(){
      var _this = this;
      _this.events.push(
        new EventSwitch(document,'click',function(event) {
          var nodeList = Array.prototype.slice.call(document.querySelectorAll(_this.trigger));
          for(var i = 0; i < nodeList.length ; i++ ){
            if(nodeList[i] === event.target){
              var target = event.target.attributes['data-'+_this.setting.customData] ? event.target.attributes['data-'+_this.setting.customData].nodeValue : event.target.attributes.href.nodeValue;
              _this.scroll(target);
              event.preventDefault();
              break;
            }
          }
        })
      )
      if (_this.option.responsive.length) {
        _this.option.responsive.sort(function(a, b) {
          return b.breakpoint - a.breakpoint;
        });
        _this.events.push(
          new EventSwitch(window,'resize',function() {
            _this.resize();
          })
        )
        _this.resize();
      } else {
        _this.setting = _this.option;
      }
      var query = gm.getQuery();
      if (_this.setting.query !== false && query[_this.setting.query]) {
        _this.events.push(
          new EventSwitch(window,'load',function() {
            _this.scroll('#'+query[_this.setting.query]);
          })
        )
      }
    },
    destroy:function(){
      var _this = this;
      _this.events.forEach(function(element){
        element.switch('off')
      });
      _this.events = [];
      _this.clearAnimationSetting();
    },
    resize:function(){
      var _this = this;
      var windowWidth = window.innerWidth || document.body.clientWidth;
      var optionLength = _this.option.responsive.length;
      var widthOption;
      for (var i = 0; i < optionLength; i++) {
        var element = _this.option.responsive[i];
        var nextElement = i === optionLength - 1 ? false : _this.option.responsive[i + 1];
        if (windowWidth > element.breakpoint && i === 0) {
          widthOption = _this.option;
          break;
        } else if (windowWidth <= element.breakpoint && ( !nextElement || windowWidth > nextElement.breakpoint)) {
          widthOption = element.setting;
          break;
        }
      }
      _this.setting = gm.margeObject({}, _this.option, widthOption);
    },
    scroll:function(target){
      var _this = this;
      var args = Array.prototype.slice.call(arguments).slice(1);
      _this.stop(true);
      _this.parent = _this.setting.parent.match(/^#/) ? document.querySelector(_this.option.parent) : ('scrollingElement' in document) ? document.scrollingElement : document.documentElement ;
      _this.target = target;
      _this.targetOffset = isNaN(_this.target) ? gm.getOffset(document.querySelector(_this.target),_this.parent) - _this.setting.offset : _this.target - _this.setting.offset;
      _this.targetOffset = _this.targetOffset < 0 ? 0 : _this.targetOffset;
      var startTime = Date.now();
      var currentOffset = _this.parent.scrollTop;
      var destination = _this.targetOffset - currentOffset;
      if (destination === 0) {
        _this.clearAnimationSetting();
        return;
      }
      _this.beforeScroll(args);
      var animate = function() {
        var now = Date.now();
        var current = now - startTime;
        if (current >= _this.setting.duration) {
          _this.parent.scrollTop = _this.targetOffset;
          _this.afterScroll(args);
          _this.clearAnimationSetting();
          return true;
        }
        var position = Math[_this.setting.easing](current, 0, 1, _this.setting.duration);
        var movePoint = currentOffset + destination * position;
        _this.parent.scrollTop = movePoint;
        _this.animation = window.requestAnimationFrame(animate.bind(_this));
      };
      animate();
    },
    stop:function(move) {
      var _this = this;
      move = move || false;
      var args = Array.prototype.slice.call(arguments).slice(1);
      if (_this.animation !== false) {
        window.cancelAnimationFrame(_this.animation);
        if (move) {
          _this.parent.scrollTop = _this.targetOffset;
        }
        _this.afterScroll(args);
        _this.clearAnimationSetting();
      }
    },
    clearAnimationSetting:function() {
      var _this = this;
      _this.animation = false;
      _this.target = false;
    },
    beforeScroll:function(args) {
      var _this = this;
      if (typeof _this.setting.beforeScroll === 'function') {
        _this.setting.beforeScroll(_this.target,args);
      }
    },
    afterScroll:function(args) {
      var _this = this;
      if (typeof _this.setting.afterScroll === 'function') {
        _this.setting.afterScroll(_this.target,args);
      }
    }
  }
  return function (trigger, option) {
    return new VanillaSmoothie(trigger, option);
  };
}));
