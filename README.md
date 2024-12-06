# pic

### What it does?

- Quickly create responsive images, and the HTML img/picture element code is output to the console.
- Run with _NodeJS_ environment.

### Why

- Responsive images can be complex and error prone. For instance, if you want resolution switching, `<img srcset="..."` and you accidentally forget the [`sizes` attribute, the browser will ignore `srcset` and use the fallback `src` attribute.](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/srcset) The `media` attribute [should only be used with Art Direction.](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images#art_direction) There are many more small "gotcha's" that can be avoided through automation.
- Run during build to ensure img/picture element is available when the HTMl is loaded, then the browser can download the correct images.

## Install & Run

- `comming soon`

```js
// To use
import pic from 'pic';
pic('path/file.jpg');
```

## Understanding Resolutions Switching, Multiple Formats, Art Direction

### Resolution Switching

- Adds two new attributes: `srcset` and `sizes` to the `img` element.
- must have `<meta name="viewport" content="width=device-width">` to the _head_ section of html for the browser to use the device width in decision making.
- Allow browsers to download images based on device width.
- **Pros**
  - The most performant. The browser downloads the HTML first. With the `sizes` attribute, the browser deicides what image it wants from the `srcset` attribute and starts downloading. This happens before other assets are downloaded.
  - Older browsers 'fallback' to the _src_ attribute.
- **Cons**
  - only one image format can be used.
  - if you forget the `sizes` attribute, `srcset` is ignored.
    - **srcset**: describes the image width.
      - e.g. width: `<img src="file.jpg" srcset="file-200.jpg 200w, file-400.jpg 400w">`
      - e.g. resolution: `<img src="file.jpg" srcset="file-200.jpg, file-400.jpg 2x">`
    - **sizes**: Informs browser how much of viewport the image will fill at a certain 'media' conditions.
      - last 'sizes' item is the 'default', when no media conditions are true.
      - e.g. `<img sizes="(max-width: 600px) 200px, 400px">`
        - if device width is <=600px, use file-200.jpg, else use file-400.jpg

```html
<!-- This image takes 100% viewport width. Browser will choose the image based on screen size. 500w or 1000w  -->
<img srcset="img1.jpg 500w, img2.jpg 1000w" sizes="100vw" src="fallback.jpg" alt="my img" />

<!-- Advanced sizes: A device viewport over 600px, the image will only take 50% of viewport -->
<img
  src="fallback.jpg"
  alt="my img"
  srcset="img1.jpg 600w, img2.jpg 1200w"
  sizes="(max-width: 600px) 100vw, <!-- device with viewport <= 600px, image 100% of viewport.
         (max-width: 1000px) 75vw, <!-- device with viewport > 600px but <= 1000px, image 75% of viewport.
                             50vw" /> <!-- device with viewport > 1000px, the image will take 50% of viewport.>
```

### Multiple Formats

- uses the `picture` element.
- fallback is `img` element.
- **Pros**
  - Allows the use of new and highly optimized image formats, and fallback formats for browsers that don't support newer formats.
- **Cons**
  - code is complex and easy to get wrong.
  - order matters. Browser takes the first truthy value.

```html
<!-- browser takes first format it understands. Add newest type first.  -->
<picture>
  <source srcset="image-1.avif 500w, image-2.avif 1000w" type="image/avif" sizes="100px" />
  <source srcset="image-1.webp 500w, image-2.webp 1000w" type="image/webp" sizes="100px" />
  <source srcset="image-1.png 500w, image-2.png 1000w" type="image/png" sizes="100px" />
  <img src="image-1.png" alt="Human" loading="lazy" width="500" height="836" />
</picture>
```

### Art Direction

- uses the `picture` element.
- **Pros**
  - Switch image based on different devices screen size.
  - Can also use multiple formats.
- **Cons**
  - This can be the most complex code.
  - order matters. Browser takes the first truthy value.
  - must use the `media` attribute.

```html
<!-- Example of Art Direction. browser takes first format it understands and first truthy media condition  -->
<picture>
  <!-- aspect ratio 9:16 -->
  <source media="(max-width: 799px)" type="image/avif" srcset="image-1_aspect_9-16.avif w500" />
  <source media="(max-width: 799px)" type="image/jpg" srcset="image-1_aspect_9-16.jpg w500" />
  <!-- aspect ratio 16:9 -->
  <source media="(min-width: 800px)" type="image/avif" srcset="image-1_aspect_16-9.avif w500" />
  <source media="(min-width: 800px)" type="image/jpg" srcset="image-1_aspect_16-9.jpg w500" />
  <img src="image.jpg" alt="my image" />
</picture>
```

## URL Options

- **alt**: default `image`. The 'img' alt attribute.
- **animation**: default `false`. Does image have animations?
- **classes**: array of class names.
- **clean**: default `false`. Always create new images?
- **fallbackSize**: default `input image`. Image used for the 'src' attribute. Customize the 'width' in pixels.
  - Older browsers fallback to this image. Image will always be type `jpg`.
  - (e.g. `1500`. The fallback _src_ image will be an image 1500px wide with height same aspect ratio as original).
- **heights**: Array of heights to create images. To create custom _Aspect Ratio_ widths and heights must be provided.
- **increment**: default `300`. Custom default image size creation. Only runs if `widths` or `heights` are empty.
  - increment example: Create _img_ every `300px` until image size is reached.
- **isClassName**: default `true`. Image class attribute. Options: `false = class` | `true = className`.
- **loading**: default `eager`. Image loading attribute: `eager` | `lazy`.
- **log**: default `true`. Output created html to console.
- **outDir**: default `pic_images`. Where to create images?
- **picTypes**: default `['avif', 'webp', 'jpg']`. What image types to create.
  - picTypes available options: `['avif', 'gif', 'jpeg', 'jpg', 'png', 'tiff', 'webp']`.
- **widths**: Array of widths to create images. To create custom _Aspect Ratio_ widths and heights must be provided.

## Examples

### URL Examples

**YourFileName.js**

```ts
import { createImages } from 'solid-image';

createImages('public/hero/hero.jpg?w=300;600;900&f=avif;webp;jpg&sharpen=true&alt=my image');
// or
createImages([
  'public/hero/hero.jpg?a=9:16w=300;600;900&f=avif;webp;jpg&sharpen=true&alt=my image',
  'public/hero/hero.jpg?a=16:9w=300;600;900&f=avif;webp;jpg&sharpen=true&alt=my image'
])
// or
createImages([
  [
    'public/hero/hero.jpg', // first item must be image path.
    'a=9:16',
    'w=300;600;900',
    'f=avif;webp;jpg',
    'sharpen=true'
    'alt=my image',
  ],
  [
    'public/hero/hero.jpg', // can be same image, different aspectRatio or different image.
    'a=16:9',
    'w=300;600;900',
    'f=avif;webp;jpg',
    'sharpen=true'
    'alt=my image',
  ]
])
```

### Resolution Switching Example

- single url
- single format
- multiple widths

**YourFileName.js**

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

**YourComponent.tsx**

```tsx
import styles from './Logo.module.scss';

export default function Logo(props: any) {
  return (
    <img
      srcset="/header/logo/bolt/bolt_2-3_25x37.gif 25w, /header/logo/bolt/bolt_2-3_55x81.gif 55w"
      sizes="62px"
      src="/header/logo/bolt/bolt_2-3_55x81.gif"
      alt="lighting bolt image"
      class={styles.bolt}
      width="55"
      height="81"
      loading="lazy"
    />
  );
}
```

### Multiple Formats Example

- single url
- multiple formats
- mutiple widths

**YourFileName.js**

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

### Art Direction Example

- multiple urls
- multiple image formats
- multiple widths

**YourFileName.js**

```js
import { createImages } from 'solid-image';
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
