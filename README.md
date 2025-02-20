# Continuous Corner Radius Library

This library provides SwiftUI-style continuous corner radius effects for the web.

## Quick Start

1. Copy these files to your project:
   - `continuous-corner.js`
   - `continuous-rounding.css`

2. Link the CSS in your HTML:
```html
<link rel="stylesheet" href="continuous-rounding.css">
```

3. Register the worklet in your HTML:
```html
<script>
    if ('paintWorklet' in CSS) {
        CSS.paintWorklet.addModule('continuous-corner.js');
    }
</script>
```

## Usage

Add the `--continuous-rounding` property to any element:

```html
<div style="--continuous-rounding: 25px">
    Your content here
</div>
```


## Browser Support

Requires browsers that support the CSS Paint API (Houdini).
Modern versions of Chrome, Edge, and Opera are supported.

## Example

```html
<div class="my-box" style="--continuous-rounding: 75px">
    This box will have smooth continuous corners
</div>
```

That's it! Enjoy your smooth continuous corners!
