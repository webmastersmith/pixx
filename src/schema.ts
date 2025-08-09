import type fs from 'node:fs';
import { unknown, z } from 'zod';
import type { Metadata } from 'sharp';
import type path from 'node:path';

// JSX vs HTML
// https://react.dev/reference/react-dom/components/common
// 1. Close all the tags: JSX requires tags to be explicitly closed: self-closing tags like <img> must become <img />.
// 2. Style: An object with CSS styles, for example { fontWeight: 'bold', margin: 20 }

export const HTML: TCSS = {
  fetchPriority: 'fetchpriority',
  backgroundImage: 'background-image',
  backgroundSize: 'background-size',
  separator: ';',
  quote: "'",
  className: 'class',
  srcSet: 'srcset',
  leftBracket: '"',
  rightBracket: '"',
};
export const JSX: TCSS = {
  fetchPriority: 'fetchPriority',
  backgroundImage: 'backgroundImage',
  backgroundSize: 'backgroundSize',
  separator: ',',
  quote: '"',
  className: 'className',
  srcSet: 'srcSet',
  leftBracket: '{',
  rightBracket: '}',
};

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

// sharp input images
const acceptableInputImageTypes = ['avif', 'gif', 'jpeg', 'jpg', 'png', 'tiff', 'webp', 'svg'] as const;
export const InputImageTypeSchema = z.enum(acceptableInputImageTypes, {
  error: `Sharp image library only excepts image types: ${acceptableInputImageTypes.join(', ')}.`,
});

// sharp output images
const acceptableOutputImageTypes = ['avif', 'gif', 'jpeg', 'jpg', 'png', 'tiff', 'webp'] as const;
export const OutputImageTypeSchema = z.enum(acceptableOutputImageTypes, {
  error: `Sharp image library only creates image types: ${acceptableOutputImageTypes.join(', ')}.`,
});
export type OutputImageType = z.infer<typeof OutputImageTypeSchema>;

// omit and replace
const OmitSchema = z.object({
  remove: z.string({ error: 'omit "remove" option must be string.' }),
  add: z.string({ error: 'omit "add" option must be string.' }),
});

// check options
export const OptionSchema = z.object({
  aboveTheFold: z.boolean({ error: 'clean option must be true or false.' }), //.default(false),
  alt: z.string({ error: 'alt option must be string.' }), // .default('pixx_image'),
  backgroundSize: z.string({ error: 'backgroundSize option must be a string.' }), //.default('cover'),
  blurSize: z.number({ error: 'blurSize option must be a number.' }), //.default(16),
  // blurOnly: z.boolean({ error: 'blurOnly option must be true or false.' }), //.default(false),
  classes: z.string({ error: 'classes option must an array of strings.' }).array(), //.default([]),
  clean: z.boolean({ error: 'clean option must be true or false.' }), //.default(false),
  decoding: z.enum(['auto', 'sync', 'async'], {
    error: 'decoding option can only be "auto", "sync" or "async".',
  }),
  // .default('auto'),
  fallbackWidth: z.number({ error: 'fallbackWidth option must be a number.' }), //.default(0),
  fetchPriority: z.enum(['auto', 'high', 'low'], {
    error: 'fetchPriority option can only be "auto", "high" or "low".',
  }), // .default('auto'),
  heights: z.number({ error: 'heights option must be an array of numbers.' }).array(), //.default([]),
  incrementSize: z.number({ error: 'incrementSize option must be a number.' }), //.default(300),
  jsx: z.boolean({ error: 'html option must be true or false.' }), //.default(true),
  linuxPaths: z.boolean({ error: 'linuxPaths option must be true or false.' }), //.default(true),
  loading: z.enum(['eager', 'lazy'], { error: 'loading option can only be "eager" or "lazy".' }), // .default('lazy'),
  log: z.boolean({ error: 'log option must be true or false.' }), //.default(false),
  media: z.string({ error: 'media option must an array of strings.' }).array(), //.default([]),
  // nextjs: z.boolean({ error: 'nextjs option must be true or false.' }), //.default(false),
  newImagesDirectory: z.string({ error: 'newImagesDirectory option must be a string.' }), //.default('pixx_images'),
  omit: OmitSchema, //.default({ remove: '', add: '' }),
  picTypes: OutputImageTypeSchema.array().min(1), //.default(['avif', 'webp', 'jpg']),
  preloadWidth: z.number({ error: 'preloadWidth option must be a number.' }), //.default(0),
  // returnJSX: z.boolean({ error: 'returnJSX option must be true or false.' }), //.default(false),
  showProgressBar: z.boolean({ error: 'progressBar option must be true or false.' }), //.default(false),
  sizes: z.string({ error: 'sizes option must be an array of strings.' }).array(), //.default(['auto']),
  styles: z.string({ error: 'styles option must an object or string.' }).array(), //.default([]),
  // styles: z.string({ error: 'styles option must be a string.' }), //.default(''),
  title: z.string({ error: 'title option must be a string.' }), //.default(''),
  vite: z.boolean({ error: 'vite option must be true or false.' }), //.default(false),
  v: z.custom<unknown[]>(), //.default([]),
  // / 'v: z.array(), //.default([]),
  widths: z.number({ error: 'widths option must be an array of strings.' }).array(), //.default([]),
  withAnimation: z.boolean({ error: 'withAnimation option must be true or false.' }), //.default(false),
  withBlur: z.boolean({ error: 'withBlur option must be true or false.' }), //.default(false),
  withMetadata: z.boolean({ error: 'withMetadata option must be true or false.' }), //.default(false),
  withPreload: z.boolean({ error: 'withPreload option must be true or false.' }), //.default(false),
});
type NonNullable<T> = Exclude<T, null | undefined>; // remove undefined from property.
export type OptionType = z.input<typeof OptionSchema>; // Required removes '?'.
export type PicTypes = z.input<typeof OutputImageTypeSchema>;
export type PicTypesPlus = Record<PicTypes, string>;

// Sharp Metadata with  width/height number[]
// export type Meta = Omit<Metadata, 'width' | 'height'> & { width: number; height: number };
export type TImageMeta = {
  sharpMeta: Metadata;
  file: path.ParsedPath;
  buf: Buffer;
  aspectRatio: string;
  // paths: string;
  absoluteNewImageDir: string;
  fallbackImage: TNewImageMeta;
  preloadImage?: TNewImageMeta;
  blurImage?: TBlurImageMeta;
  classStr: string;
  totalImages: number;
  imageSizes: number[];
  images: TNewImageMeta[];
  mediaCondition: string;
  fallbackWidth: number;
  isFallbackImage: boolean;
  createdImageCount: number;
  sources: { type: string; srcset: string }[];
  srcsetByType: PicTypesPlus;
  styles: string;
};

export type TCSS = {
  fetchPriority: string;
  backgroundImage: string;
  backgroundSize: string;
  separator: string;
  quote: string;
  className: string;
  srcSet: string;
  leftBracket: string;
  rightBracket: string;
};

export type TStore = {
  isArtDirection: boolean;
  isResolutionSwitching: boolean;
  csp: { styleSrc: string[]; imgSrc: string[] };
  imagesMeta: TImageMeta[];
  originalImagePaths: string[];
  options: OptionType;
  css: TCSS;
  totalImageCount: number;
  createdImageCount: number;
  isDynamicClasses: boolean;
};

export type TNewImageMeta = {
  width: number;
  height: number;
  file: path.ParsedPath;
  absolutePath: string;
  HTMLPath: string;
};

export type TBlurImageMeta = Omit<TNewImageMeta, 'HTMLPath' | 'absolutePath'> & {
  blurDataURL: string;
};

export type Pixx = (FilePaths: string | string[], options?: OptionType) => Promise<string>;

export type PixxFlowOptions = {
  include?: string[];
  ignore?: string[];
  log?: boolean;
  overwrite?: boolean;
  isHTML?: boolean;
  comment?: boolean;
};

export type PixxPluginInput =
  | {
      log?: boolean;
      overwrite?: boolean;
      isHTML?: boolean;
      comment?: boolean;
      regularExpression?: string;
    }
  | undefined;

export type PixxPluginOptions = NonNullable<Required<PixxPluginInput>>;
