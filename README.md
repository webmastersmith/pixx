# pixx

- [NPM pixx](https://www.npmjs.com/package/pixx)

## Why

- 🖼️ Creating **responsive images** (images that adapt to different screen sizes) can be **complicated** and prone to **errors**.
- ✨ `Pixx` generates both the **responsive images** themselves and the corresponding **HTML** code needed to display them correctly.
- ⏩ Using the _[sharp](https://sharp.pixelplumbing.com/)_ library, (a high-performance Node.js module for image processing), `pixx` efficiently creates different sizes and formats of your images.
- 💻 This package uses the _[NodeJS](https://nodejs.org/en/download/package-manager)_ environment.
- 📏 Pixx **does not increase image size**. Start with the **largest optimized image** for best results.
- 🔧 Pixx is designed to use in project **development**.
- 🔤 Your code must use double quote (ASCII 34 `"`) or single quote (ASCII 39 `'`). Fancy quotes other than these will break pixx logic.
- ⚠️ **Sharp error on Windows**: Could not load the "sharp" module using the win32-x64 runtime.
  - ✅ **Solution**: `npm install --include=optional sharp`

</br>
<div><img src="images/color-divider.png" width="838" alt="pixx divider" /></div>

## Simple Start

```tsx
// download
npm i -D pixx;


// commonjs
const { pixx } = require('pixx');
pixx('compass.jpg').then((HTML) => {});

// esm -package.json: "type": "module",
import { pixx } from 'pixx';
const HTML = await pixx('compass.jpg'); // size is 2560w x 1920h.
```

<details>
  <summary><b><code>Returns...</code></b></summary>

```tsx
// Creates these images 👇 and returns this HTML.
<picture>
  <source
    type="image/avif"
    sizes="100vw"
    srcSet="
      pixx_images/compass/compass-400w300h.avif    400w,
      pixx_images/compass/compass-800w600h.avif    800w,
      pixx_images/compass/compass-1200w900h.avif  1200w,
      pixx_images/compass/compass-1600w1200h.avif 1600w,
      pixx_images/compass/compass-2000w1500h.avif 2000w,
      pixx_images/compass/compass-2400w1800h.avif 2400w,
      pixx_images/compass/compass-2560w1920h.avif 2560w
    "
  />
  <source
    type="image/webp"
    sizes="100vw"
    srcSet="
      pixx_images/compass/compass-400w300h.webp    400w,
      pixx_images/compass/compass-800w600h.webp    800w,
      pixx_images/compass/compass-1200w900h.webp  1200w,
      pixx_images/compass/compass-1600w1200h.webp 1600w,
      pixx_images/compass/compass-2000w1500h.webp 2000w,
      pixx_images/compass/compass-2400w1800h.webp 2400w,
      pixx_images/compass/compass-2560w1920h.webp 2560w
    "
  />
  <source
    type="image/jpg"
    sizes="100vw"
    srcSet="
      pixx_images/compass/compass-400w300h.jpg    400w,
      pixx_images/compass/compass-800w600h.jpg    800w,
      pixx_images/compass/compass-1200w900h.jpg  1200w,
      pixx_images/compass/compass-1600w1200h.jpg 1600w,
      pixx_images/compass/compass-2000w1500h.jpg 2000w,
      pixx_images/compass/compass-2400w1800h.jpg 2400w,
      pixx_images/compass/compass-2560w1920h.jpg 2560w
    "
  />
  <img
    src="pixx_images/compass/compass-2560w1920h.jpg"
    alt="image"
    width="2560"
    height="1920"
    loading="eager"
    decoding="auto"
    fetchPriority="auto"
  />
</picture>
```

</details>

</br>
<div><img src="images/color-divider.png" width="838" alt="pixx divider" /></div>

## Understanding Responsive Images: Resolution Switching, Multiple Types, and Art Direction

- All 'responsive image methods' must have `<meta name="viewport" content="width=device-width">` added to the _head_ section of html, for _**mobile browsers**_ to use the actual device viewport in decision making.
- **Responsive Image Advantages**
  - When mobile or desktop browsers download and parse the HTML, the `sizes`, `srcset` and `media` attribute give clues to the browser about the best images to download.
  - Using these attributes, the browser decides the best image to download based on its viewport size and pixel density.
  - **srcset**: inform the browser of the available image widths.
  - **sizes**: inform the browser about how much of the viewport the image will fill.
  - **media**: completely different images can be offered depending on matching _media_ condition.

## Responsive Images

- Three main ways to use responsive images.
  1. Single image in multiple sizes. (e.g. img-100.jpg, img-200.jpg, img-300.jpg).
  2. Single image in multiple sizes and types. (e.g. avif, webp, jpg).
  3. Multiple different images the browser will choose depending on viewport width.
     1. (e.g. img-full.jpg, img-crop.jpg).

</br>
<div align="center"><img src="images/color-divider-small.png" width="500" alt="pixx divider" /></div>

### Resolution Switching

- Uses the `img` element with the `srcset` and `sizes` attributes.
- **Single image type**. Browsers can choose what image **size** to download based on the device viewport and pixel density.
- Fallback is the img `src` attribute.
- **Pros**
  - The least complex. Default _sizes_ attribute is `100vw`.
  - Can offer multiple image **size** options.
- **Cons**
  - Only single image type can be used at a time.

```jsx
// Single image type, multiple sizes.
// e.g. Device viewport has a width of 700px.
// The 'media condition' tells browser image will take 350px (50vw) of viewport.
// If viewport pixel density is 2x. Browser will choose >= 700px image. (compass-800w600h.webp)
await pixx('./compass.jpg', {
  picTypes: ['webp'],
  sizes: ['(max-width: 450px) 75vw', '(max-width: 800px) 50vw', '25vw'],
});
```

<details>
  <summary><b><code>Resolution Switching Returns...</code></b></summary>

```tsx
// Resolution Switching Returns
<img
  srcSet="
    pixx_images/compass/compass-400w300h.webp    400w,
    pixx_images/compass/compass-800w600h.webp    800w,
    pixx_images/compass/compass-1200w900h.webp  1200w,
    pixx_images/compass/compass-1600w1200h.webp 1600w,
    pixx_images/compass/compass-2000w1500h.webp 2000w,
    pixx_images/compass/compass-2400w1800h.webp 2400w,
    pixx_images/compass/compass-2560w1920h.webp 2560w
  "
  sizes="(max-width: 450px) 75vw, (max-width: 800px) 50vw, 25vw"
  src="pixx_images/compass/compass-2560w1920h.jpg"
  alt="image"
  width="2560"
  height="1920"
  loading="eager"
  decoding="async"
  fetchPriority="auto"
/>
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
await pixx('./src/compass.jpg', {
  title: 'Antique compass',
  alt: 'Image of an old compass',
  classes: ['my-special-class', 'border-blue-200'],
  styles: "{ color: 'blue', lineHeight : 10, padding: 20 }",
});
```

<details>
  <summary><b><code>Multiple Types Returns...</code></b></summary>

```tsx
// Multiple Types Returns
<picture>
  <source
    type="image/avif"
    sizes="100vw"
    srcset="
      pixx_images/compass/compass-400w300h.avif    400w,
      pixx_images/compass/compass-800w600h.avif    800w,
      pixx_images/compass/compass-1200w900h.avif  1200w,
      pixx_images/compass/compass-1600w1200h.avif 1600w,
      pixx_images/compass/compass-2000w1500h.avif 2000w,
      pixx_images/compass/compass-2400w1800h.avif 2400w,
      pixx_images/compass/compass-2560w1920h.avif 2560w
    "
  />
  <source
    type="image/webp"
    sizes="100vw"
    srcset="
      pixx_images/compass/compass-400w300h.webp    400w,
      pixx_images/compass/compass-800w600h.webp    800w,
      pixx_images/compass/compass-1200w900h.webp  1200w,
      pixx_images/compass/compass-1600w1200h.webp 1600w,
      pixx_images/compass/compass-2000w1500h.webp 2000w,
      pixx_images/compass/compass-2400w1800h.webp 2400w,
      pixx_images/compass/compass-2560w1920h.webp 2560w
    "
  />
  <source
    type="image/jpg"
    sizes="100vw"
    srcset="
      pixx_images/compass/compass-400w300h.jpg    400w,
      pixx_images/compass/compass-800w600h.jpg    800w,
      pixx_images/compass/compass-1200w900h.jpg  1200w,
      pixx_images/compass/compass-1600w1200h.jpg 1600w,
      pixx_images/compass/compass-2000w1500h.jpg 2000w,
      pixx_images/compass/compass-2400w1800h.jpg 2400w,
      pixx_images/compass/compass-2560w1920h.jpg 2560w
    "
  />
  <img
    style={{ color: 'blue', lineHeight: 10, padding: 20 }}
    className="my-special-class border-blue-200"
    src="pixx_images/compass/compass-2560w1920h.jpg"
    alt="Image of an old compass"
    width="2560"
    height="1920"
    title="Antique compass"
    loading="eager"
    decoding="async"
    fetchPriority="auto"
  />
</picture>
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

```js
// Art Direction -multiple images: Compass.jpg 2560x1920, Happy face.jpg 720x360
await pixx(['./src/compass.jpg', './src/happy face.jpg'], {
  clean: true,
  omit: { remove: 'pixx_images', add: './my-special-folder' },
  media: ['(min-width: 401px) compass.jpg', '(max-width: 400px) happy face.jpg'],
  sizes: ['(min-width: 401px) 50vw', '(max-width: 400px) 100vw', '100vw'],
  styles: 'color: blue; font-size: 46px;', // html
  withClassName: false,
});
```

<details>
  <summary><b><code>Art Direction Returns...</code></b></summary>

```js
// pixx art direction returns
<picture>
  <source
    type="image/avif"
    media="(min-width: 401px)"
    sizes="(min-width: 401px) 50vw, (max-width: 400px) 100vw, 100vw"
    srcset="
          ./my-special-folder/compass/compass-400w300h.avif    400w,
          ./my-special-folder/compass/compass-800w600h.avif    800w,
          ./my-special-folder/compass/compass-1200w900h.avif  1200w,
          ./my-special-folder/compass/compass-1600w1200h.avif 1600w,
          ./my-special-folder/compass/compass-2000w1500h.avif 2000w,
          ./my-special-folder/compass/compass-2400w1800h.avif 2400w,
          ./my-special-folder/compass/compass-2560w1920h.avif 2560w
        "
  />
  <source
    type="image/webp"
    media="(min-width: 401px)"
    sizes="(min-width: 401px) 50vw, (max-width: 400px) 100vw, 100vw"
    srcset="
          ./my-special-folder/compass/compass-400w300h.webp    400w,
          ./my-special-folder/compass/compass-800w600h.webp    800w,
          ./my-special-folder/compass/compass-1200w900h.webp  1200w,
          ./my-special-folder/compass/compass-1600w1200h.webp 1600w,
          ./my-special-folder/compass/compass-2000w1500h.webp 2000w,
          ./my-special-folder/compass/compass-2400w1800h.webp 2400w,
          ./my-special-folder/compass/compass-2560w1920h.webp 2560w
        "
  />
  <source
    type="image/jpg"
    media="(min-width: 401px)"
    sizes="(min-width: 401px) 50vw, (max-width: 400px) 100vw, 100vw"
    srcset="
          ./my-special-folder/compass/compass-400w300h.jpg    400w,
          ./my-special-folder/compass/compass-800w600h.jpg    800w,
          ./my-special-folder/compass/compass-1200w900h.jpg  1200w,
          ./my-special-folder/compass/compass-1600w1200h.jpg 1600w,
          ./my-special-folder/compass/compass-2000w1500h.jpg 2000w,
          ./my-special-folder/compass/compass-2400w1800h.jpg 2400w,
          ./my-special-folder/compass/compass-2560w1920h.jpg 2560w
        "
  />
  <source
    type="image/avif"
    media="(max-width: 400px)"
    sizes="(min-width: 401px) 50vw, (max-width: 400px) 100vw, 100vw"
    srcset="
          ./my-special-folder/happy_face/happy_face-600w300h.avif 600w,
          ./my-special-folder/happy_face/happy_face-720w360h.avif 720w
        "
  />
  <source
    type="image/webp"
    media="(max-width: 400px)"
    sizes="(min-width: 401px) 50vw, (max-width: 400px) 100vw, 100vw"
    srcset="
          ./my-special-folder/happy_face/happy_face-600w300h.webp 600w,
          ./my-special-folder/happy_face/happy_face-720w360h.webp 720w
        "
  />
  <source
    type="image/jpg"
    media="(max-width: 400px)"
    sizes="(min-width: 401px) 50vw, (max-width: 400px) 100vw, 100vw"
    srcset="
          ./my-special-folder/happy_face/happy_face-600w300h.jpg 600w,
          ./my-special-folder/happy_face/happy_face-720w360h.jpg 720w
        "
  />
  <img
    style="color: blue; font-size: 46px;"
    src="./my-special-folder/happy_face/happy_face-720w360h.jpg"
    alt="image"
    width="720"
    height="360"
    loading="eager"
    decoding="auto"
    fetchpriority="auto"
  />
</picture>
```

</details>

</br>
<div><img src="images/color-divider.png" width="838" alt="pixx divider" /></div>

## Responsive Image Tips

- Images _above-the-fold_ (e.g. images you see as soon as the web page loads) should have `withBlur: true` option.
  - The `preload` HTML printed to the console should be added to the `head` section.
  - `loading: 'eager'` option should also be set.
- Images _below-the-fold_ by default will have the `loading: 'lazy'` option set.
- The `sizes` option informs the browser of how much of the viewport the image will take. Default is `100vw`. The browser will choose the _best_ image based on this option and it's pixel density. If image is full width of screen, `sizes` option is not needed.

</br>
<div><img src="images/color-divider.png" width="838" alt="pixx divider" /></div>

## Pixx Options

<details>
  <summary><b><code>Blur and LQIP Placeholder</code></b><i> backgroundSize, blurOnly, blurSize, preload, withBlur</i></summary>

- **backgroundSize**: _string_
  - Default `cover`. Change the `background-size` value for blur placeholder.
  - Controls how the blurred placeholder image is sized.
    - Think of it like setting a background image to "cover" the entire area, "contain" it within the area, or stretch it.
  - This only works if you also turn on the `withBlur: true` option.
  - For more details on how background-size works, check out this link: [MDN background-size](https://developer.mozilla.org/en-US/docs/Web/CSS/background-size)
- **blurOnly**: _boolean_
  - Default `false`. If you just want a simple blurred image without any extra features, set this to true.
  - Skip creating a `low-resolution` image and won't include a "preload" tag in console output.
  - See below 👇.
- **blurSize**: _number_
  - Default `16` pixels. Number of pixels the smallest side _placeholder_ image is resized to.
  - Determines the size of the small placeholder image used to create the blur effect. It's measured in pixels.
  - Larger _blurSize_, larger _base64DataURL_ (the code that represents the blurred image).
  - The `blurDataURL` is a `webp` image encoded in `base64`.
- **withBlur**: _boolean_
  - Default `false`. Create **placeholder** image and **base64DataURL**.
  - This is the main switch for creating blurred placeholder images. Set it to `true` to enable this feature.
  - When turned on, it does a few things:
    - Creates a _placeholder image_ and a _base64DataURL_.
    - Prints information about the placeholder image to the console (for developers). The placeholder image is created in the `webp` format.
    - Prints to console a `<link preload />` tag. Add this tag to the HTML's `<head>` section.
      - This tag tells the browser to load the image early on, so it appears faster.
      - This option is related to a technique called **LQIP** (Low-Quality Image Placeholder). It's a way to improve how images load on a website. Basically, you show a blurry version of the image first, and then replace it with the full-quality image once it's loaded. This makes the page feel faster and less jarring for the user.
  - See `preload` below 👇 for **LQIP** explanation.

```tsx
// bigger number, bigger blurDataURL.
pixx('img.jpg', {
  backgroundSize: 'contain',
  blurOnly: true, // No 'preload' tag or 'lo-res' image will be created.
  blurSize: 16, // smallest dimension of image will be 16px.
  withBlur: true,
});

// withBlur creates the 'small' img.
'img.jpg: pixx_images/img/img-placeholder-21w16h.webp'
// base64 dataURL. -This is attached to 'style' attribute.
'img.jpg blurDataURL: data:image/webp;base64,/9j/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAMABADASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABgEE/8QAIxAAAgEDBAEFAAAAAAAAAAAAAQIDBAUGABESIRUiMUFxwf/EABUBAQEAAAAAAAAAAAAAAAAAAAUG/8QAIBEAAQMCBwAAAAAAAAAAAAAAAQIEEQAhAwUSQYGR8P/aAAwDAQACEQMRAD8AFWCy4xZ7SkuRVRe4uCxp4lLsg26B263OtF9x3Grzjhr8YrYjVgchTu4SQj5BU9gjStbTQPZIWmpIpZAOIkdfUB9jUjxm2+JadI5ElQbBlf8APbVKcpSY04qhe9h1SRdPUt4IQUxO8+5r/9k='

// returns HTML
<picture>
  ...
  <img
    style={{
      backgroundImage:
        'url("pixx_images/img/img-preload-768w576h.webp"), url("data:image/webp;base64,/9j/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAMABADASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABgEE/8QAIxAAAgEDBAEFAAAAAAAAAAAAAQIDBAUGABESIRUiMUFxwf/EABUBAQEAAAAAAAAAAAAAAAAAAAUG/8QAIBEAAQMCBwAAAAAAAAAAAAAAAQIEEQAhAwUSQYGR8P/aAAwDAQACEQMRAD8AFWCy4xZ7SkuRVRe4uCxp4lLsg26B263OtF9x3Grzjhr8YrYjVgchTu4SQj5BU9gjStbTQPZIWmpIpZAOIkdfUB9jUjxm2+JadI5ElQbBlf8APbVKcpSY04qhe9h1SRdPUt4IQUxO8+5r/9k=")',
      backgroundSize: 'contain',
    }}
    src="pixx_images/img/img-2560w1920h.jpg"
    alt="image"
    width="2560"
    height="1920"
    loading="lazy"
    decoding="auto"
    fetchPriority="auto"
  />
</picture>
```

- **Preload**
  - Inspired by [csswizardry](https://csswizardry.com/2023/09/the-ultimate-lqip-lcp-technique/).
- **What is Preloading?**
  - Preloading is like giving the browser a heads-up about what to download ahead of time. When you use the `withBlur` option, this tool creates two low-quality image placeholders (LQIPs) to improve perceived loading speed:
    1. **Blurry Placeholder**: The first LQIP is a very small, blurry image encoded directly into the webpage's code as a `base64 dataURL`. This creates the initial blur effect you see while the actual image loads.
    2. **Low-Resolution Image**: The second LQIP is a slightly higher-resolution image, about **1/3** the size of the final image (you can adjust this with the `preloadFetchWidth` option). A special `preload` tag for this image is printed to the console. You should then copy this tag and paste it into the `<head>` section of your **HTML**.
- **How Preloading Works**
  - When the browser sees the `preload` tag in the `<head>`, it starts downloading the low-resolution image right away, even before it finishes reading the rest of the page.
  - Once this low-resolution image is downloaded, it's displayed as a placeholder until the full-resolution image is ready.
  - **Both** LQIPs are applied as a `background-image` within a `<style>` tag.
- **Simplifying with** `blurOnly`
  - If you only want the blurry placeholder and not the second low-resolution image, you can use the `blurOnly: true` option. This will skip the `preload` tag and only include the blurry `base64` image data.
- **Background Size**
  - By default, the placeholders are set to `background-size: cover`, which means they'll fill the entire container. You can customize this with the `backgroundSize` option.

```tsx
// HTML Example
// withBlur option prints 'preload' tag to console. Copy and past in head
// This is only for 'above-the-fold' critical images!
<head>
  <meta charset="UTF-8" />
  <link
    rel="preload"
    href="pixx_images/img/img-preload-768w576h.webp"
    as="image"
    type="image/webp"
    fetchpriority="high"
  />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>;

// NextJS 15 App Router Example
import { pixx } from 'pixx';
import cn from 'cncn';
import ReactDOM from 'react-dom';

export default function Home() {
  // NextJS 15 preload tag through React-Dom.
  ReactDOM.preload('img/img-preload-768w576h.webp', {
    as: 'image',
    type: 'image/webp',
    fetchPriority: 'high',
  });

  return (
    <>
      {pixx('./images/img.jpg', {
        nextjs: true,
        withBlur: true,
        loading: eager,
      })}
    </>
  );
}
```

</details>

<details>
  <summary><b><code>Classes and Linting Erros</code></b><i> withClassName, dynamic_classes</i></summary>

- Default `[]`. Array of class names. Tailwindcss can be used, and optional object syntax.
- **withClassName**: _boolean_. Default `true`. Image class attribute fixed for JSX.
  - Changes: `false = class` | `true = className`.
  - Also changes: `false = srcset` | `true = srcSet`.
  - Also changes: `false = fetchpriority` | `true = fetchPriority`.
  - Also changes: `false = background-image` | `true = backgroundImage`.
  - Also changes: `false = background-size` | `true = backgroundSize`.

### Static Classes

```tsx
// static classes
pixx('img.jpg', { classes: ['my-special-class', 'bg-blue-200'], withClassName: false });

// returns
<picture>
  ...
  <img className="my-special-class bg-blue-200" src="..." />
</picture>;
```

### Dynamic Classes

- **dynamic classes**: names must have 'd:' appending them. See 👇.
  - Order matters. If classes clash, the last one wins.
- Dynamic classes need the **cn** function imported.
  - [`npm i cncn`](https://www.npmjs.com/package/cncn).
- **Why do variables have to be strings with 'd:' appended to them?**
  - When the `pixx` function (or its plugins) runs, it has a limited "view" of the available variables. It can only directly access variables defined within its own code block. Variables defined outside of `pixx` are not immediately visible.
  - To work around this, the system requires you to add the prefix "d:" to variables that need to be accessed within the `pixx` function. This signals to the system that these variables need to be made available within the `pixx` function's scope.
  - The `pixx` function processes the code and generates HTML output. During this process, it correctly incorporates the "d:" variables into the output. When the final code is compiled (e.g., by a browser or other program), these variables are then properly recognized and used.
- **Linting Erros and the 'v:' Option**
  - **Linters**: Linters are tools that analyze code for potential errors, inconsistencies, and style issues. One common warning linters give is for "unused variables" – variables that are defined but never actually used in the code.
  - **The 'v:' Solution**: Since the "d:" variables might look unused to a linter (because they're not directly used within the `pixx` function), this system provides a special option `v: []`. You can list your "d:" variables within this array to tell the linter not to flag them as unused.
  - **Internal Handling**: The system internally removes these "d:" variables before processing the `pixx` function, ensuring they don't cause any conflicts or errors during execution.
  - In simpler terms, the "d:" prefix is a way to pass variables into the pixx function, and the `v: []` option prevents linters from complaining about these variables.
  - **v**: _unknown[]_
    - Default `[]`.
    - (e.g. `v: [var1, var2, cn]`)

```tsx
// dynamic classes: names must have 'd:' appending them.
// Download cn function
npm i cncn

// commonjs
const cn = require('cncn');
// esm
import cn from 'cncn';

const classVariable = 'some-class';
const pending = true;
const HTML = await pixx('./images/compass.jpg', {
  // Order matters. If classes clash, the last one wins.
  // dynamic class must start with 'd:' 👇
  classes: ['my-special-class', 'd:classVariable', 'bg-blue-200', '{ "bg-red-200": pending }'],
  // or
  classes: ['my-special-class', 'd:classVariable', 'bg-blue-200', 'd:pending && "bg-red-200"'],
});

// returns
<picture>
  ...
  <img className={cn('my-special-class', classVariable, 'bg-blue-200', { 'bg-red-200': pending })} src="..." />
</picture>;


// Linting Errors Example
import { pixx } from 'pixx';
import cn from 'cncn';

function App({ className }: { className: string }) {
  const classVariable = 'some-class';
  const pending = true;

  return (
    <div>
      {pixx('./images/happy face.jpg', {
        classes: ['bg-blue-400', 'd:classVariable', 'd:className', '{ "bg-red-200": pending }'],
        v: [classVariable, className, pending, cn],
      })}
    </div>
  );
}
export default App;

// returns
<picture>
  ...
  <img
    className={cn('bg-blue-400', classVariable, className, { 'bg-red-200': pending })}
    src="pixx_images/happy_face/happy_face-720w360h.jpg"
    alt="image"
    width="720"
    height="360"
    loading="lazy"
    decoding="auto"
    fetchPriority="auto"
  />
</picture>
```

</details>

<details>
  <summary><b><code>clean</code></b><i> boolean</i></summary>

- Default `false`. Delete image folder and create new.

```tsx
pixx('img.jpg', { clean: true }); // delete folder and remake images.
```

</details>

<details>
  <summary><b><code>Image Attributes</code></b><i> alt, title</i></summary>

- **alt**: _string_
  - Default `'image'`. The img `alt` attribute.
- **title**: _string_
  - Default `''`. Text to display as tooltip when hover over image.

```tsx
pixx('img.jpg', { alt: 'my image', title: 'Hello' }); // <img alt="my image" title="Hello" src="...">
```

</details>

<details>
  <summary><b><code>Image Creation</code></b><i> withAnimation, withMetadata</i></summary>

- **withAnimation**: _boolean_.
  - Default `false`. Sharp image library will retain the image animation.
- **withMetadata**: _boolean_.
  - Default `false`. Copy original image metadata to newly created images.

```tsx
pixx('img.jpg', { withAnimation: true, withMetadata: true });
```

</details>

<details>
  <summary><b><code>Image Fallback</code></b><i> fallbackWidth, fallbackPreloadWidth</i></summary>

- **fallbackWidth**: _number_
  - Default `image width`. Custom fallback image width in pixels.
  - The `fallbackWidth` option lets you specify the _width_ of a fallback image in pixels. This image is specifically for older browsers that may not be able to handle the optimized images generated by the tool.
  - The fallback image will always be a _JPEG_ (`jpg`) file. This is a widely supported format that works well in most browsers. Importantly, the fallbackWidth cannot be larger than the original image's width. You can't use this option to upscale the image.
  - **Relationship with `withBlur`**:
    - If you're using the `withBlur` option (for blurred image placeholders), the `fallbackWidth` also influences the size of the preloaded `low-resolution` image (default to **30%** of the `fallbackWidth`).
  - **Example**: If you set `fallbackWidth: 1500`, the fallback image will be 1500 pixels wide. The height of the fallback image will be automatically calculated to maintain the same aspect ratio as the original image.
  - **Relationship with `media` (Art Direction)**:
    - Art Direction is displaying different images based on the 'truthy' _media condition_.
    - The last image provided in `media` array will used as the fallback image.
- **fallbackPreloadWidth**: _number_
  - Defaults to **30%** of the `fallbackWidth`.
  - The `fallbackPreloadWidth` overrides this behavior and allows you to have a custom `low-resolution` image size.

```tsx
// fallback image will be 400px wide
pixx('img.jpg', { withBlur: true, fallbackWidth: 400 });

// returns
// "img-preload-120w90h.webp" is 120px wide. 30% of fallbackWidth.
<picture>
  <img
    style={{
      backgroundImage: 'url("pixx_images/img/img-preload-120w90h.webp"), url("data:image/webp...")',
      backgroundSize: 'cover',
    }}
    src="pixx_images/img/img-400w300h.jpg"
    alt="image"
    width="400"
    height="300"
    loading="lazy"
    decoding="auto"
    fetchPriority="auto"
  />
</picture>;
```

</details>

<details>
  <summary><b><code>Image Loading</code></b><i> decoding, fetchPriority, loading, preloadFetchPriority</i></summary>

- **decoding**: _enum('auto', 'async', 'sync')_
  - Default `auto`. Image download priority.
  - `auto`: The browser decides the best decoding method.
  - `async`: Decoding happens asynchronously, meaning it won't block other page content from loading.
  - `sync`: Decoding happens synchronously, which might slow down the initial page load.
  - More info: [MDN HTML Image decoding property](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/decoding)
- **fetchPriority**: _enum('auto', 'high', 'low')_.
  - Default `auto`.
  - This gives the browser a hint about how important it is to fetch (download) this image compared to other resources on the page.
  - `auto`: Browser determines the priority.
  - `high`: Fetch this image with high priority.
  - `low`: Fetch this image with low priority.
- **loading**: _enum('eager', 'lazy')_
  - Default `lazy`. Controls when the image is loaded.
  - `eager`: Load the image immediately. -Only above-the-fold images.
  - `lazy`: Load the image only when it's about to become visible in the user's viewport (this is generally better for performance).
- **preloadFetchPriority**: _enum('auto', 'high', 'low')_
  - Default `auto`.
  - Similar to `fetchPriority`, but this specifically applies to the preloaded `low-resolution` image (used with the `withBlur` option).
  - `auto`: Browser determines the priority.
  - `high`: Fetch this image with high priority.
  - `low`: Fetch this image with low priority.
  - More info: [MDN Preload fetchPriority property](https://developer.mozilla.org/en-US/docs/Web/API/HTMLLinkElement/fetchPriority).
  - **Relationship with `withBlur`**:
    - If you're using the `withBlur` option (for blurred image placeholders), the `preloadFetchPriority` defaults to `high`, unless you specify different.
- These options are like fine-tuning the image loading process. You can tell the browser which images are more important, when to load them, and how to prioritize their download. By using these settings effectively, you can make your website feel much faster and more responsive to users.

```tsx
pixx('img.jpg', { fetchPriority: 'high', loading: 'eager', decoding: 'async', preloadFetchPriority: 'high' });

// returns
<head>
  <link
    rel="preload"
    href="pixx_images/img/img-preload-768w576h.webp"
    as="image"
    type="image/webp"
    fetchPriority="high"
  />
</head>

<picture>
  ...
  <img
    src="pixx_images/img/img-2560w1920h.jpg"
    alt="image"
    width="2560"
    height="1920"
    loading="eager"
    decoding="async"
    fetchPriority="high"
  />
</picture>;
```

</details>

<details>
  <summary><b><code>Image Paths</code></b><i> linuxPaths, nextJS, omit, outDir, vite</i></summary>

- These options provide flexibility in managing image paths, especially when working with different operating systems, frameworks, or custom project structures. They help ensure that your images are stored and referenced correctly in your web application.
- **linuxPaths**: _boolean_
  - Default `true`.
  - This option is useful for developers who work on a Windows machine but deploy their website to a Linux server.
  - Windows and Linux use different formats for file paths (e.g. "C:\images\myimage.jpg" vs. "/images/myimage.jpg").
  - When linuxPaths is set to true (which is the default), the tool will automatically convert image paths to the Linux format. This ensures that your images will work correctly when you deploy your site to a Linux server.
- **nextJS**: _boolean_
  - Default `false`.
  - This is a shortcut option specifically for developers using the **Next.js framework**.
  - When set to `true`, it automatically configures two other options:
    - `outDir: 'public'`: Images will be saved to the public folder, which is the standard location for static assets in Next.js.
    - `omit: { remove: 'public/' }`: This adjusts the image paths in the img or picture elements to correctly point to the images within the `public` folder.
    - Essentially, this option simplifies the process of using the tool with Next.js.
- **omit**: _{ remove?: string, add?: string }_
  - Default `{ remove: '', add: '' }`. Object with `remove` and `add` properties.
  - This option provides fine-grained control over how image paths are generated in your HTML.
  - It allows you to:
    - `remove`: Remove a specific part of the image path.
    - `add`: Add a custom string to the image path.
    - **Example**: `omit: { remove: 'pixx_images', add: './my-special-path' }` would replace "pixx_images" with "./my-special-path".
    - **Important**: This option only modifies the **image path in the HTML**; it doesn't change where the actual image files are stored.
- **outDir**: _string_
  - Default `pic_images`.
  - This option lets you specify the name of the directory where the optimized images will be saved.
- **vite**: _boolean_. Default `false`
  - Similar to the `nextJS` option, this is a shortcut for developers using the Vite build tool.
  - When set to `true`, it sets `outDir` to 'public' and configures omit to correctly handle image paths within Vite projects.

```tsx
pixx('img.jpg', {
  outDir: 'my-dir', // my-dir folder will be created in root directory if does not exist.
  omit: { remove: '', add: 'nested-dir/' },
});

// returns
<picture>
  <source type="image/avif" sizes="100vw" srcSet="nested-dir/my-dir/img/img-400w300h.avif 400w, ..." />
  ...
  <img
    src="nested-dir/my-dir/img/img-2560w1920h.jpg"
    alt="image"
    width="2560"
    height="1920"
    loading="lazy"
    decoding="auto"
    fetchPriority="auto"
  />
</picture>;
```

</details>

<details>
  <summary><b><code>Image Size</code></b><i> heights, incrementSize, widths</i></summary>

- These options give you control over the resizing process. You can either:
  1. Provide specific sizes using widths or heights.
  2. Let the tool automatically generate sizes at intervals using incrementSize.
- This flexibility allows you to create images that are optimized for different screen sizes and layouts, improving your website's performance and responsiveness.
- **heights**: _number[]_
  - Default `[]`. Array of numbers representing height in pixels.
  - This option lets you specify an array of heights (in pixels) for the generated images.
  - For example, `heights: [200, 400, 600]` would create three versions of the image with those specific heights.
  - **Important**: The heights you provide cannot be larger than the original image's height. The tool won't upscale your images.
  - **Prioritization**: If you use `widths`, those will take precedence over `heights`. Both widths and heights have higher priority than `defaultSizes`.
- **incrementSize**: _number_
  - Default `300`. Create images in steps of 300 pixels _wide_ (e.g. 300px, 600px, 900px, etc.).
  - This option controls the automatic size increments when you don't provide specific `widths` or `heights`.
  - **How it works**: The tool looks at the _width_ of your original image and generates images at intervals of `incrementSize` until it reaches the original image _width_ size.
  - **Example**: If `incrementSize` is 200, and your image is 1000px _wide_ and 500px tall, it will create images with widths of 200px, 400px, 600px, 800px, and 1000px, keeping same aspect ratio.
- **widths**: _number[]_
  - Default `[]`. Array of widths to create images.
  - This option is similar to `heights`, but it lets you specify an array of widths (in pixels) for the generated images.
  - **Example**: `widths: [300, 500, 650, 900, 1200]` would create images with those specific widths.
  - **Prioritization**: `widths` have the highest priority, followed by `heights`, and then `defaultSizes`.

```tsx
pixx('img.jpg', { widths: [200, 500, 600] }); // img.jpg 2560x1920

// returns
<picture>
  <source
    type="image/avif"
    sizes="100vw"
    srcSet="pixx_images/img/img-200w150h.avif 200w, pixx_images/img/img-500w375h.avif 500w, pixx_images/img/img-600w450h.avif 600w"
  />
  <source
    type="image/webp"
    sizes="100vw"
    srcSet="pixx_images/img/img-200w150h.webp 200w, pixx_images/img/img-500w375h.webp 500w, pixx_images/img/img-600w450h.webp 600w"
  />
  <source
    type="image/jpg"
    sizes="100vw"
    srcSet="pixx_images/img/img-200w150h.jpg 200w, pixx_images/img/img-500w375h.jpg 500w, pixx_images/img/img-600w450h.jpg 600w"
  />
  <img
    src="pixx_images/img/img-2560w1920h.jpg"
    alt="image"
    width="2560"
    height="1920"
    loading="lazy"
    decoding="auto"
    fetchPriority="auto"
  />
</picture>;
```

</details>

<details>
  <summary><b><code>Logging:</code></b><i> log, progressBar</i></summary>

- **log**: _boolean_
  - Default `false`. Output build details to console.log.
  - When set to `true`, it provides extensive information, including:
    - The current state of the process.
    - Details about hidden image data (metadata), such as:
      - **EXIF**: Information about the camera settings used to take the image (e.g., exposure, ISO, date/time).
      - **XMP**: Extensible Metadata Platform, which can include various types of information like copyright, keywords, and descriptions.
      - **ICC**: Color profiles that ensure consistent color representation across different devices.
      - **GPS**: Geographical location where the image was taken.
- **progressBar**: _boolean_
  - Default `true`. This option controls whether a progress bar is displayed during the image optimization process.

```tsx
pixx('img.jpg', { log: true, progressBar: false });
```

</details>

<details>
  <summary><b><code>media</code></b><i> string[]</i></summary>

- Default `[]`. Array of media conditions and image names.
- Specify different images to be displayed based on the user's screen size or device orientation. This technique is often called **art direction**.
- A _media query_ that describes a specific screen size or device orientation (e.g., `(max-width: 768px)` for smaller screens or `(orientation: landscape)` for landscape mode).
- This is solely used for **Art Direction**.
- The **last** image provided in `image names` array will used as the **fallback image**.
- **Art direction allows you to**:
  - **Optimize for different screen sizes**: You can use smaller images for mobile devices, saving bandwidth and improving loading times.
  - **Improve composition**: You can crop or adjust images to look their best at different sizes and orientations.
  - **Provide a better user experience**: By tailoring images to the user's device, you can create a more visually appealing and engaging website.
  - **Learn More**:
    - [HTML Responsive Images](https://danburzo.ro/responsive-images-html/)
    - [Responsive Images 101](https://cloudfour.com/thinks/responsive-images-101-definitions/)
    - [HTML srcset](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/srcset)

```tsx
// the fallback image will be the last image provided ('img-crop.jpg').
pixx(['img.jpg', 'img-crop.jpg'], {
  media: ['(max-width: 400px) img-crop.jpg', '(min-width: 401px) img.jpg'],
});

// returns
<picture>
  <source
    type="image/avif"
    media="(max-width: 400px)"
    sizes="100vw"
    srcSet="pixx_images/img-crop/img-crop-300w168h.avif 300w, pixx_images/img-crop/img-crop-600w336h.avif 600w, pixx_images/img-crop/img-crop-750w420h.avif 750w"
  />
  <source
    type="image/webp"
    media="(max-width: 400px)"
    sizes="100vw"
    srcSet="pixx_images/img-crop/img-crop-300w168h.webp 300w, pixx_images/img-crop/img-crop-600w336h.webp 600w, pixx_images/img-crop/img-crop-750w420h.webp 750w"
  />
  <source
    type="image/jpg"
    media="(max-width: 400px)"
    sizes="100vw"
    srcSet="pixx_images/img-crop/img-crop-300w168h.jpg 300w, pixx_images/img-crop/img-crop-600w336h.jpg 600w, pixx_images/img-crop/img-crop-750w420h.jpg 750w"
  />
  <source
    type="image/avif"
    media="(min-width: 401px)"
    sizes="100vw"
    srcSet="pixx_images/img/img-300w225h.avif 300w, pixx_images/img/img-600w450h.avif 600w, pixx_images/img/img-900w675h.avif 900w, pixx_images/img/img-1200w900h.avif 1200w, pixx_images/img/img-1500w1125h.avif 1500w, pixx_images/img/img-1800w1350h.avif 1800w, pixx_images/img/img-2100w1575h.avif 2100w, pixx_images/img/img-2400w1800h.avif 2400w, pixx_images/img/img-2560w1920h.avif 2560w"
  />
  <source
    type="image/webp"
    media="(min-width: 401px)"
    sizes="100vw"
    srcSet="pixx_images/img/img-300w225h.webp 300w, pixx_images/img/img-600w450h.webp 600w, pixx_images/img/img-900w675h.webp 900w, pixx_images/img/img-1200w900h.webp 1200w, pixx_images/img/img-1500w1125h.webp 1500w, pixx_images/img/img-1800w1350h.webp 1800w, pixx_images/img/img-2100w1575h.webp 2100w, pixx_images/img/img-2400w1800h.webp 2400w, pixx_images/img/img-2560w1920h.webp 2560w"
  />
  <source
    type="image/jpg"
    media="(min-width: 401px)"
    sizes="100vw"
    srcSet="pixx_images/img/img-300w225h.jpg 300w, pixx_images/img/img-600w450h.jpg 600w, pixx_images/img/img-900w675h.jpg 900w, pixx_images/img/img-1200w900h.jpg 1200w, pixx_images/img/img-1500w1125h.jpg 1500w, pixx_images/img/img-1800w1350h.jpg 1800w, pixx_images/img/img-2100w1575h.jpg 2100w, pixx_images/img/img-2400w1800h.jpg 2400w, pixx_images/img/img-2560w1920h.jpg 2560w"
  />
  <img
    src="pixx_images/img-crop/img-crop-750w420h.jpg"
    alt="image"
    width="750"
    height="420"
    loading="lazy"
    decoding="auto"
    fetchPriority="auto"
  />
</picture>;
```

</details>

<details>
  <summary><b><code>picTypes</code></b><i> enums('avif', 'gif', 'jpeg', 'jpg', 'png', 'tiff', 'webp')</i></summary>

- Default `['avif', 'webp', 'jpg']`.

```tsx
pixx('img.jpg', { picTypes: ['webp'] }); // create only webp images

// returns -single image type: Resolution Switching.
<img
  srcSet="pixx_images/img/img-300w225h.webp 300w, pixx_images/img/img-600w450h.webp 600w, pixx_images/img/img-900w675h.webp 900w, pixx_images/img/img-1200w900h.webp 1200w, pixx_images/img/img-1500w1125h.webp 1500w, pixx_images/img/img-1800w1350h.webp 1800w, pixx_images/img/img-2100w1575h.webp 2100w, pixx_images/img/img-2400w1800h.webp 2400w, pixx_images/img/img-2560w1920h.webp 2560w"
  sizes="100vw"
  src="pixx_images/img/img-2560w1920h.jpg"
  alt="image"
  width="2560"
  height="1920"
  loading="lazy"
  decoding="auto"
  fetchPriority="auto"
/>;
```

</details>

<details>
  <summary><b><code>returnJSX</code></b><i> boolean</i></summary>

- Default `false`. Return HTML as JSX or string.
- **React**:
  - By default, HTML is returned as a string.
  - You can return HTML as 'JSX' by setting the option `returnJSX: true`.
  - when using a loader (_pixxFlow, Pixx-Loader, Vite-Plugin-React-Pixx_), `returnJSX` will be set to `false`.

```tsx
pixx('img.jpg', { returnJSX: false }); // will return HTML.
pixx('img.jpg', { returnJSX: true }); // will return React JSX component. React.createElement(type, [props], [...children])
```

</details>

<details>
  <summary><b><code>sizes</code></b><i> string[]</i></summary>

- Default `['100vw']`. Array of media conditions and the viewport fill _width_.
- The `sizes` option, which is used to provide hints to the browser about how much space an image will take up on the screen. This information helps the browser make better decisions about which image to load, especially when you have different sizes of the same image available (like in responsive images).
- **Each string has two parts**:
  - **Media Condition**: A CSS media query that describes a specific screen size or device characteristic (e.g., (max-width: 768px) for smaller screens).
  - **Viewport Fill Width**: A CSS length value (like 100vw, 30rem, or 500px) that tells the browser how much of the viewport width the image will occupy when that media condition is met. Note that **percentages are not allowed** here.
- **How Browsers Use `sizes`**: The browser looks at the _media conditions_ you've provided and compares them to the user's current screen size. It then uses the corresponding viewport fill width to estimate the image's display size. This helps the browser choose the most appropriate image source from a srcset attribute (which lists different image sources).
- **Default Value**: If no media conditions match, the browser uses the **last value** in the `sizes` array as the default. The default value is `['100vw']`, which means the image is assumed to fill the entire width of the viewport.
- [MDN sizes](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/sizes).

```tsx
// First true condition is taken.
// If viewport width is 500px or less, the image will take 75% of it.
// If viewport width is 800px or less, the image will take 50% of it.
// If viewport width is larger than 800px, the image will take 25% of it.
pixx('img.jpg', { sizes: ['(max-width: 500px) 75vw', '(max-width: 800px) 50vw', '25vw'] });

// returns
<picture>
  <source
    type="image/avif"
    sizes="(max-width: 500px) 75vw, (max-width: 800px) 50vw, 25vw"
    srcSet="pixx_images/img/img-300w225h.avif 300w, pixx_images/img/img-600w450h.avif 600w, pixx_images/img/img-900w675h.avif 900w, pixx_images/img/img-1200w900h.avif 1200w, pixx_images/img/img-1500w1125h.avif 1500w, pixx_images/img/img-1800w1350h.avif 1800w, pixx_images/img/img-2100w1575h.avif 2100w, pixx_images/img/img-2400w1800h.avif 2400w, pixx_images/img/img-2560w1920h.avif 2560w"
  />
  <source
    type="image/webp"
    sizes="(max-width: 500px) 75vw, (max-width: 800px) 50vw, 25vw"
    srcSet="pixx_images/img/img-300w225h.webp 300w, pixx_images/img/img-600w450h.webp 600w, pixx_images/img/img-900w675h.webp 900w, pixx_images/img/img-1200w900h.webp 1200w, pixx_images/img/img-1500w1125h.webp 1500w, pixx_images/img/img-1800w1350h.webp 1800w, pixx_images/img/img-2100w1575h.webp 2100w, pixx_images/img/img-2400w1800h.webp 2400w, pixx_images/img/img-2560w1920h.webp 2560w"
  />
  <source
    type="image/jpg"
    sizes="(max-width: 500px) 75vw, (max-width: 800px) 50vw, 25vw"
    srcSet="pixx_images/img/img-300w225h.jpg 300w, pixx_images/img/img-600w450h.jpg 600w, pixx_images/img/img-900w675h.jpg 900w, pixx_images/img/img-1200w900h.jpg 1200w, pixx_images/img/img-1500w1125h.jpg 1500w, pixx_images/img/img-1800w1350h.jpg 1800w, pixx_images/img/img-2100w1575h.jpg 2100w, pixx_images/img/img-2400w1800h.jpg 2400w, pixx_images/img/img-2560w1920h.jpg 2560w"
  />
  <img
    src="pixx_images/img/img-2560w1920h.jpg"
    alt="image"
    width="2560"
    height="1920"
    loading="lazy"
    decoding="auto"
    fetchPriority="auto"
  />
</picture>;
```

</details>

<details>
  <summary><b><code>styles</code></b><i> string</i></summary>

- Default `''`. Inline styles.

```tsx
// React -converts to JS object. Values 👇 must be quoted, numbers can be quoted or not quoted.
pixx('img.jpg', { styles: "{ color: 'blue', lineHeight : 10, padding: 20 }" });

// HTML
pixx('img.jpg', { styles: 'color: blue; font-size: 46px;' });
```

</details>

</br>
<div><img src="images/color-divider.png" width="838" alt="pixx divider" /></div>

### pixxFlow

- This tool acts like a helper that automatically finds the `pixx` function in your files, runs it, and adds the results to your web page. However, because it uses `eval()`, you should only use this tool during **development** and not on a live website.
- **Static File Scraper**: This tool scans your project files to find and process the `pixx` function. It uses the [NPM Glob](https://www.npmjs.com/package/glob) library (a popular Node.js module) to search for files matching a specific pattern.
- **How it Works**:
  1. **Find pixx Functions**: The tool searches your project files for instances of the `pixx` function.
  2. **Execute pixx Code**: When it finds a `pixx` function, it executes the code within that function.
  3. **Comment Out**: After execution, the tool comments out the original `pixx` function in the file. This prevents it from being executed again.
  4. **Add HTML**: The output generated by the `pixx` function (which is typically HTML code) is added to the page.
- **HTML Placement**: To use this tool, you need to place a single `pixx` function within a `<script>` tag in your **HTML** file.
- **Caution**: The tool uses `eval()` to execute the `pixx` function. `eval()` is a powerful function that can execute arbitrary code. This can be a security risk if you're not careful. This warning emphasizes `pixxFlow` should only be used in a **development** environment and not in a production setting where security is critical.

<details>
  <summary><b><code>pixxFlow Options</code></b></summary>

- **Options**
  - **comment**: _boolean_
    - Default `true`. Controls wether to remove `pixx` function or just comment out.
  - **include**: _string[]_
    - Default `['**/*.html', '**/*.jsx', '**/*.tsx']`.
    - This option specifies an array of file patterns to include in the processing.
    - PixxFlow uses [glob](https://www.npmjs.com/package/glob) to search for files.
  - **ignore**: _string[]_
    - Default `['node_modules/**', '**/pixx*']`.
    - This option specifies an array of file patterns to exclude from processing.
    - To ignore directories, append `/**` to name. (e.g. `node_modules/**`).
    - PixxFlow uses [glob](https://www.npmjs.com/package/glob) to ignore files.
  - **log**: _boolean_
    - Default `false`.
    - This option controls whether debugging information is printed to the console.
  - **isHTML**: _boolean_
    - Default `false`. Internal usage. Cannot be changed.
    - This option is used internally by the tool and **cannot be changed** manually.
    - It indicates whether the file being processed is an **HTML** file or a **JSX/TSX** file.
    - The tool automatically sets this flag based on the **file extension**.
    - This setting affects how the tool parses the file and the type of `comments` added (HTML or JSX).
  - **overwrite**: _boolean_
    - Default `false`.
    - This option determines whether the tool overwrites the original file or creates a new file.
    - When creating a new file, the tool adds the prefix "pixx-" to the original file name (e.g., _myfile.jsx_ becomes _pixx-myfile.jsx_).
    - If set to `true`, the tool will overwrite the original file with the processed output.

```js
// 1. Create a run file in root of directory. e.g. 'file.js'
import { pixxFlow } from 'pixx';

// simple
pixxFlow();

// advanced
pixxFlow({
  comment: true,
  log: true,
  include: ['**/*.html'],
  ignore: ['node_modules/**', '**/pixx*'],
  overwrite: false,
});

// 2. run with node
node file.js
```

```html
<!-- PixxFlow HTML Example  -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body>
    <p>Simple Example</p>
    <script>
      pixx('./images/img1.webp', { withClassName: false });
    </script>

    <p>Advanced Example</p>
    <script>
      pixx(['./images/compass.jpg', './images/happy face.jpg'], {
        omit: { remove: 'pixx_images', add: './my-special-folder' },
        media: ['(min-width: 401px) compass.jpg', '(max-width: 400px) happy face.jpg'],
        sizes: ['(min-width: 401px) 50vw', '(max-width: 400px) 100vw', '100vw'],
        styles: 'color: blue; font-size: 46px;',
        withClassName: false,
      });
    </script>
  </body>
</html>

<!-- Returns ----------------------------------------------->
<!-- PixxFlow HTML Example  -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body>
    <p>Simple Example</p>
    <!-- <script>
      pixx('./images/img1.webp', { withClassName: false });
    </script> -->
    <picture>
      <source
        type="image/avif"
        sizes="100vw"
        srcset="
          pixx_images/img1/img1-300w346h.avif 300w,
          pixx_images/img1/img1-600w691h.avif 600w,
          pixx_images/img1/img1-750w864h.avif 750w
        "
      />
      <source
        type="image/webp"
        sizes="100vw"
        srcset="
          pixx_images/img1/img1-300w346h.webp 300w,
          pixx_images/img1/img1-600w691h.webp 600w,
          pixx_images/img1/img1-750w864h.webp 750w
        "
      />
      <source
        type="image/jpg"
        sizes="100vw"
        srcset="
          pixx_images/img1/img1-300w346h.jpg 300w,
          pixx_images/img1/img1-600w691h.jpg 600w,
          pixx_images/img1/img1-750w864h.jpg 750w
        "
      />
      <img
        src="pixx_images/img1/img1-750w864h.jpg"
        alt="image"
        width="750"
        height="864"
        loading="lazy"
        decoding="auto"
        fetchpriority="auto"
      />
    </picture>

    <p>Advanced Example</p>
    <!-- <script>
      pixx(['./images/compass.jpg', './images/happy face.jpg'], {
        omit: { remove: 'pixx_images', add: './my-special-folder' },
        media: ['(min-width: 401px) compass.jpg', '(max-width: 400px) happy face.jpg'],
        sizes: ['(min-width: 401px) 50vw', '(max-width: 400px) 100vw', '100vw'],
        styles: 'color: blue; font-size: 46px;',
        withClassName: false,
      });
    </script> -->
    <picture>
      <source
        type="image/avif"
        media="(min-width: 401px)"
        sizes="(min-width: 401px) 50vw, (max-width: 400px) 100vw, 100vw"
        srcset="
          ./my-special-folder/compass/compass-300w225h.avif    300w,
          ./my-special-folder/compass/compass-600w450h.avif    600w,
          ./my-special-folder/compass/compass-900w675h.avif    900w,
          ./my-special-folder/compass/compass-1200w900h.avif  1200w,
          ./my-special-folder/compass/compass-1500w1125h.avif 1500w,
          ./my-special-folder/compass/compass-1800w1350h.avif 1800w,
          ./my-special-folder/compass/compass-2100w1575h.avif 2100w,
          ./my-special-folder/compass/compass-2400w1800h.avif 2400w,
          ./my-special-folder/compass/compass-2560w1920h.avif 2560w
        "
      />
      <source
        type="image/webp"
        media="(min-width: 401px)"
        sizes="(min-width: 401px) 50vw, (max-width: 400px) 100vw, 100vw"
        srcset="
          ./my-special-folder/compass/compass-300w225h.webp    300w,
          ./my-special-folder/compass/compass-600w450h.webp    600w,
          ./my-special-folder/compass/compass-900w675h.webp    900w,
          ./my-special-folder/compass/compass-1200w900h.webp  1200w,
          ./my-special-folder/compass/compass-1500w1125h.webp 1500w,
          ./my-special-folder/compass/compass-1800w1350h.webp 1800w,
          ./my-special-folder/compass/compass-2100w1575h.webp 2100w,
          ./my-special-folder/compass/compass-2400w1800h.webp 2400w,
          ./my-special-folder/compass/compass-2560w1920h.webp 2560w
        "
      />
      <source
        type="image/jpg"
        media="(min-width: 401px)"
        sizes="(min-width: 401px) 50vw, (max-width: 400px) 100vw, 100vw"
        srcset="
          ./my-special-folder/compass/compass-300w225h.jpg    300w,
          ./my-special-folder/compass/compass-600w450h.jpg    600w,
          ./my-special-folder/compass/compass-900w675h.jpg    900w,
          ./my-special-folder/compass/compass-1200w900h.jpg  1200w,
          ./my-special-folder/compass/compass-1500w1125h.jpg 1500w,
          ./my-special-folder/compass/compass-1800w1350h.jpg 1800w,
          ./my-special-folder/compass/compass-2100w1575h.jpg 2100w,
          ./my-special-folder/compass/compass-2400w1800h.jpg 2400w,
          ./my-special-folder/compass/compass-2560w1920h.jpg 2560w
        "
      />
      <source
        type="image/avif"
        media="(max-width: 400px)"
        sizes="(min-width: 401px) 50vw, (max-width: 400px) 100vw, 100vw"
        srcset="
          ./my-special-folder/happy_face/happy_face-300w150h.avif 300w,
          ./my-special-folder/happy_face/happy_face-600w300h.avif 600w,
          ./my-special-folder/happy_face/happy_face-720w360h.avif 720w
        "
      />
      <source
        type="image/webp"
        media="(max-width: 400px)"
        sizes="(min-width: 401px) 50vw, (max-width: 400px) 100vw, 100vw"
        srcset="
          ./my-special-folder/happy_face/happy_face-300w150h.webp 300w,
          ./my-special-folder/happy_face/happy_face-600w300h.webp 600w,
          ./my-special-folder/happy_face/happy_face-720w360h.webp 720w
        "
      />
      <source
        type="image/jpg"
        media="(max-width: 400px)"
        sizes="(min-width: 401px) 50vw, (max-width: 400px) 100vw, 100vw"
        srcset="
          ./my-special-folder/happy_face/happy_face-300w150h.jpg 300w,
          ./my-special-folder/happy_face/happy_face-600w300h.jpg 600w,
          ./my-special-folder/happy_face/happy_face-720w360h.jpg 720w
        "
      />
      <img
        style="color: blue; font-size: 46px"
        src="./my-special-folder/happy_face/happy_face-720w360h.jpg"
        alt="image"
        width="720"
        height="360"
        loading="lazy"
        decoding="auto"
        fetchpriority="auto"
      />
    </picture>
  </body>
</html>
```

</details>

</br>
<div><img src="images/color-divider.png" width="838" alt="pixx divider" /></div>

## Plugins

### Pixx-Loader Webpack 5 Plugin (NextJS)

- `Pixx` is specifically designed to integrate with **Next.js** projects using the **Webpack 5** build process.
  - During **NextJS** install, you must **use the 'webpack' option**, not 'turbopack'.
- `Pixx` includes a loader component (`Pixx-Loader`) that intercepts the static pages generated by Next.js. It then executes the `pixx` code (which handles image and HTML code creation) and sends the resulting HTML back to the Next.js server.
- **Pixx can be used in client or server pages**, because it operates during the static HTML generation phase, before the Next.js server processes the pages.
- `Pixx` processes and transforms your code during **development**, leaving only the optimized output in the final build.
- `Pixx` functions wil not be included in **build**.

<details>
  <summary><b><code>Webpack 5 Options</code></b></summary>

- **Images not being created**: stop development server. Delete the `.next` folder. Start server.
  - NextJS 'caches' files to speed up development. It also runs file three different times to determine 'server', 'server api' or 'client' page. Avoid the `clean: true` option to prevent drastic slowdown.
- ⚠️ **Caution**: pixx-loader uses `eval()` to run the pixx function. Only use this in **_development_**.
- **Options**
  - **comment**: _boolean_
    - Default `false`. Internal usage.
    - `Pixx` functions are processed, **removed**, and the resulting **HTML** is sent to the server.
    - The `overwrite` option if set to `true` will automatically switch `comment` to `true`.
  - **log**: _boolean_
    - Default `false`.
    - This option controls whether debugging information is printed to the console.
  - **isHTML**: _boolean_
    - Default `false`.
    - This setting affects how the tool comments `pixx` functions with **HTML** or **JSX** style comments.
  - **overwrite**: _boolean_
    - Default `false`.
    - This option determines whether the tool overwrites the original file.
    - If set to `true`, the tool will overwrite the original file with **HTML** code and comment out `pixx` functions.
    - `Pixx` will not run once commented out. This can speed up development when you have finalized images.

```ts
// NextJS example
// npm i -D pixx
// next.config.ts
import type { NextConfig } from 'next';
const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config) => {
    // If 'fs' or 'zlib' could not be found notification:
    // config.resolve.fallback = { fs: false, zlib: false };
    config.module.rules.push({
      test: /\.(t|j)sx$/,
      // Simple
      // use: 'pixx',
      // Advanced
      use: {
        loader: 'pixx',
        options: {
          log: true,
          overwrite: false,
        },
      },
    });
    return config;
  },
};
export default nextConfig;

// NextJS page.tsx example
// prettier-ignore
'use client';
import { pixx } from 'pixx';
const MyPic = () => {
  return (
    <div>
      MyPic
      {pixx('./images/img2.jpg', { nextjs: true })}
    </div>
  );
};
export default MyPic;
```

</details>

### Vite-Plugin-React-Pixx

- Plugin to be used with **Vite**.
- **VitePluginReactPixx** will intercept static pages, run pixx, then return **HTML** to _Vite_ server.
- **Pixx is not run on client**, because it processes and transforms your code during **development**, leaving only the optimized output in **HTML** sent to client.
- `Pixx` functions wil not be included in **build**.

<details>
  <summary><b><code>Vite-Plugin-React-Pixx Options</code></b></summary>

- ⚠️ **Caution**: Vite-Plugin-React-Pixx uses `eval()` to run the pixx function locally. Only use this in **_development_**.
- **Building**:
  - **linting errors**:
    - `pix('img.jpg', { v: [var1, var2, cn] }` // or
    - Use `overwrite: true` option during `npm run dev` to embed **HTML**, then `npm run build`.
- **Options**
  - **comment**: _boolean_
    - Default `false`. Internal usage.
    - `Pixx` functions are processed, **removed**, and the resulting **HTML** is sent to the server.
    - The `overwrite` option if set to `true` will automatically switch `comment` to `true`.
  - **log**: _boolean_
    - Default `false`.
    - This option controls whether debugging information is printed to the console.
  - **isHTML**: _boolean_
    - Default `false`.
    - This setting affects how the tool comments `pixx` functions with **HTML** or **JSX** style comments.
  - **overwrite**: _boolean_
    - Default `false`.
    - This option determines whether the tool overwrites the original file.
    - If set to `true`, the tool will overwrite the original file with **HTML** code and comment out `pixx` functions.
    - `Pixx` will not run once commented out. This can speed up development when you have finalized images.

```tsx
// vite.config.js
import { defineConfig } from 'vite';
import { VitePluginPixx } from 'pixx';

// https://vite.dev/config/
export default defineConfig({
  plugins: [VitePluginPixx({ log: true, overwrite: true })],
});

// App.tsx
// Example shows dynamic variables. Pixx does not run on client.
// Pages is scraped, pixx is run, and HTML is returned to vite server.
import './App.css';
import { pixx } from 'pixx'; // npm i -D pixx cncn
import cn from 'cncn';

function App({ className }: { className: string }) {
  const classVariable = 'hi';
  const pending = true;

  return (
    <div>
      <p>hi</p>
      {pixx(['./images/happy face.jpg', './images/img1.webp'], {
        returnJSX: true,
        vite: true,
        sizes: ['(min-width: 500px) 500px', '(max-width: 499px) 50vw', '100vw'],
        media: ['(min-width: 500px) happy face.jpg', '(max-width: 499px) img1.webp'],
        classes: ['bg-blue-200', 'd:classVariable', 'd:className', 'd:pending && "border-red-200"'],
        v: [pending, classVariable, className, cn],
        styles: "{ color: 'green', lineHeight : 10, padding: 20 }",
      })}
      <p>bye</p>
    </div>
  );
}
export default App;
```

</details>

</br>
<div><img src="images/color-divider.png" width="838" alt="pixx divider" /></div>

## License

Published under the Apache-2.0 license. © Bryon Smith 2024.
