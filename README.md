# pixx

- [NPM pixx](https://www.npmjs.com/package/pixx)

## What and Why

- Responsive images can be **complex** and **error prone**. This module tries to simplify the image creation and html code to match.
- Using the _[sharp](https://sharp.pixelplumbing.com/)_ image library, quickly create responsive images, and the HTML code to match.
- This package only runs in a _[NodeJS](https://nodejs.org/en/download/package-manager)_ environment.
- Pixx does not increase image size. Start with the **largest input image**.
- Pixx is designed to use in project **development**.
- **Sharp error on Windows**: Could not load the "sharp" module using the win32-x64 runtime.
  - **Solution**: `npm install --include=optional sharp`

## Simple Start

```js
// download
npm i -D pixx;


// commonjs
const { pixx } = require('pixx');
pixx('compass.jpg').then((HTML) => {});
// esm -package.json: "type": "module",
import { pixx } from 'pixx';
const HTML = await pixx('compass.jpg'); // size is 2560w x 1920h.

// returns
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
    decoding="async"
    fetchPriority="auto"
  />
</picture>;
```

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
  2. Single image in multiple sizes and types. (e.g. img.avif, img.webp, img.jpg).
  3. Multiple different images the browser will choose depending on viewport width.
     1. (e.g. img-full.jpg, img-crop.jpg).

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

// returns
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
/>;
```

### Multiple Types

- Uses the `picture` and `source` element with the `srcset` and `sizes` attributes.
- **Multiple image types**. Browsers can choose what image **size** and **type** to download based on the device viewport and pixel density.
- Fallback is `img` element.
- **Pros**
  - Use new and highly optimized image types, with fallback, for browsers that don't support them.
- **Cons**
  - Code can be complex.
  - Order matters. Browser takes the first truthy value.

```js
await pixx('./src/compass.jpg', {
  title: 'Antique compass',
  alt: 'Image of an old compass',
  withBlur: true,
  classes: ['my-special-class', 'border-blue-200'],
  styles: "{ color: 'blue', lineHeight : 10, padding: 20 }",
});

// console.log blur image path and blurDataURL.
compass.jpg: 'pixx_images/compass/compass-placeholder-10w8h.jpg'
compass.jpg blurDataURL: 'data:image/jpg;base64,/9j/2wBDAAYEBQYFBAYGBQYHBw...'

// returns
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
    style={{ color: 'blue', lineHeight : 10, padding: 20 }}
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

// returns
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
</picture>;
```

## React

- By default, html element is returned as a string. You can return a 'React' component by setting the option `returnReact: true`.

## Pixx Options

- **alt**: _string_. Default `image`. The img `alt` attribute.
- **blurSize**: _number_. Default `10`. Number of pixels wide the _placeholder_ image is resized to.
  - Bigger _blurSize_, bigger _base64DataURL_.
- **classes**: _string[]_. Array of class names. Tailwindcss can be used, and optional object syntax.
  - **static classes**: `classes: ['my-special-class', 'border-blue-200']`
  - **dynamic classes**: names must have 'd:' appending them. See 👇.
    - e.g. `classes: ['my-special-class', 'd:classVariable', 'border-blue-200', '{ "border-red-200": pending }'],`.
    - e.g. `classes: ['my-special-class', 'border-blue-200', 'd:pending && "border-red-500"']`.
- **clean**: _boolean_. Default `false`. Delete image folder and create new.
- **decoding**: _enum('auto', 'async', 'sync')_. Default `auto`. Image download priority.
  - [MDN HTML Image decoding property](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/decoding)
- **fallbackWidth**: _number_ . Default `image width`. Custom fallback image width in pixels.
  - Older browsers fallback to this image. Image will always be type `jpg`.
  - fallbackWidth must be <= image width. Image size is not increased.
  - (e.g. `fallbackWidth: 1500`. The fallback img _src_ will be an image **1500px wide** with height same aspect ratio as original).
- **fetchPriority**: _enum('auto', 'high', 'low')_. Default `auto`.
  - Hint to the browser how it should prioritize fetching a particular image relative to other images.
- **heights**: _number[]_. Array of numbers representing height in pixels.
  - heights numbers must be `<=` image size. Image size is not increased.
  - **widths** have priority over **heights**. Both have priority over **defaultSizes**.
  - (e.g. `widths: [300, 500, 650, 900, 1200]`).
- **incrementSize**: _number_. Default `300`. Customize increment size creation.
  - The increment pixel size `defaultSizes` uses to create images.
  - Only valid if `widths` or `heights` are empty.
  - (e.g. `incrementSize: 200`. Find the smaller image side (width or height), then create _img_ every `200px` until image size is reached).
- **linuxPaths**: _boolean_. Default `true`. Development on Windows, convert image paths to _linux_ style.
- **loading**: _enum('eager', 'lazy')_. Default `eager`. Image loading priority.
- **log**: _boolean_. Default `false`. Output build details to console.log.
  - Includes state and hidden image details: EXIF, XMP, ICC, and GPS metadata.
- **media**: _string[]_. Array of media conditions and image names.
  - Tells browser what image to display based on viewport size.
  - This is solely used for **Art Direction**.
  - (e.g. `media: ['(max-width: 400px) img1-crop.jpg', '(min-width: 401px) img1.jpg']`).
- **nextJS**: _boolean_. Default `false`.
  - Shortcut for: `outDir: 'public'` and `omit: { remove: 'public/' }` options are set.
  - Sets all images to _public_ folder and fixes _image paths_.
- **outDir**: _string_. Default `pic_images`. Custom directory name to create images.
- **omit**: _{ remove?: string, add?: string }_. Object with `remove` and `add` properties.
  - Customize any part of the image path on the `img` or `picture` elements.
  - Does not change the `outDir`. Images will still be created in the `outDir`.
  - (e.g. `omit: { remove: 'pixx_images', add: './my-special-path' }`).
- **picTypes**: _enums('avif', 'gif', 'jpeg', 'jpg', 'png', 'tiff', 'webp')_.
  - Default `['avif', 'webp', 'jpg']`.
  - (e.g. `picTypes: ['webp']`. Create only _webp_ image types).
- **preload**: _boolean_. Default`false`. Create the image _link_ tag for HTML `head` element.
  - Preloading images can optimize load times for critical images.
  - Print the _link_ tag to console.log.
- **preloadFetchPriority**: _enum('auto', 'async', 'sync')_. Default `auto`.
  - [MDN Preload fetchPriority property](https://developer.mozilla.org/en-US/docs/Web/API/HTMLLinkElement/fetchPriority).
- **progressBar**: _boolean_. Default `true`. Show image creation progress bar.
- **returnReact**: _boolean_. Default `false`. Return HTML as React component or string.
- **sizes**: _string[]_. Default `['100vw']`. Array of media conditions and the viewport fill width.
  - [MDN sizes](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/sizes). Informs the browser how much of viewport the image will fill based on the media condition.
  - The _descriptor_ can be any CSS **media condition**.
  - The _value_ can be any **CSS length** except percentage. (e.g. 100rem; 75vw; 500px).
  - The last item in the array is the '_default_' size if _media conditions_ do not match.
  - (e.g. `sizes: ['((min-width: 50em) and (max-width: 60em)) 500px', '75vw']`).
- **styles**: _string_. Inline styles.
  - **React**: `styles: "{ color: 'blue', lineHeight : 10, padding: 20 }"`
  - **HTML**: `styles: "color: blue; font-size: 46px;"`
- **title**: _string_. Text to display as tooltip when hover over image.
- **vite**: _boolean_. Default `false`.
  - Shortcut for: `outDir: 'public'` and `omit: { remove: 'public/' }` options are set.
- **widths**: _number[]_. Array of widths to create images.
  - widths numbers must be `<=` image size. Image size is not increased.
  - **widths** have priority over **heights**. Both have priority over **defaultSizes**.
  - (e.g. `widths: [300, 500, 650, 900, 1200]`).
- **withAnimation**: _boolean_. Default `false`. Sharp image library will retain the image animation.
- **withBlur**: _boolean_. Default `false`. Create **placeholder** image and **base64DataURL**.
  - Print to console.log.
- **withClassName**: _boolean_. Default `true`. Image class attribute.
  - Options: `false = class` | `true = className`.
  - Also changes: `false = srcset` | `true = srcSet`.
  - Also changes: `false = fetchpriority` | `true = fetchPriority`.
- **withMetadata**: _boolean_. Default `false`. Copy original image metadata to new images.

## Dynamic Classes

- Dynamic classes need the **cn** function.

```js
// static classes
const HTML = await pixx('./images/compass.jpg', { classes: ['my-special-class', 'border-blue-200'] });
// returns
<picture>
  ...
  <img
    className="my-special-class border-blue-200"
    src="pixx_images/compass/compass-2560w1920h.jpg"
    alt="image"
    width="2560"
    height="1920"
    loading="eager"
    decoding="auto"
    fetchPriority="auto"
  />
</picture>;

// dynamic classes: names must have 'd:' appending them. See 👇.
// Download cn function
npm i cncn

// commonjs
const cn = require('cncn');
// esm
import cn from 'cncn';

const classVariable = 'some-class';
const pending = true;
const HTML = await pixx('./images/compass.jpg', {
  classes: ['my-special-class', 'd:classVariable', 'border-blue-200', '{ "border-red-200": pending }'],
});
// returns
<picture>
  ...
  <img
    className={cn('one', 'two', 'three', 'border-blue-200', classVariable, { 'border-red-200': pending })}
    src="pixx_images/compass/compass-2560w1920h.jpg"
    alt="image"
    width="2560"
    height="1920"
    loading="eager"
    decoding="auto"
    fetchPriority="auto"
  />
</picture>;
```

## Pixx-Loader Webpack 5 Plugin (NextJS)

- Plugin to use with **NextJS**. `npm i -D pixx`.
- When installing NextJS, you must **use the 'webpack' option**, not 'turbopack'.
- Pixx-Loader will intercept static pages, run pixx, then return HTML to server.
- **Pixx can be used in client or server pages**, because it runs before static html gets to NextJS server.
- Pixx functions will not be in the 'build'.
- **Images not being created**: stop development server. Delete the `.next` folder. Start server.
  - NextJS 'caches' files to speed up development. It also runs file three different times to determine 'server', 'server api' or 'client' page. Avoid the `clean: true` option to prevent drastic slowdown.
- **Caution**: pixx-loader uses `eval()` to run the pixx function. Only use this function in **_development_**.
- **Options**
  - **log**?: _boolean_. Default `false`. Output debug info to console.
  - **isHTML**: _boolean_. Default `false`. Internal usage.
    - `pixx` function returns string, not JSX.
    - If `comment: true`, isHTML is used to determine HTML or JSX style comments.
  - **comment**: _boolean_. Default `false`. Internal usage.
    - Remove `pixx` import statement and functions or comment out.
    - Automatically set to `true` if `overwrite: true`.
  - **overwrite**?: _boolean_. Default `false`.
    - By default PixxLoader will read file, run pixx locally, then send HTML to server.
    - If `overwrite: true`, the file will be updated with HTML and pixx functions and import statements will commented out.
      - Pixx will not run once commented out. This speeds up development when you have finalized images.

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
      // simple
      use: 'pixx',
      // or -for debugging.
      // use: {
      //   loader: 'pixx',
      //   options: {
      //     log: true,
      //   },
      // },
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

## Vite-Plugin-Pixx

- Plugin to be used with **Vite**.
- Vite-Plugin-Pixx will intercept static pages, run pixx, then return **HTML** to _Vite_ server.
- **Pixx is not run on client**, because it runs before static html gets to _Vite_ server.
- Pixx functions will not be included in the 'build'.
- **Caution**: Vite-Plugin-Pixx uses `eval()` to run the pixx function locally. Only use this function in **_development_**.
- **Options**
  - **log**?: _boolean_. Default `false`. Output debug info to console.
  - **isHTML**: _boolean_. Default `false`. Internal usage.
    - `pixx` function returns string, not JSX.
    - If `comment: true`, isHTML is used to determine HTML or JSX style comments.
  - **comment**: _boolean_. Default `false`. Internal usage.
    - Remove `pixx` import statement and functions or comment out.
    - Automatically set to `true` if `overwrite: true`.
  - **overwrite**?: _boolean_. Default `false`.
    - By default Vite-Plugin-Pixx will read file, run pixx locally, then send HTML to Vite server.
    - If `overwrite: true`, the file will be updated with HTML and pixx functions and import statements will commented out.
      - Pixx will not run once commented out. This speeds up development when you have finalized images.

```ts
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

function App() {
  const classVariable = 'hi';
  const pending = true;

  return (
    <div>
      <p>hi</p>
      {pixx(['./images/happy face.jpg', './images/img1.webp'], {
        returnReact: true,
        vite: true,
        sizes: ['(min-width: 500px) 500px', '(max-width: 499px) 50vw', '100vw'],
        media: ['(min-width: 500px) happy face.jpg', '(max-width: 499px) img1.webp'],
        classes: [
          'one',
          'two',
          'three',
          'd:classVariable',
          'border-blue-200',
          '{ "border-red-200": pending }',
        ],
        styles: "{ color: 'blue', lineHeight : 10, padding: 20 }",
      })}
      <p>bye</p>
    </div>
  );
}
export default App;
```

## pixxFlow

- PixxFlow is a static file scraper. It uses the [NPM Glob](https://www.npmjs.com/package/glob) library to search files for the pixx function. Once found, it runs the pixx code, comments out the pixx function and add the HTML to page.
- **HTML**: place a **single** pixx function in a script tag.
- **Caution**: pixxFlow uses `eval()` to run the pixx function. Only use this function in **_development_**.
- **Options**
  - **include**?: _string[]_. Default `['**/*.html', '**/*.jsx', '**/*.tsx']`. Files to include.
    - PixxFlow uses [glob](https://www.npmjs.com/package/glob) to search for files.
  - **ignore**?: _string[]_. Default `['node_modules/**', '**/pixx*']`. Files to ignore.
    - PixxFlow uses [glob](https://www.npmjs.com/package/glob) to ignore files.
  - **log**?: _boolean_. Default `false`. Output debug info to console.
  - **overwrite**?: _boolean_. Default `false`. By default pixxFlow will create a new file.
    - The file will be created in the same directory with 'pixx-' prepending the file name.
      - (e.g.`pixx-fileName.jsx`).
    - If `overwrite: true`, pixxFlow will overwrite the existing file.

```js
// 1. Create a run file in root of directory. e.g. 'file.js'
import { pixxFlow } from 'pixx';

// simple
pixxFlow();

// advanced
pixxFlow({
  log: true,
  include: ['**/*.html', '**/*.tsx', 'src/**/*.jsx'],
  ignore: ['node_modules', '**/pixx*'],
  overwrite: true,
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
        loading="eager"
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
        styles: "color: blue; font-size: 46px;",
        withClassName: false,
      });
    </script> -->
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
  </body>
</html>
```

## License

Published under the Apache-2.0 license. © Bryon Smith 2024.
