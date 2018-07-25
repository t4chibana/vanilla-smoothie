# Vanilla smoothie
_smooth scroll plugin_

## About
Are you still using jQuery to make smooth scrolls?
This is an lightweight anchor link plug-in that works without dependency on other libraries at all.

demo site is comming soon.

## Usage

### Load plugin file
```html
<script src="/path/to/plugin/vanillaSmoothie.min.js">
```

### Javascript coding
```js
//simple
smoothie('a[href^="#"]');

//with option
smoothie('.scrollTrigger',{ duration : 500 });
```

### HTML Markup
```html
<!-- link tag -->
<a href="#target" class="scrollTrigger">scroll to #target</a>

<!-- link tag (external page) -->
<a href="page.html?anchor=target" class="scrollTrigger">scroll to #target in page.html</a>

<!-- other tag (use custom data) -->
<div class="scrollTrigger" data-target="#target">scroll to #target</div>
```
You can create a smooth scrolling anchor link by specifying the destination ID as the href or custom data.
When href and custom data are set at the same time, the setting of custom data takes precedence.
Please use customer data when you want to scroll to the absolute value offset or change the target depending on the device.

## Options

Option | Type | Default | Description
------ | ---- | ------- | -----------
parent | String | '' | Specify the area to scroll by ID. The specification method is the same as CSS selector. Default parent is `window`.
offset | Number | 0 | Offset setting of stop position. Scrolling stops just before the set value.
beforeScroll | function(target,arguments) | false | Function setting before starting scrolling.
afterScroll | function(target,arguments)  | false | Function setting after completion of scrolling.
duration | Number | 500 | animation speed setting.
easing | String | 'easeInQuad' |　Easing setting. Default easing `linear` ` easeInQuad` `easeOutQuad` `easeInOutQuad`. You can use other easing by adding an easing function to the `Math` object. (Details will be described later)
query | String | 'anchor' | URL query name setting.
customData | String | 'target' | Custom data name setting.
responsive | Array | [] | Option setting for each window width. (Details will be described later)

### Custom easing example
```js
// add new easing function to Math Object
Math.easeInSine = (t, b, c, d) => {
  return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
};

smoothie('.scrollTrigger',{ easing : 'easeInSine' });
```
Please prepare easing function like reference.
Reference : [Easing Equations](http://gizma.com/easing/)

### Responsive setting example
```js
smoothie('.scrollTrigger',{ 
  offset : 0,
  duration : 1000,
  responsive : [
    {
      breakpoint : 640,
      setting : {
        offset : 100,
        duration : 750
      }
    },
    {
      breakpoint : 320,
      setting : {
        offset : 50,
        duration : 500
      }
    }
  ]
});
```


## API
Method | Parameter | Description
------ | ------- | -----------
init | none | Initialization and activation of the plugin. It is done automatically at the time of declaration.
destroy | none | Destroy registered event.
scroll(target,arguments) | String(selector) or Number / anything | Perform scrolling animation. Please set ID or numerical value as the first argument. Those set as the second argument are passed to `beforescroll` and` afterscroll`.
stop(move,arguments) | boolean / anything | Stop scrolling animation. If `move` is set to` true`, it jumps to the target. When `false` is set, scrolling stops on the spot.

### Use API example
```js
const scroller = smoothie('.scrollTrigger');

scroller.scroll('#target');
scroller.scroll(0);
scroller.stop();
scroller.destroy();
```

## License
MIT