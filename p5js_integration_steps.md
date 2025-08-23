## p5.js Integration Steps

This document outlines the steps to integrate a full-page, subtle, interactive p5.js background that adapts to your site's light and dark modes.

### Step 1: Verify p5.js Library Inclusion

Ensure the p5.js libraries are correctly included in your site's main script file.

1.  Open `_includes/scripts.liquid`.
2.  Verify that the following lines are present, ideally after the MDB scripts:

    ```liquid
    <!-- p5.js libraries -->
    <script src="https://cdn.jsdelivr.net/npm/p5@1.9.0/lib/p5.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/p5@1.9.0/lib/addons/p5.dom.min.js"></script>
    ```

### Step 2: Create p5.js Sketch File

This file will contain your p5.js sketch logic, including dynamic color adaptation for light/dark modes.

1.  Create a new file: `/assets/js/p5-background.js`.
2.  Add the following basic structure to this file. This code includes placeholders for dynamic color logic:

    ```javascript
    let sketch = function (p) {
      let bgColor, elementColor;

      p.setup = function () {
        let canvas = p.createCanvas(p.windowWidth, p.windowHeight);
        canvas.position(0, 0);
        canvas.style("z-index", "-1");
        canvas.style("pointer-events", "none");
        p.pixelDensity(1);
        p.updateColors(); // Initial color update
      };

      p.draw = function () {
        p.background(bgColor);
        // Your subtle interactive background drawing code will go here
        // Use elementColor for drawing elements that should contrast with the background
      };

      p.windowResized = function () {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
      };

      p.updateColors = function () {
        // Function to get CSS variable values
        const getCssVar = (name) => {
          return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
        };

        // Read colors from CSS variables
        bgColor = getCssVar("--global-bg-color");
        elementColor = getCssVar("--global-text-color");

        // Fallback for debugging or if variables are not found
        if (!bgColor) bgColor = p.color(255); // Default light background
        if (!elementColor) elementColor = p.color(0); // Default dark text

        // Example: If you want to adjust based on dark mode class
        // const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
        // if (isDarkMode) { /* adjust colors for dark mode */ }
        // else { /* adjust colors for light mode */ }
      };

      // Observe changes to the HTML element's attributes (like data-theme)
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === "attributes" && (mutation.attributeName === "data-theme" || mutation.attributeName === "class")) {
            p.updateColors();
          }
        });
      });
      observer.observe(document.documentElement, { attributes: true });
    };

    new p5(sketch);
    ```

### Step 3: Add Canvas Element to Layout

This creates the HTML element where your p5.js sketch will render.

1.  Open `_layouts/default.liquid`.
2.  Add the following HTML tag. It should be placed early in the `<body>` tag, ideally right after the opening `<body>` tag, to ensure it renders behind other content.

    ```html
    <canvas id="p5-background-canvas"></canvas>
    ```

### Step 4: Add CSS for Canvas Positioning

This CSS will ensure your p5.js canvas covers the entire background and doesn't interfere with other elements.

1.  Create a new SCSS file: `_sass/_p5_background.scss`.
2.  Add the following CSS rules to this file:

    ```scss
    #p5-background-canvas {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: -1; /* Ensures it's behind other content */
      pointer-events: none; /* Allows clicks/interactions with elements above it */
    }
    ```

3.  Import this new SCSS file into your main layout SCSS. Open `_sass/_layout.scss` and add the following line at the end of the file:

    ```scss
    @import "p5_background";
    ```

### Step 5: Link the p5.js Sketch File

Now, you need to tell your site to load your p5.js sketch.

1.  Open `_includes/scripts.liquid` again.
2.  Add the following line at the very end of the file, after all other script tags:

    ```liquid
    <!-- Load p5.js sketch -->
    <script src="{{ '/assets/js/p5-background.js' | relative_url | bust_file_cache }}"></script>
    ```

### Step 6: Implement a Subtle p5.js Sketch

Once the basic setup is complete, you can add your desired subtle interactive background code within the `p.draw` function in `/assets/js/p5-background.js`. Remember to use `bgColor` and `elementColor` for dynamic theme adaptation.

**Example of a subtle sketch (replace `p.draw` content):**

```javascript
p.draw = function () {
  p.background(bgColor);

  // Example: Slowly moving particles
  p.noStroke();
  p.fill(elementColor, 50); // Semi-transparent elements
  for (let i = 0; i < 50; i++) {
    let x = p.noise(p.frameCount * 0.005 + i * 0.1) * p.width;
    let y = p.noise(p.frameCount * 0.005 + i * 0.1 + 1000) * p.height;
    let size = p.noise(p.frameCount * 0.01 + i * 0.2) * 20 + 5;
    p.ellipse(x, y, size, size);
  }
};
```

### Step 7: Test

1.  Restart your Jekyll development server.
2.  Open your site in a browser and navigate through pages.
3.  Toggle between light and dark modes to ensure the p5.js background adapts its colors correctly.

Let me know once you've completed these steps, and I can help with further refinements or debugging!
