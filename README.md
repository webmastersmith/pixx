# pic

## What and Why

- Responsive images can be **complex** and **error prone**. This module tries to simplify the image creation and html code to match.
- Using the _[sharp](https://sharp.pixelplumbing.com/)_ image library, quickly create responsive images, and the HTML code to match.
- Run with _[NodeJS](https://nodejs.org/en/download/package-manager)_ environment.
- Does not increase image size. Start with the largest input image.

## React

- if `isClassName: true`, output html, else output string. Default is true.

## Understanding Responsive Images: Resolutions Switching, Multiple Types, and Art Direction

- All 'responsive image methods' must have `<meta name="viewport" content="width=device-width">` added to the _head_ section of html, for _**mobile browsers**_ to use the actual device viewport in decision making.
- **Responsive Image Advantages**
  - When mobile or desktop browsers download and parse the HTML, the `sizes`, `srcset` and `media` attribute give clues to the browser what images to download.
  - Using these attributes, the browser decides the best image to download based on its viewport and resolution.
  - **srcset**: tells the browser available image widths.
  - **sizes**: tells the browser how much of viewport the image will fill.
  - **media**: completely different images can be offered depending on matching _media_ condition.

## Responsive Images

- Three main ways to use responsive images.
  1. Single image in multiple sizes. (e.g. img-100.jpg, img-200.jpg, img-300.jpg).
  2. Single image in multiple sizes and types. (e.g. img.avif, img.webp, img.jpg).
  3. Multiple images the browser will choose depending on viewport width. (e.g. img-full.jpg, img-crop.jpg)

### Resolution Switching

- Uses the `img` element with the `srcset` and `sizes` attributes.
- **Single image type**. Browsers can choose what image **size** to download based on the device viewport.
- Fallback is the `img src` attribute.
- **Pros**
  - The least complex. Default sizes is `100vw`.
  - Can offer multiple image size options.
- **Cons**
  - Only single image type can be used at a time.

```jsx
// Resolution Switching based on screen resolution.
await pic('img.jpg', { picType: ['jpg'], sizes: ['2x', '3x'] }) // 'img.jpg' will be cut in 1/3 and 1/2.
// returns
<img src="img.jpg" alt="image" srcset="img-1-3.jpg, img-1-2.jpg 2x img.jpg 3x" />
// 👆 No 'sizes' attribute. Browser assumes image will take 100vw.

// Resolution Switching based on viewport size.
await pic('img.jpg', { picType: ['jpg'], widths: [300, 600], sizes: ['300px'] });
// returns
<img src="fallback.jpg" alt="image" srcset="img-300.jpg 300w, img-600.jpg 600w" sizes="300px" />
// 👆 Image will take '300px' of viewport. Choose best image to download.

// Advanced 'sizes' attribute with media queries.
<img
  src="fallback.jpg"
  alt="my img"
  title="my img"
  srcset="img1.jpg 600w, img2.jpg 1200w"
  sizes="(max-width: 600px) 100vw, <-- device with viewport <= 600px, image 100% of viewport.
         (max-width: 1000px) 75vw, <-- device with viewport > 600px but <= 1000px, image 75% of viewport.
                             50vw"  //<-- device with viewport > 1000px, the image will take 50% of viewport.
/>
```

### Multiple Types

- Uses the `picture` and `source` element with the `srcset` and `sizes` attributes.
- Same advantages as Resolution Switching, with the added benefit of multiple formats.
- Fallback is `img` element.
- **Pros**
  - Use new and highly optimized image formats, with fallback formats for browsers that don't support them.
- **Cons**
  - Code can be complex.
  - Order matters. Browser takes the first truthy value.

```html
<!--  Browser knows image will ony take 100px of screen size.  -->
<picture>
  <source srcset="img1.avif 500w, img2.avif 1000w" type="image/avif" sizes="100px" />
  <source srcset="img1.webp 500w, img2.webp 1000w" type="image/webp" sizes="100px" />
  <source srcset="img1.png 500w, img2.png 1000w" type="image/png" sizes="100px" />
  <source srcset="img1.jpg 500w, img2.jpg 1000w" type="image/jpg" sizes="100px" />
  <img src="fallback.jpg" alt="Human" />
</picture>
```

### Art Direction

- Uses the `picture` and `source` element with the `srcset` and `media` attributes.
- Switch different image formats based on first truthy _media_ condition.
- fallback is `img` element.
- **Pros**
  - Switch image format based viewport size.
- **Cons**
  - Code can be complex.
  - Order matters. Browser takes the first truthy value.

```html
<!-- Example of Art Direction. browser takes first format it understands and first truthy media condition  -->
<picture>
  <!-- viewport under 800px, image aspect ratio 9:16 -->
  <source media="(max-width: 799px)" type="image/avif" srcset="img1_9-16.avif 500w, img2_9-16.avif 1000w" />
  <source media="(max-width: 799px)" type="image/jpg" srcset="img1_9-16.jpg 500w, img2_9-16.jpg 1000w" />
  <!-- viewport 800px or more, image aspect ratio 16:9 -->
  <source media="(min-width: 800px)" type="image/avif" srcset="img1_16-9.avif 500w, img2_16-9.avif 1000w" />
  <source media="(min-width: 800px)" type="image/jpg" srcset="img1_16-9.jpg 500w, img2_16-9.jpg 1000w" />
  <img src="fallback.jpg" alt="my image" />
</picture>
```

## Install & Run

- `comming soon`

```js
// To use
import pic from 'pic';
pic('path/file.jpg');
```

## URL Options

- **alt**: default `image`. The 'img' alt attribute.
- **animation**: default `false`. Does image have animations?
- **classes**: array of class names.
- **clean**: default `false`. Delete image folder and create new.
- **fallbackSize**: default `input image`. Image used for the 'src' attribute. Customize the 'width' in pixels.
  - Older browsers fallback to this image. Image will always be type `jpg`.
  - (e.g. `1500`. The fallback _src_ image will be an image 1500px wide with height same aspect ratio as original).
- **heights**: Array of heights to create images. To create custom _Aspect Ratio_, both widths and heights must be provided.
- **increment**: default `300`. Custom default image size creation. Only runs if `widths` or `heights` are empty.
  - increment example: Create _img_ every `300px` until image size is reached.
- **isClassName**: default `true`. Image class attribute. Options: `false = class` | `true = className`.
- **loading**: default `eager`. Image loading attribute: `eager` | `lazy`.
- **log**: default `false`. Output to console, state and image EXIF, XMP, ICC, and GPS metadata.
- **outDir**: default `pic_images`. Where to create images?
- **picTypes**: default `['avif', 'webp', 'jpg']`. What image types to create.
  - picTypes available options: `['avif', 'gif', 'jpeg', 'jpg', 'png', 'tiff', 'webp']`.
- **returnHTML**: default `true`. _pic_ function can return results as HTML or string.
- **sizes**: default `['100vw']`. Array of image widths you would like.
- **showHidden**: default `false`.
- **title**: default "". Text to display as tooltip.
- **widths**: Array of widths to create images. To create custom _Aspect Ratio_, both widths and heights must be provided.

## Examples

### Default

```ts
import pic from 'pic';

// defaults
await pic('img.jpg', {
  alt: 'image',
  animation: false,
  classes: [], // e.g. ['my-class', 'm-8', 'w-[350px]']
  clean: false,
  fallbackSize: 0, // if not provided, will be original image as a jpg.
  heights: [], // e.g. [450, 600, 1200]
  increment: 300,
  isClassName: true, // <img className=''>
  loading: 'eager',
  log: true,
  outDir: 'pic_images',
  picTypes: ['avif', 'webp', 'jpg'],
  sizes: ['100vw'],
  title: '',
  widths: [], // e.g. [50, 500, 1000]
});
```

### Resolution Switching

```js
import { createImages } from 'solid-image';
createImages(
  'public/header/logo/bolt.gif?w=25;55&f=gif:4&animated=true&sizes=62px&c=bolt&alt=lighting bolt image'
);
// or
createImages([
  //must be nested array.
  [
    'public/header/logo/bolt.gif',
    'w=25;55',
    'f=gif:4',
    'animated=true',
    'sizes=62px',
    'c=bolt',
    'alt=lighting bolt image',
  ],
]);
```

### Multiple Formats

```js
import { createImages } from 'solid-image';
// w=300. Original image is 265w x 253h. Image will be enlarged.
createImages(
  'public/header/texasFlag.png?w=100;200;300&f=png;avif;webp&fallbackWidth=100&alt=Image of Texas Flag&sizes=100px&c=texasImage&sharpen=true'
);
```

**YourComponent.tsx**

```tsx
import styles from './TexasImage.module.scss';

export default function TexasImage() {
  return (
    <picture class={styles.texasImage}>
      <source
        type="image/avif"
        srcset="/header/texasFlag/texasFlag_20-19_100x95.avif 100w, /header/texasFlag/texasFlag_22-21_200x191.avif 200w, /header/texasFlag/texasFlag_22-21_265x253.avif 265w"
        sizes="100px"
      />
      <source
        type="image/webp"
        srcset="/header/texasFlag/texasFlag_20-19_100x95.webp 100w, /header/texasFlag/texasFlag_22-21_200x191.webp 200w, /header/texasFlag/texasFlag_22-21_265x253.webp 265w"
        sizes="100px"
      />
      <source
        type="image/png"
        srcset="/header/texasFlag/texasFlag_20-19_100x95.png 100w, /header/texasFlag/texasFlag_22-21_200x191.png 200w, /header/texasFlag/texasFlag_22-21_265x253.png 265w"
        sizes="100px"
      />
      <img
        src="/header/texasFlag/texasFlag_20-19_100x95.png"
        width="100"
        height="95"
        alt="Image of Texas Flag"
        class={styles.texasImage}
        loading="lazy"
      />
    </picture>
  );
}
```

### Art Direction

- To use _Art Direction_ provide array of images that match the array of `media` conditions.
- Art Direction allows you to switch image based on _media_ breakpoints.
- `media` and `sizes` are used.

```js
import pic from 'webpic';
await pic(['img1.jpg', 'img2.jpg'], {
  media: ['(max-width: 520px)', '(max-width: 800px)', '(min-width: 801px)'], // must have. Order matters. First truthy value.
});
createImages([
  [
    'public/hero/hero-full.jpg',
    'w=600;800;1200;2400',
    'a=9:16',
    'f=avif;webp;jpg',
    'alt=Image of house and pool with custom lighting',
    'sizes=100vw',
    'c=heroImage',
    'media=(max-width: 600px)',
  ],
  // fallback info comes from last url.
  [
    'public/hero/hero.jpg',
    'w=600;800;1200;2400',
    'a=16:9',
    'f=avif;webp;jpg',
    'fallbackWidth=700',
    'fallbackFormat=jpg',
    'alt=Image of house and pool with custom lighting',
    'sizes=100vw',
    'c=heroImage',
    'media=(min-width: 601px)',
    'sharpen=true',
    'loading=eager',
  ],
]);
```

**YourComponent.tsx**

```tsx
import styles from './HeroImage.module.scss';

export default function HeroImage() {
  return (
    <picture class={styles.heroImage}>
      <source
        type="image/avif"
        srcset="/hero/hero-full/hero-full_9-16_600x1067.avif 600w, /hero/hero-full/hero-full_9-16_800x1422.avif 800w, /hero/hero-full/hero-full_9-16_900x1600.avif 900w"
        sizes="100vw"
        media="(max-width: 600px)"
      />
      <source
        type="image/webp"
        srcset="/hero/hero-full/hero-full_9-16_600x1067.webp 600w, /hero/hero-full/hero-full_9-16_800x1422.webp 800w, /hero/hero-full/hero-full_9-16_900x1600.webp 900w"
        sizes="100vw"
        media="(max-width: 600px)"
      />
      <source
        type="image/jpg"
        srcset="/hero/hero-full/hero-full_9-16_600x1067.jpg 600w, /hero/hero-full/hero-full_9-16_800x1422.jpg 800w, /hero/hero-full/hero-full_9-16_900x1600.jpg 900w"
        sizes="100vw"
        media="(max-width: 600px)"
      />
      <source
        type="image/avif"
        srcset="/hero/hero/hero_16-9_600x338.avif 600w, /hero/hero/hero_16-9_800x450.avif 800w, /hero/hero/hero_16-9_1200x675.avif 1200w, /hero/hero/hero_16-9_2400x1350.avif 2400w"
        sizes="100vw"
        media="(min-width: 601px)"
      />
      <source
        type="image/webp"
        srcset="/hero/hero/hero_16-9_600x338.webp 600w, /hero/hero/hero_16-9_800x450.webp 800w, /hero/hero/hero_16-9_1200x675.webp 1200w, /hero/hero/hero_16-9_2400x1350.webp 2400w"
        sizes="100vw"
        media="(min-width: 601px)"
      />
      <source
        type="image/jpg"
        srcset="/hero/hero/hero_16-9_600x338.jpg 600w, /hero/hero/hero_16-9_800x450.jpg 800w, /hero/hero/hero_16-9_1200x675.jpg 1200w, /hero/hero/hero_16-9_2400x1350.jpg 2400w"
        sizes="100vw"
        media="(min-width: 601px)"
      />
      <img
        src="/hero/hero/hero_16-9_700x394.jpg"
        width="700"
        height="394"
        alt="Image of house and pool with custom lighting"
        class={styles.heroImage}
        loading="eager"
      />
    </picture>
  );
}
```

## License

Published under the Apache-2.0 license. © Bryon Smith 2024.
