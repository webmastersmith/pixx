# pixx

- [NPM pixx](https://www.npmjs.com/package/pixx)

## Why

- 🖼️ Creating **responsive images** (images that adapt to different screen sizes) can be **complicated** and prone to **errors**.
- ✨ `Pixx` is the 'brute force' method to generate both the **responsive images** themselves and the corresponding **HTML** code needed to display them correctly.
- ⏩ Using the _[sharp](https://sharp.pixelplumbing.com/)_ library, (a high-performance Node.js module for image processing), `pixx` creates different sizes and formats of your images.
- Pixx accepts the following image types: `avif, gif, jpeg, jpg, png, tiff, webp, svg`.
  - **SVG**: `<svg width="800px" height="800px"...</svg>`
    - Images created will be '800px' and smaller.
- Pixx can output the following image types: `avif, gif, jpeg, jpg, png, tiff, webp`.
- 💻 This package uses the _[NodeJS](https://nodejs.org/en/download/package-manager)_ environment.
- 📏 Pixx **does not increase image size**. Start with the **largest optimized image** for best results.
- 🔧 Pixx is designed to use in project **development**. The 'pixx' function is called and ran during build, so only HTML is shipped to **production**.
- 🔤 Your code must use double quote (ASCII 34 `"`) or single quote (ASCII 39 `'`). Fancy quotes other than these will break `pixx` logic.
- ⚠️ **Sharp error on Windows**: Could not load the "sharp" module using the win32-x64 runtime.
  - ✅ **Solution**: `npm install --include=optional sharp`

</br>
<div><img src="images/color-divider.png" width="838" alt="pixx divider" /></div>

## Simple Start HTML

```html
<!-- npm must be initiated and pixx installed. -->
<!-- npm init -y && npm i -D pixx -->

<!-- 1. add pix function to your html page in a 'script' tag. -->
<!-- index.html example. -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body>
    <p>Simple Example</p>
    <!-- Each pixx function needs it's own 'script' tag. -->
    <script>
      // img.jpg is 2560x1920.
      pixx('img.jpg', {
        jsx: false, // JSX syntax is default (e.g. class vs. className). Tell pixx return HTML syntax.
      });
    </script>
  </body>
</html>
```

```js
// 2. Run pixxFlow to build the images and return raw html.
// create a JavaScript file with any name.
// index.js
import { pixxFlow } from 'pixx';
pixxFlow(); // creates a mirrored file: 'pixx-index.html'.
// or
pixxFlow({ overwrite: true }); // comments out the 'pixx' function and add html to 'index.html'.
```

```sh
# 3. In the same terminal directory as your index.js, run:
node index.js # images will be created, html is returned and written to page.
```

<details>
  <summary><b><code>Returns...</code></b></summary>

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body>
    <p>Simple Example</p>
    <!-- Each pixx function needs it's own 'script' tag -->
    <!-- <script>
      pixx('./images/img.jpg', {
        // img.jpg is 2560x1920.
        jsx: false, // JSX is default. Tell pixx return raw HTML.
      });
    </script> -->
    <picture>
      <source
        type="image/avif"
        sizes="auto"
        srcset="
          pixx_images/img.jpg/img_w300h225.avif    300w,
          pixx_images/img.jpg/img_w600h450.avif    600w,
          pixx_images/img.jpg/img_w900h675.avif    900w,
          pixx_images/img.jpg/img_w1200h900.avif  1200w,
          pixx_images/img.jpg/img_w1500h1125.avif 1500w,
          pixx_images/img.jpg/img_w1800h1350.avif 1800w,
          pixx_images/img.jpg/img_w2100h1575.avif 2100w,
          pixx_images/img.jpg/img_w2400h1800.avif 2400w,
          pixx_images/img.jpg/img_w2560h1920.avif 2560w
        "
      />
      <source
        type="image/webp"
        sizes="auto"
        srcset="
          pixx_images/img.jpg/img_w300h225.webp    300w,
          pixx_images/img.jpg/img_w600h450.webp    600w,
          pixx_images/img.jpg/img_w900h675.webp    900w,
          pixx_images/img.jpg/img_w1200h900.webp  1200w,
          pixx_images/img.jpg/img_w1500h1125.webp 1500w,
          pixx_images/img.jpg/img_w1800h1350.webp 1800w,
          pixx_images/img.jpg/img_w2100h1575.webp 2100w,
          pixx_images/img.jpg/img_w2400h1800.webp 2400w,
          pixx_images/img.jpg/img_w2560h1920.webp 2560w
        "
      />
      <source
        type="image/jpg"
        sizes="auto"
        srcset="
          pixx_images/img.jpg/img_w300h225.jpg    300w,
          pixx_images/img.jpg/img_w600h450.jpg    600w,
          pixx_images/img.jpg/img_w900h675.jpg    900w,
          pixx_images/img.jpg/img_w1200h900.jpg  1200w,
          pixx_images/img.jpg/img_w1500h1125.jpg 1500w,
          pixx_images/img.jpg/img_w1800h1350.jpg 1800w,
          pixx_images/img.jpg/img_w2100h1575.jpg 2100w,
          pixx_images/img.jpg/img_w2400h1800.jpg 2400w,
          pixx_images/img.jpg/img_w2560h1920.jpg 2560w
        "
      />
      <img
        src="pixx_images/img.jpg/img-fallback_w2560h1920.jpg"
        sizes="auto"
        alt="pixx_image"
        width="2560"
        height="1920"
        loading="lazy"
        decoding="auto"
        fetchpriority="auto"
      />
    </picture>
  </body>
</html>
```

</details>

## Simple Start JSX (Vite)

```tsx
// 1. create a vite project and install pixx.
// npm create vite@latest // https://vite.dev/guide/
// npm i -D pixx

// Add pixx plugin to 'vite.config.ts'.
import { defineConfig } from 'vite';
import { pixxVitePlugin } from 'pixx';

export default defineConfig({
  plugins: [pixxVitePlugin({ log: true })],
});

// 2. Add pixx function to your .jsx or .tsx page.
import { pixx } from 'pixx';

export default function App() {
  return (
    <div>
      {/* happy face.jpg is 720x360. The space in file name will be replaced in the new images so HTML is valid. */}
      {pixx('./images/happy face.jpg')}
    </div>
  );
}
```

```sh
# 3. In the same terminal root directory, run:
npm run dev # images are created, pixxVitePlugin intercepts page and replaces pixx function with html.
# or
npm run build # images will be created, html is returned and written to page.
```

<details>
  <summary><b><code>Returns...</code></b></summary>

```tsx
// import pixx from 'pixx';

export default function App() {
  return (
    <div>
      {/* happy face.jpg is 720x360. The space in file name will be replaced so HTMl is valid. */}
      {/* {pixx('./images/happy face.jpg')} */}
      <picture>
        <source
          type="image/avif"
          sizes="auto"
          srcSet="pixx_images/happy_face.jpg/happy_face_w300h150.avif 300w, pixx_images/happy_face.jpg/happy_face_w600h300.avif 600w, pixx_images/happy_face.jpg/happy_face_w720h360.avif 720w"
        />
        <source
          type="image/webp"
          sizes="auto"
          srcSet="pixx_images/happy_face.jpg/happy_face_w300h150.webp 300w, pixx_images/happy_face.jpg/happy_face_w600h300.webp 600w, pixx_images/happy_face.jpg/happy_face_w720h360.webp 720w"
        />
        <source
          type="image/jpg"
          sizes="auto"
          srcSet="pixx_images/happy_face.jpg/happy_face_w300h150.jpg 300w, pixx_images/happy_face.jpg/happy_face_w600h300.jpg 600w, pixx_images/happy_face.jpg/happy_face_w720h360.jpg 720w"
        />
        <img
          src="pixx_images/happy_face.jpg/happy_face-fallback_w720h360.jpg"
          sizes="auto"
          alt="pixx_image"
          width="720"
          height="360"
          loading="lazy"
          decoding="auto"
          fetchPriority="auto"
        />
      </picture>
    </div>
  );
}
```

</details>

</br>
<div><img src="images/color-divider.png" width="838" alt="pixx divider" /></div>

## Understanding Responsive Images: Resolution Switching, Multiple Types, and Art Direction

- All 'responsive image methods' must have `<meta name="viewport" content="width=device-width">` added to the _head_ section of the _html_ page, for _**mobile browsers**_ to use the actual device viewport in decision making.
- **Responsive Image Advantages**
  - When mobile or desktop browsers download and parse the HTML, the `sizes`, `srcset` and `media` attribute give clues to the browser about the best images to download.
  - Using these attributes, the browser decides the best image to download based on its viewport size and pixel density.
  - **sizes**: inform the browser about how much of the viewport the image will fill.
  - **srcset**: inform the browser about the available image widths to choose from.
  - **media**: Art direction only. Completely different images can be offered depending on device screen size.

## Responsive Images

- Three main ways to use responsive images.
  1. **Resolution Switching**: Single image in multiple sizes. (e.g. img-100.jpg, img-200.jpg, img-300.jpg).
  2. **Multiple Types**: Single image in multiple sizes and types. (e.g. avif, webp, jpg).
  3. **Art Direction**: Multiple different images the browser will choose depending on viewport width.
     1. (e.g. img-full.jpg, img-crop.jpg).

</br>
<div align="center"><img src="images/color-divider-small.png" width="500" alt="pixx divider" /></div>

### Resolution Switching

- Uses the `img` element with the `srcset` and `sizes` attributes.
- **Single image type**. Browsers can choose from the **srcset** attribute, the image to download based of the device viewport, pixel density and **sizes** attribute.
- Fallback is the img `src` attribute.
- **Pros**
  - The least complex. Default _sizes_ attribute is `auto` (the 'img' width and height values).
  - Browser can choose from multiple image options.
- **Cons**
  - Only single image type can be used at a time.

```jsx
import { pixx } from 'pixx';

export default function App() {
  return (
    <div>
      {/* lunar moon.jpg is 2560x1920 */}
      {pixx('./images/lunar moon.jpg', {
        picTypes: ['webp'],
        sizes: ['(max-width: 450px) 75vw', '(max-width: 800px) 50vw', '25vw'],
      })}
    </div>
  );
}
```

<details>
  <summary><b><code>Resolution Switching Returns...</code></b></summary>

```tsx
// Single image type, multiple sizes.
// Explanation: As an example, device viewport has a width of 700px.
// The 'sizes media condition' tells browser 'if device screen is <= 450px, image will take 75% (338px) of width'.
// If viewport pixel density is 2x, browser will choose >= 676px image (338px x 2 = 676px).
// The closest image to satisfy the browser is 'pixx_images/lunar_moon.jpg/lunar_moon_w900h675.webp 900w'.

// import { pixx } from 'pixx';

export default function App() {
  return (
    <div>
      {/* lunar moon.jpg is 2560x1920 */}
      {/* {pixx('./images/lunar moon.jpg', {
        picTypes: ['webp'],
        sizes: ['(max-width: 450px) 75vw', '(max-width: 800px) 50vw', '25vw'],
      })} */}
      <img
        src="pixx_images/lunar_moon.jpg/lunar_moon-fallback_w2560h1920.jpg"
        srcSet="pixx_images/lunar_moon.jpg/lunar_moon_w300h225.webp 300w, pixx_images/lunar_moon.jpg/lunar_moon_w600h450.webp 600w, pixx_images/lunar_moon.jpg/lunar_moon_w900h675.webp 900w, pixx_images/lunar_moon.jpg/lunar_moon_w1200h900.webp 1200w, pixx_images/lunar_moon.jpg/lunar_moon_w1500h1125.webp 1500w, pixx_images/lunar_moon.jpg/lunar_moon_w1800h1350.webp 1800w, pixx_images/lunar_moon.jpg/lunar_moon_w2100h1575.webp 2100w, pixx_images/lunar_moon.jpg/lunar_moon_w2400h1800.webp 2400w, pixx_images/lunar_moon.jpg/lunar_moon_w2560h1920.webp 2560w"
        sizes="(max-width: 450px) 75vw, (max-width: 800px) 50vw, 25vw"
        alt="pixx_image"
        width="2560"
        height="1920"
        loading="lazy"
        decoding="auto"
        fetchPriority="auto"
      />
    </div>
  );
}
```

</details>

</br>
<div align="center"><img src="images/color-divider-small.png" width="500" alt="pixx divider" /></div>

### Multiple Types

- Uses the `picture` and `source` element with the `srcset` and `sizes` attributes.
- **Multiple image types**. Browsers can choose what image **size** and **type** to download based on the device viewport and pixel density.
- Fallback is `img` element.
- **Pros**
  - Use new and highly optimized image types, with fallback, for browsers that don't support them.
- **Cons**
  - Code can be complex.
  - Order matters. Browser takes the first truthy value.

```tsx
import { pixx } from 'pixx';

export default function App() {
  return (
    <div>
      {/* lunar moon.jpg is 2560x1920 */}
      {pixx('./images/lunar moon.jpg')}
    </div>
  );
}
```

<details>
  <summary><b><code>Multiple Types Returns...</code></b></summary>

```tsx
// import { pixx } from 'pixx';

export default function App() {
  return (
    <div>
      {/* lunar moon.jpg is 2560x1920 */}
      {/* {pixx('./images/lunar moon.jpg')} */}
      <picture>
        <source
          type="image/avif"
          sizes="auto"
          srcSet="pixx_images/lunar_moon.jpg/lunar_moon_w300h225.avif 300w, pixx_images/lunar_moon.jpg/lunar_moon_w600h450.avif 600w, pixx_images/lunar_moon.jpg/lunar_moon_w900h675.avif 900w, pixx_images/lunar_moon.jpg/lunar_moon_w1200h900.avif 1200w, pixx_images/lunar_moon.jpg/lunar_moon_w1500h1125.avif 1500w, pixx_images/lunar_moon.jpg/lunar_moon_w1800h1350.avif 1800w, pixx_images/lunar_moon.jpg/lunar_moon_w2100h1575.avif 2100w, pixx_images/lunar_moon.jpg/lunar_moon_w2400h1800.avif 2400w, pixx_images/lunar_moon.jpg/lunar_moon_w2560h1920.avif 2560w"
        />
        <source
          type="image/webp"
          sizes="auto"
          srcSet="pixx_images/lunar_moon.jpg/lunar_moon_w300h225.webp 300w, pixx_images/lunar_moon.jpg/lunar_moon_w600h450.webp 600w, pixx_images/lunar_moon.jpg/lunar_moon_w900h675.webp 900w, pixx_images/lunar_moon.jpg/lunar_moon_w1200h900.webp 1200w, pixx_images/lunar_moon.jpg/lunar_moon_w1500h1125.webp 1500w, pixx_images/lunar_moon.jpg/lunar_moon_w1800h1350.webp 1800w, pixx_images/lunar_moon.jpg/lunar_moon_w2100h1575.webp 2100w, pixx_images/lunar_moon.jpg/lunar_moon_w2400h1800.webp 2400w, pixx_images/lunar_moon.jpg/lunar_moon_w2560h1920.webp 2560w"
        />
        <source
          type="image/jpg"
          sizes="auto"
          srcSet="pixx_images/lunar_moon.jpg/lunar_moon_w300h225.jpg 300w, pixx_images/lunar_moon.jpg/lunar_moon_w600h450.jpg 600w, pixx_images/lunar_moon.jpg/lunar_moon_w900h675.jpg 900w, pixx_images/lunar_moon.jpg/lunar_moon_w1200h900.jpg 1200w, pixx_images/lunar_moon.jpg/lunar_moon_w1500h1125.jpg 1500w, pixx_images/lunar_moon.jpg/lunar_moon_w1800h1350.jpg 1800w, pixx_images/lunar_moon.jpg/lunar_moon_w2100h1575.jpg 2100w, pixx_images/lunar_moon.jpg/lunar_moon_w2400h1800.jpg 2400w, pixx_images/lunar_moon.jpg/lunar_moon_w2560h1920.jpg 2560w"
        />
        <img
          src="pixx_images/lunar_moon.jpg/lunar_moon-fallback_w2560h1920.jpg"
          sizes="auto"
          alt="pixx_image"
          width="2560"
          height="1920"
          loading="lazy"
          decoding="auto"
          fetchPriority="auto"
        />
      </picture>
    </div>
  );
}
```

</details>

</br>
<div align="center"><img src="images/color-divider-small.png" width="500" alt="pixx divider" /></div>

### Art Direction

- Uses the `picture` and `source` element with the `srcset`, `sizes` and `media` attributes.
- **Multiple images**. Browsers can choose between different images and their **size** and **type** to download based on the device viewport and pixel density.
- Switch different image formats based on first truthy _media_ condition.
- Fallback is `img` element.
- **Pros**
  - Switch image based viewport size.
- **Cons**
  - Code can be complex.
  - Order matters. Browser takes the first truthy value.

```tsx
import { pixx } from 'pixx';

export default function App() {
  return (
    <div>
      {/* happy face.jpg is 720x360. lunar moon.jpg is 2560x1920. */}
      {/* at least one media condition is required. */}
      {pixx(['./images/lunar moon.jpg', './images/happy face.jpg'], {
        media: ['(max-width: 400px) happy face.jpg', '(min-width: 401px) lunar moon.jpg'],
        sizes: ['(max-width: 400px) 100vw', '(min-width: 401px) 50vw', '100vw'],
      })}
    </div>
  );
}
```

<details>
  <summary><b><code>Art Direction Returns...</code></b></summary>

```tsx
// import { pixx } from 'pixx';

export default function App() {
  return (
    <div>
      {/* lunar moon.jpg is 2560x1920. happy face.jpg is 720x360. */}
      {/* at least one media condition is required. */}
      {/* {pixx(['./images/lunar moon.jpg', './images/happy face.jpg'], {
        media: ['(max-width: 400px) happy face.jpg', '(min-width: 401px) lunar moon.jpg'],
        sizes: ['(max-width: 400px) 100vw', '(min-width: 401px) 50vw', '100vw'],
      })} */}
      <picture>
        <source
          type="image/avif"
          media="(min-width: 401px)"
          sizes="(max-width: 400px) 100vw, (min-width: 401px) 50vw, 100vw"
          srcSet="pixx_images/lunar_moon.jpg/lunar_moon_w300h225.avif 300w, pixx_images/lunar_moon.jpg/lunar_moon_w600h450.avif 600w, pixx_images/lunar_moon.jpg/lunar_moon_w900h675.avif 900w, pixx_images/lunar_moon.jpg/lunar_moon_w1200h900.avif 1200w, pixx_images/lunar_moon.jpg/lunar_moon_w1500h1125.avif 1500w, pixx_images/lunar_moon.jpg/lunar_moon_w1800h1350.avif 1800w, pixx_images/lunar_moon.jpg/lunar_moon_w2100h1575.avif 2100w, pixx_images/lunar_moon.jpg/lunar_moon_w2400h1800.avif 2400w, pixx_images/lunar_moon.jpg/lunar_moon_w2560h1920.avif 2560w"
        />
        <source
          type="image/webp"
          media="(min-width: 401px)"
          sizes="(max-width: 400px) 100vw, (min-width: 401px) 50vw, 100vw"
          srcSet="pixx_images/lunar_moon.jpg/lunar_moon_w300h225.webp 300w, pixx_images/lunar_moon.jpg/lunar_moon_w600h450.webp 600w, pixx_images/lunar_moon.jpg/lunar_moon_w900h675.webp 900w, pixx_images/lunar_moon.jpg/lunar_moon_w1200h900.webp 1200w, pixx_images/lunar_moon.jpg/lunar_moon_w1500h1125.webp 1500w, pixx_images/lunar_moon.jpg/lunar_moon_w1800h1350.webp 1800w, pixx_images/lunar_moon.jpg/lunar_moon_w2100h1575.webp 2100w, pixx_images/lunar_moon.jpg/lunar_moon_w2400h1800.webp 2400w, pixx_images/lunar_moon.jpg/lunar_moon_w2560h1920.webp 2560w"
        />
        <source
          type="image/jpg"
          media="(min-width: 401px)"
          sizes="(max-width: 400px) 100vw, (min-width: 401px) 50vw, 100vw"
          srcSet="pixx_images/lunar_moon.jpg/lunar_moon_w300h225.jpg 300w, pixx_images/lunar_moon.jpg/lunar_moon_w600h450.jpg 600w, pixx_images/lunar_moon.jpg/lunar_moon_w900h675.jpg 900w, pixx_images/lunar_moon.jpg/lunar_moon_w1200h900.jpg 1200w, pixx_images/lunar_moon.jpg/lunar_moon_w1500h1125.jpg 1500w, pixx_images/lunar_moon.jpg/lunar_moon_w1800h1350.jpg 1800w, pixx_images/lunar_moon.jpg/lunar_moon_w2100h1575.jpg 2100w, pixx_images/lunar_moon.jpg/lunar_moon_w2400h1800.jpg 2400w, pixx_images/lunar_moon.jpg/lunar_moon_w2560h1920.jpg 2560w"
        />
        <source
          type="image/avif"
          media="(max-width: 400px)"
          sizes="(max-width: 400px) 100vw, (min-width: 401px) 50vw, 100vw"
          srcSet="pixx_images/happy_face.jpg/happy_face_w300h150.avif 300w, pixx_images/happy_face.jpg/happy_face_w600h300.avif 600w, pixx_images/happy_face.jpg/happy_face_w720h360.avif 720w"
        />
        <source
          type="image/webp"
          media="(max-width: 400px)"
          sizes="(max-width: 400px) 100vw, (min-width: 401px) 50vw, 100vw"
          srcSet="pixx_images/happy_face.jpg/happy_face_w300h150.webp 300w, pixx_images/happy_face.jpg/happy_face_w600h300.webp 600w, pixx_images/happy_face.jpg/happy_face_w720h360.webp 720w"
        />
        <source
          type="image/jpg"
          media="(max-width: 400px)"
          sizes="(max-width: 400px) 100vw, (min-width: 401px) 50vw, 100vw"
          srcSet="pixx_images/happy_face.jpg/happy_face_w300h150.jpg 300w, pixx_images/happy_face.jpg/happy_face_w600h300.jpg 600w, pixx_images/happy_face.jpg/happy_face_w720h360.jpg 720w"
        />
        <img
          src="pixx_images/happy_face.jpg/happy_face-fallback_w720h360.jpg"
          sizes="(max-width: 400px) 100vw, (min-width: 401px) 50vw, 100vw"
          alt="pixx_image"
          width="720"
          height="360"
          loading="lazy"
          decoding="auto"
          fetchPriority="auto"
        />
      </picture>
    </div>
  );
}
```

</details>

</br>
<div><img src="images/color-divider.png" width="838" alt="pixx divider" /></div>

## Responsive Image Tips

- Pixx creates images **_below-the-fold_** by default.
- Images **_above-the-fold_** (e.g. images you see as soon as the web page loads) should have `aboveTheFold: true` option set.
- If you would like also use a 'preload' image, set `withPreload: true` option.
  - The `<link preload ... />` tag printed to the console should be added to the `<head>` section.

</br>
<div><img src="images/color-divider.png" width="838" alt="pixx divider" /></div>

## Pixx Options

```tsx
pixx('image1.jpg', optionDefaults);

// Options Overview.
export const optionDefaults = {
  aboveTheFold: false, // Image will show on page load. Changes: loading: 'eager', fetchPriority: 'high', withBlur: true,
  alt: 'pixx_image', // alternate image description.
  backgroundSize: 'cover', // https://developer.mozilla.org/en-US/docs/Web/CSS/background-size
  blurSize: 16, // width of placeholder image in pixels. Smaller number, smaller placeholder image size.
  classes: [], // array of class names added to 'img' element.
  clean: false, // each run, delete images folder and create new.
  decoding: 'auto', // "auto" | "sync" | "async". Image download priority. https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/decoding
  fallbackWidth: 0, // 'original image width'. Custom fallback image width in pixels.
  fetchPriority: 'auto', // "auto" | "high" | "low". hints to browser image download importance. https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/fetchPriority
  heights: [], // only create images with these heights. Aspect ratio is preserved. (e.g. heights: [200, 400, 600]).
  jsx: true, // change to JSX syntax. (e.g. class becomes className).
  incrementSize: 300, // size in pixels to create the next smaller image.
  linuxPaths: true, // convert image path to linux. (e.g. false: "C:\images\myimage.jpg" vs. true: "/images/myimage.jpg").
  loading: 'lazy', // "eager" | "lazy". 'img' element loading priority. Above-the-fold images should be 'eager'.
  log: false, // Output build details to log file with same name as image. (e.g. img1.jpg => img1.jpg.log)
  media: [], // Art direction only. Set media condition for each to display image.
  newImagesDirectory: 'pixx_images', // directory name where images will be saved.
  omit: { remove: '', add: '' }, // modify the image path in the HTML.
  picTypes: ['avif', 'webp', 'jpg'], // "avif" | "gif" | "jpeg" | "jpg" | "png" | "tiff" | "webp".
  preloadWidth: 0, // '30% of fallbackWidth'. Preload image is lower resolution.
  showProgressBar: true, // display progress bar of image creation progress.
  sizes: ['auto'], // media conditions that informs browser how much of the screen width image will need. Browser decides best image to download based on it's screen size and 'srcset' attribute. https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/sizes https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img#sizes
  styles: [], // key:value[]. 'img' element 'style' attribute. (e.g. styles: ["color: 'blue'", "lineHeight : 10", "padding: 20" ]).
  title: '', // Text to display as tooltip when hover over image.
  v: [], // placeholder for dynamic variables.
  vite: false, // auto set options for Vite public folder. (e.g. true: newImagesDirectory: 'public' and omit: { remove: 'public/'} )
  widths: [], // only create images with these 'widths'. (e.g. widths: [300, 900, 1200]).
  withAnimation: false, // notifies the 'sharp' image library to keep image animation when creating new images.
  withBlur: false, // when 'true', creates inline style base64DataURL.
  withMetadata: false, // notify 'sharp' to copy original image metadata when creating new image.
  withPreload: false, // if true, create preload image.
} as OptionType;
```

### Examples

<details>
  <summary><b><code>Blur and LQIP Placeholder</code></b> <i>aboveTheFold, backgroundSize, blurSize, decoding, fetchPriority, loading, preloadFetchPriority, preloadWidth, withBlur, withPreload</i></summary>

- **LQIP**: low-quality image placeholders.
  - Inspired by [csswizardry](https://csswizardry.com/2023/09/the-ultimate-lqip-lcp-technique/).
  - **What is Preloading and base64URL?**
    - It's a way to improve perceived speed an image loads on a website. Basically, you show a blurry version of the image first, then show a low resolution image and then replace it with the full-quality image once it's downloaded. This makes the page feel faster and less jarring for the user.
      - `withPreload` only adds benefit when your dealing with very slow connections (slow 3g).
      1. **base64 image URL Placeholder**: The first LQIP is a very small, blurry image encoded directly into the webpage's code as a `base64 dataURL`. This creates the initial blur effect you see while the actual image loads.
      2. **Low-Resolution Image**: The second LQIP is a slightly higher-resolution image, about **1/3** the size of the final image (you can adjust this with the `preloadWidth` option). A special `preload` tag for this image is printed to the console. You should then copy this tag and paste it into the `<head>` section of your **HTML**.
  - **How Preloading Works**
    - When the browser sees the `preload` tag in the `<head>`, it starts downloading the low-resolution image right away, even before it finishes reading the rest of the page.
    - Once this low-resolution image is downloaded, it's displayed as a placeholder until the full-resolution image is ready.
    - **Both** LQIPs are applied as a `background-image` within a `<style>` tag.
- **aboveTheFold**: _boolean_
  - Default `false`. When `true`, turns on the following options:
    - `loading: 'eager', fetchPriority: 'high', withBlur: true`.
    - If you want the 'preload' image, use the `withPreload: true` option.
- **backgroundSize**: _string_
  - Default `cover`. Change the `background-size` value for blur placeholder.
  - Controls how the blurred placeholder image is sized.
    - Think of it like setting a background image to "cover" the entire area, "contain" it within the area, or "stretch" it to fit.
  - This only works if you also turn on the `withBlur: true` option.
  - For more details on how background-size works, check out this link: [MDN background-size](https://developer.mozilla.org/en-US/docs/Web/CSS/background-size)
- **blurSize**: _number_
  - Default `16` pixels. Number of pixels **wide** the _placeholder_ image is resized to.
  - Determines the size of the small placeholder image used to create the blur effect.
  - Larger _blurSize_, larger _blurDataURL_.
  - The `blurDataURL` is a `webp` image encoded in `base64`.
- **decoding**:_string_
  - Default `auto`. Options: sync | async | auto
  - hint to browser how it should decode content relative to other content.
  - Note: difference in values make no noticeable difference in performance.
  - <https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/decoding>
- **fetchPriority**: _string_
  - Default `auto`. Options: "auto" | "high" | "low".
  - hints to the browser how it should prioritize fetching a resource relative to other resources.
  - <https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/fetchPriority>
- **loading**: _string_
  - Default `lazy`. Options: lazy | eager.
  - hint to browser when to load image outside viewport.
  - <https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/loading>
- **preloadWidth**: _number_
  - Default `30% of fallbackWidth`.
  - Preload image is a lower resolution image placeholder that can help show webpage when internet data is very slow.
- **withBlur**: _boolean_
  - Default `false`. When `true`, **base64DataURL** will be inlined in the 'style' tags 'backgroundImage' attribute.
- **withPreload**: _boolean_
  - Default `false`. When `true`, the **preload image URL** will be inlined in the 'style' tags 'backgroundImage' attribute.
  - `withPreload` only adds benefit when your dealing with very slow connections (slow 3g).
  - `withPreload: true` will automatically set `fetchPriority: 'high'`.
  - Prints to console a `<link preload />` tag. Add this tag to the HTML's `<head>` section.
    - This tag tells the browser to load the image early on, so it appears faster.
    - This option is related to a technique called **LQIP** (Low-Quality Image Placeholder).

```tsx
import { pixx } from 'pixx';

export default function App() {
  return (
    <div>
      {/* lunar moon.jpg is 2560x1920 */}
      {pixx('./images/lunar moon.jpg', {
        aboveTheFold: true,
        withPreload: true,
        preloadWidth: 200,
        backgroundSize: 'contain',
      })}
    </div>
  );
}

// Returns 👇
// import { pixx } from 'pixx';

export default function App() {
  return (
    <div>
      {/* lunar moon.jpg is 2560x1920 */}
      {/* {pixx('./images/lunar moon.jpg', {
        aboveTheFold: true,
        withPreload: true,
        preloadWidth: 200,
        backgroundSize: 'contain',
      })} */}
      <picture>
        <source
          type="image/avif"
          sizes="auto"
          srcSet="pixx_images/lunar_moon.jpg/lunar_moon_w300h225.avif 300w, pixx_images/lunar_moon.jpg/lunar_moon_w600h450.avif 600w, pixx_images/lunar_moon.jpg/lunar_moon_w900h675.avif 900w, pixx_images/lunar_moon.jpg/lunar_moon_w1200h900.avif 1200w, pixx_images/lunar_moon.jpg/lunar_moon_w1500h1125.avif 1500w, pixx_images/lunar_moon.jpg/lunar_moon_w1800h1350.avif 1800w, pixx_images/lunar_moon.jpg/lunar_moon_w2100h1575.avif 2100w, pixx_images/lunar_moon.jpg/lunar_moon_w2400h1800.avif 2400w, pixx_images/lunar_moon.jpg/lunar_moon_w2560h1920.avif 2560w"
        />
        <source
          type="image/webp"
          sizes="auto"
          srcSet="pixx_images/lunar_moon.jpg/lunar_moon_w300h225.webp 300w, pixx_images/lunar_moon.jpg/lunar_moon_w600h450.webp 600w, pixx_images/lunar_moon.jpg/lunar_moon_w900h675.webp 900w, pixx_images/lunar_moon.jpg/lunar_moon_w1200h900.webp 1200w, pixx_images/lunar_moon.jpg/lunar_moon_w1500h1125.webp 1500w, pixx_images/lunar_moon.jpg/lunar_moon_w1800h1350.webp 1800w, pixx_images/lunar_moon.jpg/lunar_moon_w2100h1575.webp 2100w, pixx_images/lunar_moon.jpg/lunar_moon_w2400h1800.webp 2400w, pixx_images/lunar_moon.jpg/lunar_moon_w2560h1920.webp 2560w"
        />
        <source
          type="image/jpg"
          sizes="auto"
          srcSet="pixx_images/lunar_moon.jpg/lunar_moon_w300h225.jpg 300w, pixx_images/lunar_moon.jpg/lunar_moon_w600h450.jpg 600w, pixx_images/lunar_moon.jpg/lunar_moon_w900h675.jpg 900w, pixx_images/lunar_moon.jpg/lunar_moon_w1200h900.jpg 1200w, pixx_images/lunar_moon.jpg/lunar_moon_w1500h1125.jpg 1500w, pixx_images/lunar_moon.jpg/lunar_moon_w1800h1350.jpg 1800w, pixx_images/lunar_moon.jpg/lunar_moon_w2100h1575.jpg 2100w, pixx_images/lunar_moon.jpg/lunar_moon_w2400h1800.jpg 2400w, pixx_images/lunar_moon.jpg/lunar_moon_w2560h1920.jpg 2560w"
        />
        <img
          src="pixx_images/lunar_moon.jpg/lunar_moon-fallback_w2560h1920.jpg"
          style={{
            backgroundImage:
              'url("pixx_images/lunar_moon.jpg/lunar_moon-preload_w200h150.webp"), url("data:image/webp;base64,/9j/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAQABUDASIAAhEBAxEB/8QAGAAAAgMAAAAAAAAAAAAAAAAAAAYEBQf/xAAlEAABAwIFBQEBAAAAAAAAAAABAgMFAAQGBxETIRIxQVGhUnH/xAAVAQEBAAAAAAAAAAAAAAAAAAAFBP/EACQRAAECBAUFAAAAAAAAAAAAAAECAwAFETEEEyFhkRRBUeHw/9oADAMBAAIRAxEAPwBFy/y/EtHKkZFe1bA6JJ41P9Pim5GXcNfb7VrctOLZPQ4GlJUW1ejoeKguYbu5uMZUqQct0ISNWHQNtJH5SFafKponCUhYyz1xE3LrN0EFIcaf2+v3zz9FPqlGJKVlt5NfBGnN+BCuHm77KAjpqpNzoT6+7wn4yw3c4fmXLNQKgOUqHYjwaK0aRRMhaEybb1y6kaBa9pwgeuruaKpYlDpbGY4K7Wgd+bOJcIS2QN4//9k=")',
            backgroundSize: 'contain',
          }}
          sizes="auto"
          alt="pixx_image"
          width="2560"
          height="1920"
          loading="eager"
          decoding="auto"
          fetchPriority="high"
        />
      </picture>
    </div>
  );
}
```

</details>

<details>
  <summary><b><code>Classes and Styles</code></b><i> jsx, cn, dynamic_classes, v</i></summary>

- **jsx**: _boolean_.
  - Default `true`. Image class attribute fixed for JSX.
  - Changes:
  - | jsx: false (HTML) | jsx: true (JSX) |
    | ----------------- | --------------- |
    | class             | className       |
    | srcset            | srcSet          |
    | fetchpriority     | fetchPriority   |
    | background-image  | backgroundImage |
    | background-size   | backgroundSize  |
- **classes**: _string[]_
  - Default: []. static classes will not be added to the `cn` function.
  - If you want to run your static classes through the `cn` function (e.g. remove class clashes), add **'cn'** in the `classes` array.
  - **dynamic_classes**: _string[]_
    - Default []. **Only JSX can use dynamic**, HTML must be use JavaScript during runtime to change classes.
    - Because pixx runs and injects the HTML before the page is loaded, variables in the page are out of 'scope' to the pixx function. The variables become available after the page is parsed during runtime. To notify pixx a class is a variable, add a `d:` before the name. See example 👇.
    - Dynamic classes need the **cn** function imported.
    - [`npm i cncn`](https://www.npmjs.com/package/cncn).
      - Order matters. If classes clash, the last one wins.
- **linting errors**:
  - **Linters**: Linters are tools that analyze code for potential errors, inconsistencies, and style issues. One common warning linters give is for "**unused variables**" – variables that are defined but never actually used in the code.
  - **The 'v:' Solution**: Since the "d:" variables are strings and look unused to a linter, the linter will complain. The `v: [var1, var2, ...]` option gives you a spot variables can be listed.
  - **Internal Handling**: The pixx function internally removes these "d:" variables before processing, ensuring they don't cause any conflicts or errors during execution.
- **styles**: _string[]_
  - Default: `[]`.
  - HTML: _key:value_ pair of strings. (e.g. ['color: blue', 'line-height: 20', 'margin-top: 20px'])
    - HTML cannot use variables. Must use JavaScript to change styles during runtime.
  - JSX: _key:value_ pair of strings. (e.g. ["color: 'blue'", "lineHeight: 20", "marginTop: '20px'", "marginBottom: size"])
    - Notice all strings are quoted, numbers and variables are not quoted.
    - `marginBottom: size` // size is dynamic, it's still a string, but not quoted. See example 👇.
- **v**: _unknown[]_
  - Default: `[]`. `v` is a placeholder for variables, so linter does not complain. When pixx runs, v is removed.
  - (e.g. `v: [var1, var2, cn]`)

### HTML Example

```html
<!-- HTML -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body>
    <script>
      {
        pixx('./images/img4.avif', {
          jsx: false,
          classes: ['one', 'two', 'three'],
          styles: ['color: blue', 'line-height: 1.5', 'margin-top: 20px'], // html
          log: true,
        });
      }
    </script>
  </body>
</html>

<!-- Returns 👇 -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body>
    <!-- <script>
      {
        pixx('./images/img4.avif', {
          jsx: false,
          classes: ['one', 'two', 'three'],
          styles: ['color: blue', 'line-height: 1.5', 'margin-top: 20px'], // html
          log: true,
        });
      }
    </script> -->
    <picture>
      <!-- ... -->
      <img
        src="pixx_images/img4.avif/img4-fallback_w626h351.jpg"
        style="color: blue; line-height: 1.5; margin-top: 20px"
        class="one"
        two
        three
        sizes="auto"
        alt="pixx_image"
        width="626"
        height="351"
        loading="lazy"
        decoding="auto"
        fetchpriority="auto"
      />
    </picture>
  </body>
</html>
```

### JSX Example

```tsx
// JSX Classes & Styles
import { pixx } from 'pixx';
import cn from 'cncn';

export default function App() {
  const size = 1.5;
  const classString = 'three';
  return (
    <div>
      {pixx('./images/dynamic-class.avif', {
        classes: ['one', 'cn', 'two', 'd:classString'],
        styles: ["color: 'blue'", "lineHeight: '20px'", 'marginTop: 20', 'marginBottom: size'], // jsx
        v: [cn, classString, size],
        log: true,
      })}
    </div>
  );
}

// Returns 👇
// import { pixx } from 'pixx';
import cn from 'cncn';

export default function App() {
  const size = 1.5;
  const classString = 'three';
  return (
    <div>
      {/* {pixx('./images/dynamic-class.avif', {
        classes: ['one', 'cn', 'two', 'd:classString'],
        styles: ["color: 'blue'", "lineHeight: '20px'", 'marginTop: 20', 'marginBottom: size'], // jsx
        v: [cn, classString, size],
        log: true,
      })} */}
      <picture>
        {/* ... */}
        <img
          src="pixx_images/dynamic-class.avif/dynamic-class-fallback_w626h351.jpg"
          style={{ color: 'blue', lineHeight: '20px', marginTop: 20, marginBottom: size }}
          className={cn('one', 'two', classString)}
          sizes="auto"
          alt="pixx_image"
          width="626"
          height="351"
          loading="lazy"
          decoding="auto"
          fetchPriority="auto"
        />
      </picture>
    </div>
  );
}
```

</details>

<details>
  <summary><b><code>Image Attributes</code></b><i> alt, picTypes, title</i></summary>

- **alt**: _string_
  - Default `pixx_image`. The img `alt` attribute.
- **picTypes**: _enums('avif', 'gif', 'jpeg', 'jpg', 'png', 'tiff', 'webp')[]_
  - Default `['avif', 'webp', 'jpg']`.
  - Images will be created as these types.
- **title**: _string_
  - Default `''`. Text to display as tooltip when hover over image.

```tsx
import { pixx } from 'pixx';

export default function App() {
  return (
    <div>
      {/* lunar moon.jpg is 2560x1920 */}
      {pixx('./images/lunar moon.jpg', {
        alt: 'picture of moon',
        title: 'Moon Shot',
        picTypes: ['avif', 'gif', 'tiff'],
      })}
    </div>
  );
}

// Returns 👇
// import { pixx } from 'pixx';

export default function App() {
  return (
    <div>
      {/* lunar moon.jpg is 2560x1920 */}
      {/* {pixx('./images/lunar moon.jpg', {
        alt: 'picture of moon',
        title: 'Moon Shot',
        picTypes: ['avif', 'gif', 'tiff'],
      })} */}
      <picture>
        <source
          type="image/avif"
          sizes="auto"
          srcSet="pixx_images/lunar_moon.jpg/lunar_moon_w300h225.avif 300w, pixx_images/lunar_moon.jpg/lunar_moon_w600h450.avif 600w, pixx_images/lunar_moon.jpg/lunar_moon_w900h675.avif 900w, pixx_images/lunar_moon.jpg/lunar_moon_w1200h900.avif 1200w, pixx_images/lunar_moon.jpg/lunar_moon_w1500h1125.avif 1500w, pixx_images/lunar_moon.jpg/lunar_moon_w1800h1350.avif 1800w, pixx_images/lunar_moon.jpg/lunar_moon_w2100h1575.avif 2100w, pixx_images/lunar_moon.jpg/lunar_moon_w2400h1800.avif 2400w, pixx_images/lunar_moon.jpg/lunar_moon_w2560h1920.avif 2560w"
        />
        <source
          type="image/tiff"
          sizes="auto"
          srcSet="pixx_images/lunar_moon.jpg/lunar_moon_w300h225.tiff 300w, pixx_images/lunar_moon.jpg/lunar_moon_w600h450.tiff 600w, pixx_images/lunar_moon.jpg/lunar_moon_w900h675.tiff 900w, pixx_images/lunar_moon.jpg/lunar_moon_w1200h900.tiff 1200w, pixx_images/lunar_moon.jpg/lunar_moon_w1500h1125.tiff 1500w, pixx_images/lunar_moon.jpg/lunar_moon_w1800h1350.tiff 1800w, pixx_images/lunar_moon.jpg/lunar_moon_w2100h1575.tiff 2100w, pixx_images/lunar_moon.jpg/lunar_moon_w2400h1800.tiff 2400w, pixx_images/lunar_moon.jpg/lunar_moon_w2560h1920.tiff 2560w"
        />
        <source
          type="image/gif"
          sizes="auto"
          srcSet="pixx_images/lunar_moon.jpg/lunar_moon_w300h225.gif 300w, pixx_images/lunar_moon.jpg/lunar_moon_w600h450.gif 600w, pixx_images/lunar_moon.jpg/lunar_moon_w900h675.gif 900w, pixx_images/lunar_moon.jpg/lunar_moon_w1200h900.gif 1200w, pixx_images/lunar_moon.jpg/lunar_moon_w1500h1125.gif 1500w, pixx_images/lunar_moon.jpg/lunar_moon_w1800h1350.gif 1800w, pixx_images/lunar_moon.jpg/lunar_moon_w2100h1575.gif 2100w, pixx_images/lunar_moon.jpg/lunar_moon_w2400h1800.gif 2400w, pixx_images/lunar_moon.jpg/lunar_moon_w2560h1920.gif 2560w"
        />
        <img
          src="pixx_images/lunar_moon.jpg/lunar_moon-fallback_w2560h1920.jpg"
          sizes="auto"
          alt="picture of moon"
          width="2560"
          height="1920"
          title="Moon Shot"
          loading="lazy"
          decoding="auto"
          fetchPriority="auto"
        />
      </picture>
    </div>
  );
}
```

</details>

<details>
  <summary><b><code>Responsive Images</code></b><i>media, sizes</i></summary>

- **media**: _string[]_
  - Default `[]`. Array of media conditions and image names.
  - **Art Direction only**. Must provide two or more images. Media condition must match each image.
  - Specify different images to be displayed based on the user's screen size or device orientation. This technique is often called **art direction**.
  - A _media query_ that describes a specific screen size or device orientation (e.g., `(max-width: 768px)` for smaller screens or `(orientation: landscape)` for landscape mode).
  - The **last** image provided in `image names` array will used as the **fallback image**.
  - **Art direction allows you to**:
    - **Optimize for different screen sizes**: You can use smaller images for mobile devices, saving bandwidth and improving loading times.
    - **Improve composition**: You can crop or adjust images to look their best at different sizes and orientations.
    - **Provide a better user experience**: By tailoring images to the user's device, you can create a more visually appealing and engaging website.
    - **Learn More**:
      - [HTML Responsive Images](https://danburzo.ro/responsive-images-html/)
      - [Responsive Images 101](https://cloudfour.com/thinks/responsive-images-101-definitions/)
      - [HTML srcset](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/srcset)
- **sizes**
  - Default `['100vw']`. Array of media conditions and the viewport fill _width_.
  - The `sizes` option, which is used to provide hints to the browser about how much space an image will take up on the screen. This information helps the browser make better decisions about which image to load, especially when you have different sizes of the same image available (like in responsive images).
  - **Each string has two parts**:
    - **Media Condition**: A CSS media query that describes a specific screen size or device characteristic (e.g. (max-width: 768px) for smaller screens).
    - **Media Descriptor**: A CSS length value (e.g. 100vw, 30rem, or 500px) that tells the browser how much of the viewport width the image will occupy when that media condition is met. Note that **percentages are not allowed** here.
  - **How Browsers Use `sizes`**: The browser looks at the _sizes media conditions_ you've provided and compares them to the user's current screen size. It then uses the corresponding viewport fill width to estimate the image's display size. This helps the browser choose the most appropriate image source from a srcset attribute (which lists different image sources).
  - **Default Value**: If no `sizes media conditions` match, the browser uses the **default** (last value) in the `sizes` array as the default. The default value is `auto`, which means the browser will use the image width and height to determine viewport fill.
  - [MDN sizes](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/sizes).

```tsx
// Sizes Example
// First 'true' condition is taken.
// If viewport width is 500px or less, the image will take 75% of it.
// If viewport width is 800px or less, the image will take 50% of it.
// If viewport width is larger than 800px, the image will take 25% of it.
pixx('img.jpg', { sizes: ['(max-width: 500px) 75vw', '(max-width: 800px) 50vw', '25vw'] });

// Sizes & Media Example
// the fallback image will be the last image provided to pixx ('happy face.jpg').
import { pixx } from 'pixx';

export default function App() {
  return (
    <div>
      {/* happy face.jpg is 720x360. lunar moon.jpg is 2560x1920. */}
      {/* at least one media condition is required. */}
      {pixx(['./images/lunar moon.jpg', './images/happy face.jpg'], {
        media: ['(max-width: 400px) happy face.jpg', '(min-width: 401px) lunar moon.jpg'], // media condition imageName
        sizes: ['(max-width: 400px) 100vw', '(min-width: 401px) 50vw', '100vw'], // last one is default size.
      })}
    </div>
  );
}

// Returns 👇
// import { pixx } from 'pixx';

export default function App() {
  return (
    <div>
      {/* happy face.jpg is 720x360. lunar moon.jpg is 2560x1920. */}
      {/* at least one media condition is required. */}
      {/* {pixx(['./images/lunar moon.jpg', './images/happy face.jpg'], {
        media: ['(max-width: 400px) happy face.jpg', '(min-width: 401px) lunar moon.jpg'], // media condition imageName
        sizes: ['(max-width: 400px) 100vw', '(min-width: 401px) 50vw', '100vw'], // last one is default size.
      })} */}
      <picture>
        <source
          type="image/avif"
          media="(min-width: 401px)"
          sizes="(max-width: 400px) 100vw, (min-width: 401px) 50vw, 100vw"
          srcSet="pixx_images/lunar_moon.jpg/lunar_moon_w300h225.avif 300w, pixx_images/lunar_moon.jpg/lunar_moon_w600h450.avif 600w, pixx_images/lunar_moon.jpg/lunar_moon_w900h675.avif 900w, pixx_images/lunar_moon.jpg/lunar_moon_w1200h900.avif 1200w, pixx_images/lunar_moon.jpg/lunar_moon_w1500h1125.avif 1500w, pixx_images/lunar_moon.jpg/lunar_moon_w1800h1350.avif 1800w, pixx_images/lunar_moon.jpg/lunar_moon_w2100h1575.avif 2100w, pixx_images/lunar_moon.jpg/lunar_moon_w2400h1800.avif 2400w, pixx_images/lunar_moon.jpg/lunar_moon_w2560h1920.avif 2560w"
        />
        <source
          type="image/webp"
          media="(min-width: 401px)"
          sizes="(max-width: 400px) 100vw, (min-width: 401px) 50vw, 100vw"
          srcSet="pixx_images/lunar_moon.jpg/lunar_moon_w300h225.webp 300w, pixx_images/lunar_moon.jpg/lunar_moon_w600h450.webp 600w, pixx_images/lunar_moon.jpg/lunar_moon_w900h675.webp 900w, pixx_images/lunar_moon.jpg/lunar_moon_w1200h900.webp 1200w, pixx_images/lunar_moon.jpg/lunar_moon_w1500h1125.webp 1500w, pixx_images/lunar_moon.jpg/lunar_moon_w1800h1350.webp 1800w, pixx_images/lunar_moon.jpg/lunar_moon_w2100h1575.webp 2100w, pixx_images/lunar_moon.jpg/lunar_moon_w2400h1800.webp 2400w, pixx_images/lunar_moon.jpg/lunar_moon_w2560h1920.webp 2560w"
        />
        <source
          type="image/jpg"
          media="(min-width: 401px)"
          sizes="(max-width: 400px) 100vw, (min-width: 401px) 50vw, 100vw"
          srcSet="pixx_images/lunar_moon.jpg/lunar_moon_w300h225.jpg 300w, pixx_images/lunar_moon.jpg/lunar_moon_w600h450.jpg 600w, pixx_images/lunar_moon.jpg/lunar_moon_w900h675.jpg 900w, pixx_images/lunar_moon.jpg/lunar_moon_w1200h900.jpg 1200w, pixx_images/lunar_moon.jpg/lunar_moon_w1500h1125.jpg 1500w, pixx_images/lunar_moon.jpg/lunar_moon_w1800h1350.jpg 1800w, pixx_images/lunar_moon.jpg/lunar_moon_w2100h1575.jpg 2100w, pixx_images/lunar_moon.jpg/lunar_moon_w2400h1800.jpg 2400w, pixx_images/lunar_moon.jpg/lunar_moon_w2560h1920.jpg 2560w"
        />
        <source
          type="image/avif"
          media="(max-width: 400px)"
          sizes="(max-width: 400px) 100vw, (min-width: 401px) 50vw, 100vw"
          srcSet="pixx_images/happy_face.jpg/happy_face_w300h150.avif 300w, pixx_images/happy_face.jpg/happy_face_w600h300.avif 600w, pixx_images/happy_face.jpg/happy_face_w720h360.avif 720w"
        />
        <source
          type="image/webp"
          media="(max-width: 400px)"
          sizes="(max-width: 400px) 100vw, (min-width: 401px) 50vw, 100vw"
          srcSet="pixx_images/happy_face.jpg/happy_face_w300h150.webp 300w, pixx_images/happy_face.jpg/happy_face_w600h300.webp 600w, pixx_images/happy_face.jpg/happy_face_w720h360.webp 720w"
        />
        <source
          type="image/jpg"
          media="(max-width: 400px)"
          sizes="(max-width: 400px) 100vw, (min-width: 401px) 50vw, 100vw"
          srcSet="pixx_images/happy_face.jpg/happy_face_w300h150.jpg 300w, pixx_images/happy_face.jpg/happy_face_w600h300.jpg 600w, pixx_images/happy_face.jpg/happy_face_w720h360.jpg 720w"
        />
        <img
          src="pixx_images/happy_face.jpg/happy_face-fallback_w720h360.jpg"
          sizes="(max-width: 400px) 100vw, (min-width: 401px) 50vw, 100vw"
          alt="pixx_image"
          width="720"
          height="360"
          loading="lazy"
          decoding="auto"
          fetchPriority="auto"
        />
      </picture>
    </div>
  );
}
```

</details>

<details>
  <summary><b><code>Image Sizes</code></b><i>defaultSizes, fallbackWidth, incrementSize, heights, preloadWidth, widths</i></summary>

### DefaultSizes, IncrementSize, Heights, and Widths

- These options give you control over the resizing process. You can either:
  - Provide specific sizes using `widths[]` or `heights[]`.
  - Let the tool automatically generate sizes at intervals using `incrementSize`.
  - **Prioritization**: If you use `widths`, those will take precedence over `heights`. Both widths and heights have higher priority than `defaultSizes`.
- **defaultSizes**:
  - If `widths` or `heights` are not provided, uses `incrementSize` to create images smaller than width of original image.
  - (e.g. If image is 1000px wide and incrementSize is 300. Pixx will create images: 300, 600, 900, 1000 wide, keeping same aspect ratio).
- **heights**: _number[]_
  - Default `[]`. Array of numbers representing desired height in pixels.
  - This option lets you specify an array of heights (in pixels) for the generated images.
  - For example, `heights: [200, 400, 600]` would create three versions of the image with those specific heights.
  - **Important**: The heights you provide cannot be larger than the original image's height. The tool won't upscale your images.
- **incrementSize**: _number_
  - Default `300`. Create images in steps of 300 pixels _wide_ (e.g. 300px, 600px, 900px, etc.).
  - This option controls the automatic size increments when you don't provide specific `widths` or `heights`.
- **widths**: _number[]_
  - Default `[]`. Array of widths to create images.
  - This option is similar to `heights`, but it lets you specify an array of widths (in pixels) for the generated images.
  - **Example**: `widths: [300, 500, 650, 900, 1200]` would create images with those specific widths.
  - **Prioritization**: `widths` have the highest priority, followed by `heights`, and then `defaultSizes`.

### FallbackWidth & PreloadWidth

- **fallbackWidth**: _number_
  - Default `original image width`. Custom fallback image width in pixels.
  - The fallback image is specifically for older browsers that may not be able to handle the optimized images.
  - The `fallbackWidth` option lets you specify the _width_ of a fallback image in pixels.
  - The fallback image will always be a _JPEG_ (`jpg`) format. This is a widely supported format that works well in most browsers. Importantly, the fallbackWidth cannot be larger than the original image's width.
  - **Relationship with `media` (Art Direction)**:
    - Art Direction is displaying different images based on the 'truthy' _media condition_.
    - The last image provided in `media` array will used as the fallback image.
- **preloadWidth**: _number_
  - Default `30% of the fallbackWidth`.
  - The `preloadWidth` overrides this behavior and allows you to have a customize the `low-resolution` image size.
  - `withPreload: true` must be used to have a preload image.

```tsx

```

</details>

<details>
  <summary><b><code>Image Creation</code></b><i> clean, withAnimation, withMetadata</i></summary>

- **clean**: _boolean_
  - Default `false`. Delete image folder and create new each pixx function. Useful to start fresh.
  - **Use caution with frameworks**. Server/Client Frameworks tend to run multiple times each page to parse necessary files. Each image WILL be remade multiple times from each pixx function. This will slow down the 'dev' environment tremendously!
- **withAnimation**: _boolean_.
  - Default `false`. Sharp image library will retain the image animation. (e.g. `webp` or `gif` images).
- **withMetadata**: _boolean_.
  - Default `false`. Sharp image library will copy original image metadata to newly created images.

```tsx
pixx('img.jpg', { withAnimation: true, withMetadata: true, clean: true });
```

</details>

<details>
  <summary><b><code>Image Paths</code></b><i> linuxPaths, newImagesDirectory, omit, vite</i></summary>

- These options provide flexibility in managing image paths, especially when working with different operating systems, frameworks, or custom project structures. They help ensure that your images are stored and referenced correctly in your web application.
- **linuxPaths**: _boolean_
  - Default `true`.
  - This option is useful for developers who work on a Windows machine but deploy their website to a Linux server.
  - Windows and Linux use different formats for file paths (e.g. "C:\images\myimage.jpg" vs. "/images/myimage.jpg").
  - When linuxPaths is set to true (which is the default), the tool will automatically convert html image paths to the Linux format. This ensures that your images will work correctly when you deploy your site to a Linux server.
- **omit**: _{ remove?: string, add?: string }_
  - Default `{ remove: '', add: '' }`. Object with `remove` and `add` properties.
  - This option provides fine-grained control over how image paths are generated in your HTML.
  - It allows you to:
    - `remove`: Remove a specific part of the image path.
    - `add`: Add a custom string to the image path.
    - **Example**: `omit: { remove: 'pixx_images', add: './my-special-path' }` would replace "pixx_images" with "./my-special-path".
    - **Important**: This option only modifies the **image path in the HTML**; it doesn't change where the actual image files are stored.
- **newImagesDirectory**: _string_
  - Default `pic_images`.
  - This option lets you specify the name of the directory where the optimized images will be saved.
- **vite**: _boolean_
  - Default `false`.
  - Shortcut for developers using the Vite build tool.
  - When set to `true`, it sets `newImagesDirectory` to 'public' and configures omit to correctly handle image paths within Vite projects.
  - Vite image directory must be in the public folder for images to be automatically copied over when building.
  - When using the 'vite-plugin-pixx', `vite: true` is automatically set.

```tsx
import { pixx } from 'pixx';

export default function App() {
  return (
    <div>
      {/* happy face.jpg is 720x360. */}
      {pixx('./images/happy face.jpg', {
        newImagesDirectory: 'all-my-images',
        omit: { remove: 'all-my-images', add: 'special-directory' },
      })}
    </div>
  );
}

// import { pixx } from 'pixx';

export default function App() {
  return (
    <div>
      {/* happy face.jpg is 720x360. */}
      {/* {pixx('./images/happy face.jpg', {
        newImagesDirectory: 'all-my-images',
        omit: { remove: 'all-my-images', add: 'special-directory' },
      })} */}
      <picture>
        <source
          type="image/avif"
          sizes="auto"
          srcSet="special-directory/happy_face.jpg/happy_face_w300h150.avif 300w, special-directory/happy_face.jpg/happy_face_w600h300.avif 600w, special-directory/happy_face.jpg/happy_face_w720h360.avif 720w"
        />
        <source
          type="image/webp"
          sizes="auto"
          srcSet="special-directory/happy_face.jpg/happy_face_w300h150.webp 300w, special-directory/happy_face.jpg/happy_face_w600h300.webp 600w, special-directory/happy_face.jpg/happy_face_w720h360.webp 720w"
        />
        <source
          type="image/jpg"
          sizes="auto"
          srcSet="special-directory/happy_face.jpg/happy_face_w300h150.jpg 300w, special-directory/happy_face.jpg/happy_face_w600h300.jpg 600w, special-directory/happy_face.jpg/happy_face_w720h360.jpg 720w"
        />
        <img
          src="special-directory/happy_face.jpg/happy_face-fallback_w720h360.jpg"
          sizes="auto"
          alt="pixx_image"
          width="720"
          height="360"
          loading="lazy"
          decoding="auto"
          fetchPriority="auto"
        />
      </picture>
    </div>
  );
}

// Vite Example
import { pixx } from 'pixx';

export default function App() {
  return (
    <div>
      {/* happy face.jpg is 720x360. */}
      {pixx('./images/happy face.jpg', {
        vite: true, // same as: newImagesDirectory = 'public'. omit = { remove = 'public/'}.
      })}
    </div>
  );
}

// Returns 👇
// import { pixx } from 'pixx';

export default function App() {
  return (
    <div>
      {/* happy face.jpg is 720x360. */}
      {/* {pixx('./images/happy face.jpg', {
        vite: true, // same as: newImagesDirectory = 'public'. omit = { remove = 'public/'}.
      })} */}
      <picture>
        <source
          type="image/avif"
          sizes="auto"
          srcSet="happy_face.jpg/happy_face_w300h150.avif 300w, happy_face.jpg/happy_face_w600h300.avif 600w, happy_face.jpg/happy_face_w720h360.avif 720w"
        />
        <source
          type="image/webp"
          sizes="auto"
          srcSet="happy_face.jpg/happy_face_w300h150.webp 300w, happy_face.jpg/happy_face_w600h300.webp 600w, happy_face.jpg/happy_face_w720h360.webp 720w"
        />
        <source
          type="image/jpg"
          sizes="auto"
          srcSet="happy_face.jpg/happy_face_w300h150.jpg 300w, happy_face.jpg/happy_face_w600h300.jpg 600w, happy_face.jpg/happy_face_w720h360.jpg 720w"
        />
        <img
          src="happy_face.jpg/happy_face-fallback_w720h360.jpg"
          sizes="auto"
          alt="pixx_image"
          width="720"
          height="360"
          loading="lazy"
          decoding="auto"
          fetchPriority="auto"
        />
      </picture>
    </div>
  );
}
```

</details>

<details>
  <summary><b><code>Logging:</code></b><i>log, showProgressBar</i></summary>

- **log**: _boolean_
  - Default `false`. Output build details to file with the image name. (e.g. image.jpg = image.jpg.log).
  - When set to `true`, it provides extensive information, including:
    - State of the image creation process.
    - Details about hidden image data (metadata), such as:
      - **EXIF**: Information about the camera settings used to take the image (e.g., exposure, ISO, date/time).
      - **XMP**: Extensible Metadata Platform, which can include various types of information like copyright, keywords, and descriptions.
      - **ICC**: Color profiles that ensure consistent color representation across different devices.
      - **GPS**: Geographical location where the image was taken.
- **showProgressBar**: _boolean_
  - Default `true`. This option controls whether a progress bar is displayed during the image creation process.

```tsx
pixx('img.jpg', { log: true, progressBar: false });
```

</details>

</br>
<div><img src="images/color-divider.png" width="838" alt="pixx divider" /></div>

### pixxFlow

- This tool acts like a helper that automatically finds the `pixx` function in your files, runs it, and adds the results to your web page.
- **Static File Scraper**: This tool scans your project files to find and process the `pixx` function. It uses the [NPM Glob](https://www.npmjs.com/package/glob) library (a popular Node.js module) to search for files matching a specific pattern.
- **How it Works**:
  1. **Find pixx Functions**: The tool searches your project files for instances of the `pixx` function.
  2. **Execute pixx Code**: When it finds a `pixx` function, it executes the code within that function.
  3. **Comment Out**: After execution, the tool comments out the original `pixx` function in the file. This prevents it from being executed again.
  4. **Add HTML**: The output generated by the `pixx` function (which is typically HTML code) is added to the page.
- **HTML Placement**: To use this tool, you need to place a single `pixx` function within a `<script>` tag in your **HTML** file.

<details>
  <summary><b><code>pixxFlow Options</code></b></summary>

- **Options**
  - **ignore**: _string[]_
    - Default `['node_modules/**', '**/pixx*']`.
    - This option specifies an array of file patterns to exclude from processing.
    - To ignore directories, append `/**` to name. (e.g. `node_modules/**`).
    - `pixxFlow` uses [glob](https://www.npmjs.com/package/glob) to ignore files.
  - **include**: _string[]_
    - Default `['**/*.html', '**/*.jsx', '**/*.tsx']`.
    - This option specifies an array of file patterns to include in the processing.
    - `pixxFlow` uses [glob](https://www.npmjs.com/package/glob) to search for files.
  - **log**: _boolean_
    - Default `false`.
    - This option controls whether debugging information is printed to the console.
  - **overwrite**: _boolean_
    - Default `false`.
    - This option determines whether the tool overwrites the original file or creates a new file prefixed with `pixx-`.
      - (e.g., _myfile.jsx_ becomes _pixx-myfile.jsx_).
    - If set to `true`, the tool will overwrite the original file with the html output.

```js
// 1. Create a run file in root of directory. e.g. 'index.js'
// Add the following
import { pixxFlow } from 'pixx';
// simple
pixxFlow();
// or advanced
pixxFlow({
  log: true,
  include: ['**/*.html'],
  ignore: ['node_modules/**', '**/pixx*'],
  overwrite: false,
});

// 2. From your terminal, in the same directory as index.js file, run with node:
node index.js
```

</details>

</br>
<div><img src="images/color-divider.png" width="838" alt="pixx divider" /></div>

## Plugins

### Vite-Plugin-Pixx

- Plugin to be used with **Vite**.
- **pixxVitePlugin** will intercept static pages, run `pixx`, then return **HTML** to _Vite_ server.
- **Pixx is not run on client**, because it processes and transforms your code during **development**, leaving only the optimized output in **HTML** sent to client.
- `Pixx` functions wil not be included in **build**, only the **HTML**.

<details>
  <summary><b><code>PixxVitePlugin Options</code></b></summary>

- **Options**
  - **log**: _boolean_
    - Default `false`.
    - This option controls whether debugging information is printed to the terminal.
  - **overwrite**: _boolean_
    - Default `false`.
    - This option determines whether the tool overwrites the original file.
    - If set to `true`, the tool will overwrite the original file with **HTML** code and comment out `pixx` functions.
    - `Pixx` function will not run again, once the code is commented out. This can speed up development when you have finalized images.
  - **isHTML**: _boolean_
    - comment out the `pixx` function as HTML or JSX syntax.
    - (e.g. <!-- HTML --> or {/_ JSX _/})

```tsx
// vite.config.js
import { defineConfig } from 'vite';
import { pixxVitePlugin } from 'pixx';

// https://vite.dev/config/
export default defineConfig({
  plugins: [pixxVitePlugin({ log: true, overwrite: true })],
});
```

</details>

</br>
<div><img src="images/color-divider.png" width="838" alt="pixx divider" /></div>

## License

Published under the Apache-2.0 license. © Bryon Smith 2024.
