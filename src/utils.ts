import * as fs from 'fs';
import * as path from 'path';
import sharp, { Metadata } from 'sharp';
import {
  FilePathSchema,
  FilePathType,
  StateType,
  OutputImageType,
  OptionSchema,
  OptionType,
  OptionRequiredType,
} from '@/schema';
import exifr from 'exifr';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import chalk from 'chalk';
import sizeOf from 'image-size';

/**
 * Progress bar. bar(1, 25). creates 'one' tick. bar(2, 25). creates second tick.
 * @param step one tick of the progress bar
 * @param totalSteps Total expected ticks.
 */
export function bar(name: string, step: number, totalSteps: number) {
  // Drawing the Progress Bar Image
  const drawProgressBar = (progress: number) => {
    const barWidth = 30; // length of bar.
    const filledWidth = Math.floor((progress / 100) * barWidth);
    const emptyWidth = barWidth - filledWidth;
    const progressBar = chalk.cyan('█').repeat(filledWidth) + chalk.cyan('▒').repeat(emptyWidth);
    return `[${progressBar}] ${progress}%`;
  };
  // write to console.
  const progressPercentage = Math.floor((step / totalSteps) * 100);
  process.stdout.clearLine(0);
  process.stdout.cursorTo(0);
  process.stdout.write(`${name} Progress: ${drawProgressBar(progressPercentage)}`);
}

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
  const meta = await getImageMetadata(buf, optionsParsed);
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
  // create fallback image same as original image size unless fallbackWidth is provided.
  const sizeArr: never[] | ['width', number] = state.fallbackWidth ? ['width', state.fallbackWidth] : [];
  const [newImagePath, fallbackSize] = await createImage(state, sizeArr, 'jpg');
  state.fallbackPath = newImagePath;
  state.fallbackSize = fallbackSize;
  // get class names
  state.classStr = cn(state.classes);
  // initialize count
  state.imgCount = 0;
  // total created images. Check how many widths or heights or defaultSizes.
  const sizeCount = state.widths.length
    ? state.widths.length
    : state.heights.length
    ? state.heights.length
    : state.defaultSizes[1].length;
  const totalImages = state.picTypes.length * sizeCount + 1;
  state.totalImages = totalImages;

  // Progress Bar
  state.cliBar = bar;
  return state;
}

/**
 * Get original image size and format.
 * @param sharpDetails image state
 * @returns object: width, height, format
 */
export async function getImageMetadata(buf: Buffer, options: OptionType) {
  const details = await sharp(buf).metadata();
  // Make sure width, height are included in the metadata.
  if (!details.width || !details.height || Number.isNaN(+details.width) || Number.isNaN(+details.height)) {
    const dimensions = sizeOf(buf);
    console.log('\n\nWidth and Height attributes are missing from image metadata. Adding...');
    console.log(dimensions, '\n\n');
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
    console.log('\n\nexifr', await exifr.parse(buf, true), '\n\n');
  }
  return details;
}

/**
 * Split media condition. e.g. '(max-width: 600px) 100vw'
 * @param condition media condition and path or size.
 * @returns array with media and path or size. e.g. [media, size]
 */
export function splitCondition(condition: string): [string | boolean, string] {
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
        console.error(chalk.cyan('\n\nImage increase size was bigger than image.\n\n'));
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
  const image = path.basename(filePath);
  const lastIndex = image?.lastIndexOf('.');
  const name = image?.slice(0, lastIndex);
  const imgName = name.replaceAll(' ', '_');
  const ext = image?.slice(lastIndex! + 1).toLowerCase();
  const rootPath = path.dirname(filePath);
  const preFile = { rootPath, image, name, imgName, ext };
  const file = FilePathSchema.parse(preFile);
  return { file, buf: fs.readFileSync(filePath) };
}

/**
 * Create start directories and image path names.
 * @param options passed in options
 * @param file image file name
 * @returns paths for images
 */
export function createNewImageDir(options: OptionRequiredType, file: FilePathType, meta: Metadata) {
  // newImage directory path
  const newImageDir = path.join(options.outDir, file.imgName);
  // clean?
  if (options.clean) fs.rmSync(newImageDir, { recursive: true, force: true });
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
  type: OutputImageType,
  withBlur: boolean = false
): Promise<[string, { width: number; height: number; blurDataURL?: string }]> {
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
  const newImagePath = path.join(
    state.paths.newImageDir,
    `${state.file.imgName}-${withBlur ? 'placeholder-' : ''}${w}w${h}h.${type}`
  );
  // resize.
  const options = size.length ? { [size[0]]: size[1] } : {};
  // only create if state.clean, or image does not exist.
  if (!fs.existsSync(newImagePath)) {
    if (state.withMetadata)
      await sharp(state.buf).withMetadata().resize(options).toFormat(type).toFile(newImagePath);
    else await sharp(state.buf).resize(options).toFormat(type).toFile(newImagePath);
  }
  // blur -just create base64, image was created above.
  let blurDataURL = state.isBlur ? `data:image/${type};base64,` : '';
  // Resize to 10px wide
  if (state.isBlur) blurDataURL += (await sharp(state.buf).resize(state.blur).toBuffer()).toString('base64');

  // image has been created. Fix return img path. linux or remove/add beginning.
  const fixImgPath = state.linuxPaths
    ? newImagePath.replaceAll('\\', '/').replace(state.omit.remove || '', state.omit.add || '')
    : newImagePath.replace(state.omit.remove || '', state.omit.add || '');

  // preload
  if (state.preload)
    console.log(
      `\n\n<${chalk.red(
        'link'
      )} rel="preload" href="${fixImgPath}" as="image" type="image/${type}" fetchpriority="${
        state.preloadFetchPriority
      }" />\n\n`
    );
  // increment image count.
  state.imgCount++;
  // if (state.cliBar instanceof SingleBar) state.cliBar.increment(state.imgCount);
  // if (state.cliBar instanceof ProgressBar) state.cliBar.tick(state.imgCount);
  if (typeof state.cliBar === 'function') state.cliBar(state.file.image, state.imgCount, state.totalImages);

  return [fixImgPath, { width: w, height: h, blurDataURL }];
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
  // create class or className if not empty and not a picture element.
  imgStr += state.classStr ? `${c}="${state.classStr}" ` : '';
  // styles attribute -can be an array of strings or object.
  if (Array.isArray(state.styles)) {
    // <p style="color: blue; font-size: 46px;"> // html
    if (state.styles.length) imgStr += `style="${state.styles.join('; ')}"`;
  }
  if (!Array.isArray(state.styles) && typeof state.styles === 'object') {
    // react inline style
    // { "color": "blue", "fontSize": "46px" }
    imgStr += `style={${JSON.stringify({ ...state.styles })}}`;
  }
  // create srcset
  imgStr += !isPicture ? `srcset="${await createSrcSet(state, state.picTypes[0] as OutputImageType)}" ` : '';
  // create sizes
  imgStr += !isPicture ? `sizes="${state.sizes.join(', ')}" ` : '';
  imgStr += `src="${state.fallbackPath}" `;
  imgStr += `alt="${state.alt}" `;
  imgStr += `width="${state.fallbackSize.width}" `;
  imgStr += `height="${state.fallbackSize.height}" `;
  imgStr += state.title ? `title="${state.title}" ` : '';
  imgStr += `loading="${state.loading}" `;
  imgStr += `decoding="${state.decoding}" `;
  imgStr += '/>';
  return imgStr;
}

/**
 * Create the source tag on a picture element.
 * @param state StateType
 * @param type 'jpg', 'webp'...
 * @param media CSS media condition applied to each 'source' attribute.
 * @returns HTML 'source' attribute code.
 */
export async function createSourceTag(state: StateType, type: OutputImageType, media: string = '') {
  let source = '<source ';
  source += `type="image/${type}" `;
  source += media ? `media="${media}" ` : '';
  source += `sizes="${state.sizes.join(', ')}" `;
  source += `srcset="${await createSrcSet(state, type)}" `;
  source += '/>';
  return source;
}

/**
 * Create the 'picture' element. This function does not create the 'Art Direction' 'picture' element.
 * @param state StateType
 * @returns HTML picture element code.
 */
export async function createPictureTag(state: StateType) {
  const c = state.isClassName ? 'className' : 'class';
  let picture = '<picture >\n';
  for (const type of state.picTypes) {
    picture += `\t${await createSourceTag(state, type)}\n`;
  }
  picture += `\t${await createImgTag(state, true)}\n`;
  picture += '</picture>';
  return picture;
}
