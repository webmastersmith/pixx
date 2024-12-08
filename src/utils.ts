import fs from 'fs';
import path from 'path';
import sharp, { Metadata } from 'sharp';
import { FilePathSchema, FilePathType, StateType, OutputImageType, OptionSchema, OptionType } from '@/schema';
import exifr from 'exifr';
import sizeOf from 'image-size';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Tailwind 'cn' function.
 * @param inputs array of class names and conditional object classes.
 * @returns class names.
 */
export function cn(inputs: ClassValue[]) {
  return twMerge(clsx(inputs)); // inputs must b
}

/**
 * Initial setup for each image. Create metadata and convert image to buffer. Create fallback image.
 * @param filePath Array of images for 'Art Direction' or single image path.
 * @param options optional. Object of available options.
 * @returns state object.
 */
export async function getState(filePath: string, options: OptionType) {
  // Run all check on data before creating images.
  // throw error if options are not correct.
  const optionsParsed = OptionSchema.parse(options);
  // throw error is image cannot be found.
  const { file, buf } = getFile(filePath);
  // get image metadata. Throw error if width or height cannot be determined.
  const meta = await getMetadata(buf, optionsParsed);
  // get file names. create outDir, clean?
  const paths = createNewImageDir(optionsParsed, file, meta);
  // defaults
  const state = {
    ...optionsParsed,
    meta,
    file,
    buf,
    paths,
    aspectRatio: getAspectRatio(meta.width! / meta.height!),
    defaultSizes: defaultSize(meta.width, meta.height, optionsParsed.increment!),
  } as StateType;

  // All checks pass. Start creating images.
  // create fallback image.
  const size: never[] | ['width', number] = state.fallbackWidth ? ['width', state.fallbackWidth] : [];
  const [newImagePath, { width, height }] = await createImage(state, size, 'jpg');
  state.fallbackPath = newImagePath;
  // get class names
  state.classStr = cn(state.classes);

  if (state.log) console.log('state: ', state);
  return state;
}

/**
 * Get original image size and format.
 * @param sharpDetails image state
 * @returns object: width, height, format
 */
export async function getMetadata(buf: Buffer, options: OptionType) {
  const details = await sharp(buf).metadata();
  // Make sure width, height are included in the metadata.
  if (!details.width || !details.height || Number.isNaN(+details.width) || Number.isNaN(+details.height)) {
    const dimensions = sizeOf(buf);
    console.log('Width and Height attributes are missing from image metadata. Adding...');
    console.log(dimensions);
    // throw error is second attempt to get image width, height fails.
    if (
      !dimensions.width ||
      !dimensions.height ||
      Number.isNaN(+dimensions.width) ||
      Number.isNaN(+dimensions.height)
    )
      throw new Error('Image Width or Height could not be determined.');
    // add width and height to metadata.
    details.width = dimensions.width;
    details.height = dimensions.height;
  }
  // show image EXIF, TIFF, GPS, XMP, IPTC, ICC, JFIF/Thumbnail data.
  if (options?.log) {
    console.log('exifr', await exifr.parse(buf, true));
  }
  return details;
}

/**
 * Split media condition. e.g. '(max-width: 600px) 100vw'
 * @param condition media condition and path or size.
 * @returns array with media and path or size. e.g. [media, size]
 */
export function splitCondition(condition: string) {
  // if only descriptor.
  if (!/\) /.test(condition)) return [false, condition];
  // media condition and descriptor.
  const idx = condition.lastIndexOf(') ') + 1;
  return [condition.substring(0, idx).trim(), condition.substring(idx + 1).trim()];
}

/**
 * When no options are passed in, create image sizes every 300px
 * @param width original image width.
 * @param height original image height.
 */
export function defaultSize(
  width: number = 0,
  height: number = 0,
  increaseSize: number
): ['width' | 'height', number[]] {
  // return early if not a number or less than 1.

  // width, height ok, get default sizes.
  let size = increaseSize;
  const sizes: number[] = [];
  // return the smaller side
  const smallSide = width <= height ? width : height;
  const key = width <= height ? 'width' : 'height';
  while (size < smallSide) {
    if (size < smallSide) {
      sizes.push(size);
      size += increaseSize;
    } else {
      // check if image was smaller than increaseSize;
      if (sizes.length === 0) {
        console.error('Image increase size was bigger than image.');
        sizes.push(smallSide);
      }
      return [key, sizes];
    }
  } // end while
  // add original image size into mix.
  if (size !== smallSide) sizes.push(smallSide);
  return [key, sizes];
}

/**
 * Destructure file path and image name.
 * Throw error is path is faulty or images does not exist.
 * @param filePath path of image.
 */
export function getFile(filePath: string): { file: FilePathType; buf: Buffer } {
  if (!fs.existsSync(filePath)) throw new Error(`File not found: ${filePath}`);
  const paths = filePath.split(/\/|\\/);
  const image = paths.pop();
  const lastIndex = image?.lastIndexOf('.');
  const name = image?.slice(0, lastIndex);
  const ext = image?.slice(lastIndex! + 1).toLowerCase();
  const rootPath = path.join(...paths); // if 'paths' is empty, will return '.'
  const preFile = { rootPath, image, name, ext };
  const file = FilePathSchema.parse(preFile);
  return { file, buf: fs.readFileSync(filePath) };
}

/**
 * Create start directories and image path names.
 * @param options passed in options
 * @param file image file name
 * @returns paths for images
 */
export function createNewImageDir(options: OptionType, file: FilePathType, meta: Metadata) {
  // newImage directory path
  const newImageDir = path.join(options?.outDir!, file.name);
  // clean?
  if (options?.clean) fs.rmSync(newImageDir, { recursive: true, force: true });
  // create image directory
  if (!fs.existsSync(newImageDir)) fs.mkdirSync(newImageDir, { recursive: true });
  return { newImageDir };
}

/**
 * When given image (width / height), find closest aspect ratio.
 * @param val (width / height)
 * @returns  string. ex.. '16:9'
 */
export function getAspectRatio(val: number) {
  const [w, h] = AspectRatio(val, 21);
  return `${w}:${h}`;
  function AspectRatio(val: number, lim: number) {
    let lower: [number, number] = [0, 1];
    let upper: [number, number] = [1, 0];

    while (true) {
      let mediant: [number, number] = [lower[0] + upper[0], lower[1] + upper[1]];

      if (val * mediant[1] > mediant[0]) {
        if (lim < mediant[1]) {
          return upper;
        }
        lower = mediant;
      } else if (val * mediant[1] == mediant[0]) {
        if (lim >= mediant[1]) {
          return mediant;
        }
        if (lower[1] < upper[1]) {
          return lower;
        }
        return upper;
      } else {
        if (lim < mediant[1]) {
          return lower;
        }
        upper = mediant;
      }
    }
  }
}

/**
 * When given width or height and (original image dimensions or aspect ratio), return opposite.
 * @param orgWidth original image width
 * @param orgHeight original image height
 * @param desiredDimension the width or height you would like image to be.
 * @param height boolean. If true return desired height.
 * @param desiredAspectRatio string. Change the aspect ratio of image.
 * @returns height or width needed to achieve aspect ratio.
 */
export function getDimension({
  orgWidth,
  orgHeight,
  desiredDimension,
  returnHeight = true, // return height default.
  aspectRatio = '',
}: {
  orgWidth: number;
  orgHeight: number;
  desiredDimension: number;
  returnHeight?: boolean;
  aspectRatio?: string;
}): number {
  let left, right;
  // if aspectRatio, use that for formula.
  if (aspectRatio) {
    const [w, h] = aspectRatio.split(':');
    // h = orgHeight/orgWidth*desiredWidth
    // w = orgWidth/orgHeight*desiredHeight
    left = returnHeight ? +h! : +w!;
    right = returnHeight ? +w! : +h!;
  } else {
    left = returnHeight ? orgHeight : orgWidth;
    right = returnHeight ? orgWidth : orgHeight;
  }
  return Math.round((left / right) * desiredDimension);
}

/**
 * Create image from given dimensions.
 * @param state state object
 * @param size array with 'width' | 'height' and desired dimension
 * @param type desired image type: ['avif', 'gif', 'jpeg', 'jpg', 'png', 'tiff', 'webp']
 * @returns undefined
 */
export async function createImage(
  state: StateType,
  size: never[] | ['width' | 'height', number],
  type: OutputImageType
): Promise<[string, { width: number; height: number }]> {
  let w: number;
  let h: number;
  // if empty size, create same size as original image with desired format.
  if (!size.length) {
    w = state.meta.width!;
    h = state.meta.height!;
  } else {
    const dimension = {
      orgWidth: state.meta.width!,
      orgHeight: state.meta.height!,
      desiredDimension: size[1],
      returnHeight: size[0] === 'width',
    };
    // get missing dimension
    const missing = getDimension(dimension);
    // record
    if (size[0] === 'width') {
      w = size[1];
      h = missing;
    } else {
      w = missing;
      h = size[1];
    }
  } // end else
  // create subfolder path
  const newImagePath = path.join(state.paths.newImageDir, `${state.file.name}-${w}w${h}h.${type}`);
  const options = size.length ? { [size[0]]: size[1] } : {};
  // only create if marked clean, or image does not exist.
  if (!fs.existsSync(newImagePath)) {
    if (state.withMetadata)
      await sharp(state.buf).withMetadata().resize(options).toFormat(type).toFile(newImagePath);
    else await sharp(state.buf).resize(options).toFormat(type).toFile(newImagePath);
  }
  return [newImagePath, { width: w, height: h }];
}

/**
 * Create images and return srcset string.
 * @param state state object
 * @param type image exstension type
 * @returns srcset string
 */
export async function createSrcSet(state: StateType, type: OutputImageType) {
  // create images from: width or height.or defaultSizes.
  let srcset = [];
  const sizes = state.widths.length
    ? state.widths
    : state.heights.length
    ? state.heights
    : state.defaultSizes![1];
  const key = state.widths.length ? 'width' : state.heights.length ? 'height' : state.defaultSizes![0];
  for (const size of sizes as number[]) {
    const [imagePath, { width, height }] = await createImage(state, [key, size], type);
    srcset.push(`${imagePath} ${width}w`);
  }
  return srcset.join(', ');
}

/**
 * Create a 'responsive img' or 'fallback img' element.
 * @param state state object
 * @param isPicture boolean. Is the img fallback for picture element.
 * @returns img element
 */
export async function createImgTag(state: StateType, isPicture: boolean = false) {
  const c = state.isClassName ? 'className' : 'class';
  let imgStr = '';
  // create img element
  imgStr += '<img ';
  imgStr += state.classStr ? `${c}="${state.classStr}" ` : '';
  // create srcset
  imgStr += !isPicture ? `srcset="${await createSrcSet(state, state.picTypes[0] as OutputImageType)}" ` : '';
  // create sizes
  imgStr += !isPicture ? `sizes="${state.sizes.join(', ')}" ` : '';
  imgStr += `src="${state.fallbackPath}" `;
  imgStr += `alt="${state.alt}" `;
  imgStr += state.title ? `title="${state.title}" ` : '';
  imgStr += `loading="${state.loading}" `;
  imgStr += '/>';
  return imgStr;
}

export async function createSourceTag(state: StateType, type: OutputImageType) {
  let source = '<source ';
  source += `type="image/${type}" `;
  source += `sizes="${state.sizes.join(', ')}" `;
  source += `srcset="${await createSrcSet(state, type)}" `;
  source += '/>';
  return source;
}
