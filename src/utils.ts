import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';
import {
  FilePathType,
  Meta,
  OutputImageType,
  OptionRequiredType,
  OptionSchema,
  OptionType,
  PixxFlowOptions,
  StateType,
  PixxWebpackOptions,
} from './schema';
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
  const meta = await getImageMetadata(buf, optionsParsed, file);
  // nextjs flag. -Fix paths before createNewImageDir
  if (optionsParsed.nextjs) {
    // only change if remove is empty.
    if (!optionsParsed.omit.remove) optionsParsed.omit.remove = 'public/';
    // only change outDir is default.
    if (optionsParsed.outDir === 'pixx_images') optionsParsed.outDir = 'public';
  }
  // get file names. create outDir, clean?
  const paths = createNewImageDir(optionsParsed, file);

  // defaults
  const state: StateType = {
    ...optionsParsed,
    meta,
    file,
    buf,
    paths,
    aspectRatio: getAspectRatio(meta.width / meta.height),
    defaultSizes: defaultSize(meta.width, meta.height, optionsParsed.incrementSize!),
  } as StateType;

  // filter sizes above image size.
  if (state.heights.length > 0) state.heights = state.heights.filter((h) => h! <= state.meta.height);
  if (state.widths.length > 0) state.widths = state.widths.filter((w) => w! <= state.meta.width);

  // check sizes array for default media condition.
  if (state.sizes.at(-1)?.includes(')'))
    console.log(
      chalk.red(
        '\n\nDid you forget the default "sizes" media condition? ------------------------------- \n--------------------------------------------------------------------------- \n---------------------------------------------------------------------------\n\n'
      )
    );

  // All checks pass.
  // 1. Create Fallback Image.
  // Check if fallback width is bigger than original image width.
  if (state.fallbackWidth > state.meta.width) state.fallbackWidth = state.meta.width;
  // Create fallback image same as original image size unless fallbackWidth is provided.
  const sizeArr: [] | ['width', number] = state.fallbackWidth ? ['width', state.fallbackWidth] : [];
  const [newImagePath, fallbackSize] = await createImage(state, sizeArr, 'jpg');
  state.fallbackPath = newImagePath;
  state.fallbackSize = fallbackSize;
  // get class names
  state.classStr = classBuilder(state);
  // initialize count
  state.imgCount = 0;
  // total created images. Check how many widths or heights or defaultSizes.
  const sizeCount = state.widths.length
    ? state.widths.length
    : state.heights.length
    ? state.heights.length
    : state.defaultSizes[1].length;
  // calculate total expected images to be created.
  const totalImages = state.picTypes.length * sizeCount + 1;
  state.totalImages = totalImages;

  // 2. Progress Bar
  state.cliBar = state.progressBar ? bar : '';
  return state;
}

/**
 * Get original image size and format.
 * @param sharpDetails image state
 * @returns object: width, height, format
 */
export async function getImageMetadata(buf: Buffer, options: OptionType, file: FilePathType): Promise<Meta> {
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
    // catch crash. If Exifr crashes, just log and continue.
    try {
      console.log('\n\nexifr', await exifr.parse(buf, true), '\n\n');
    } catch (e) {
      console.log(
        chalk.red(`\n\nExifr error with ${file.base}:`),
        chalk.yellowBright(
          `Exifr image metadata reader failed to process ${file.base} metadata. Usually this means ${
            file.base
          } header is malformed.\n${chalk.white(`Exifr ${e}`)}.\n\n`
        )
      );
    }
  }
  return details as Meta;
}

function classBuilder(state: StateType) {
  const regEx = /^(d:|{)/; // is dynamic
  // classes can be static
  const staticClass = state.classes.filter((c) => !regEx.test(c));
  // classes can be dynamic
  const dynamicClass = state.classes.filter((c) => regEx.test(c));
  if (dynamicClass.length > 0) {
    // add quotes to static class.
    const quotedStaticClassStr = staticClass.map((c) => `'${c}'`).join(', ');
    const fixDynamicClass = dynamicClass.map((c) => c.replaceAll('d:', ''));
    return `{cn([${quotedStaticClassStr}, ${fixDynamicClass.join(', ')}])}`;
  } else return `"${staticClass.join(' ')}"`;
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
  // create absolute path from filePath.
  const resolved = path.resolve(filePath);
  // break filePath into file name parts.
  const file = path.parse(resolved) as any as FilePathType;
  file.imgName = file.name.replaceAll(' ', '_');
  // {
  //   root: '',
  //   dir: './images',
  //   base: 'img1.webp',
  //   ext: '.webp',
  //   name: 'img1'
  // }
  return { file, buf: fs.readFileSync(filePath) };
}

/**
 * Create start directories and image path names.
 * @param options passed in options
 * @param file image file name
 * @returns paths for images
 */
export function createNewImageDir(options: OptionRequiredType, file: FilePathType) {
  // newImage directory path -keep relative because srcset will use this path.
  const newImageDir = path.join(options.outDir, file.imgName);
  // absolute path for delete/create
  const resolvedNewImageDir = path.resolve(newImageDir);
  // clean?
  if (options.clean) fs.rmSync(resolvedNewImageDir, { recursive: true, force: true });
  // create image directory
  if (!fs.existsSync(resolvedNewImageDir)) fs.mkdirSync(resolvedNewImageDir, { recursive: true });
  return { newImageDir, resolvedNewImageDir };
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
  isBlur: boolean = false
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
  const imageName = `${state.file.imgName}-${isBlur ? 'placeholder-' : ''}${w}w${h}h.${type}`;
  // get relative path for srcset paths.
  const newImagePath = path.join(state.paths.newImageDir, imageName);
  // get absolute path for creating images.
  const resolvedNewImagePath = path.join(state.paths.resolvedNewImageDir, imageName);

  // resize.
  const options = size.length ? { [size[0]]: size[1] } : {};
  // only create if state.clean, or image does not exist.
  if (!fs.existsSync(resolvedNewImagePath)) {
    // keep original image metadata.
    if (state.withMetadata)
      await sharp(state.buf, { animated: state.withAnimation })
        .withMetadata()
        .resize(options)
        .toFormat(type)
        .toFile(resolvedNewImagePath);
    // do not copy original image metadata.
    else
      await sharp(state.buf, { animated: state.withAnimation })
        .resize(options)
        .toFormat(type)
        .toFile(resolvedNewImagePath);
  }
  // blur -just create base64, image was created above.
  let blurDataURL = state.withBlur ? `data:image/${type};base64,` : '';
  // Resize to 10px wide
  if (state.withBlur)
    blurDataURL += (await sharp(state.buf).resize(state.blurSize).toBuffer()).toString('base64');

  // image has been created. Fix return img path. linux or remove/add beginning.
  const fixImgPath = state.linuxPaths
    ? newImagePath.replaceAll('\\', '/').replace(state.omit.remove || '', state.omit.add || '')
    : newImagePath.replace(state.omit.remove || '', state.omit.add || '');

  // preload
  if (state.preload)
    console.log(
      `\n\n<${chalk.yellowBright(
        'link'
      )} rel="preload" href="${fixImgPath}" as="image" type="image/${type}" fetchpriority="${
        state.preloadFetchPriority
      }" />\n\n`
    );
  // increment image count.
  state.imgCount++;
  // if (state.cliBar instanceof SingleBar) state.cliBar.increment(state.imgCount);
  // if (state.cliBar instanceof ProgressBar) state.cliBar.tick(state.imgCount);
  if (typeof state.cliBar === 'function') state.cliBar(state.file.base, state.imgCount, state.totalImages);

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
 * @param isPicture boolean. If single picType(Resolution Switching), add srcset to 'img' attribute.
 * @returns img element
 */
export async function createImgTag(state: StateType, isPicture: boolean = false) {
  const c = state.withClassName ? 'className' : 'class';
  let imgStr = '';
  // create img element
  imgStr += '<img ';
  // Class. Create class string or dynamic
  imgStr += state.classes.length > 0 ? `${c}=${state.classStr} ` : '';
  // Styles -react or html
  // "color: blue; font-size: 46px;" // html
  // "{ color: 'blue', lineHeight : 10, padding: 20 }" // react
  imgStr += state.styles
    ? state.styles.startsWith('{')
      ? `style={${state.styles}} `
      : `style="${state.styles}" `
    : '';
  // create srcset
  const srcSet = state.withClassName ? 'srcSet' : 'srcset';
  // isPicture false, single picType(Resolution Switching). Add srcset as img attribute.
  imgStr += !isPicture
    ? `${srcSet}="${await createSrcSet(state, state.picTypes[0] as OutputImageType)}" `
    : '';
  // create sizes -only attach to image if not a 'picture', otherwise attach to 'source'.
  imgStr += !isPicture ? `sizes="${state.sizes.join(', ')}" ` : '';
  imgStr += `src="${state.fallbackPath}" `;
  imgStr += `alt="${state.alt}" `;
  imgStr += `width="${state.fallbackSize.width}" `;
  imgStr += `height="${state.fallbackSize.height}" `;
  imgStr += state.title ? `title="${state.title}" ` : '';
  imgStr += `loading="${state.loading}" `;
  imgStr += `decoding="${state.decoding}" `;
  // create fetchpriority
  const fetchPriority = state.withClassName ? 'fetchPriority' : 'fetchpriority';
  imgStr += `${fetchPriority}="${state.fetchPriority}" `;
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
  source += `${state.withClassName ? 'srcSet' : 'srcset'}="${await createSrcSet(state, type)}" `;
  source += '/>';
  return source;
}

/**
 * Create the 'picture' element. This function does not create the 'Art Direction' 'picture' element.
 * @param state StateType
 * @returns HTML picture element code.
 */
export async function createPictureTag(state: StateType) {
  let picture = '<picture >\n';
  for (const type of state.picTypes) {
    picture += `\t${await createSourceTag(state, type)}\n`;
  }
  picture += `\t${await createImgTag(state, true)}\n`;
  picture += '</picture>';
  return picture;
}

/**
 * Find pixx function with regex, call it to create images and return html.
 * @param str The text to be searched.
 * @param regex The regex to use when searching HTML or JSX. Regex ignores commented out code.
 * @param isHTML When commenting out code, use HTML or JSX style comments.
 * @returns modified str.
 */
export async function replaceAsync(
  str: string,
  regex: RegExp,
  options: PixxFlowOptions | PixxWebpackOptions
) {
  // comment out pixx import.
  const importPixxRegex = /^\s*import .*?pixx.*? from .*?pixx.*?$/gm;
  const requirePixxRegex = /^\s*(const|let|var) .*?pixx.*? require(.*?pixx.*?).*?$/gm;
  const replaceText = options.comment ? (m: string) => `// ${m.trim()}` : '';
  // remove 'pixx' from '{ cn, pixx }'. The other regexes will not match.
  // if only '{ pixx }', then it will get commented or removed.
  const noImportHTML = str
    .replaceAll(/pixx,?\s*(?=\s?cn)|(?<=cn\s?),?\s*pixx/g, '')
    .replaceAll(importPixxRegex, replaceText as string)
    .replaceAll(requirePixxRegex, replaceText as string);

  const promises: Promise<string>[] = [];
  // 1. Run first time with promises.
  noImportHTML.replace(regex, (match, ...args) => {
    // do something with match, push into promises array.
    promises.push(asyncFn(match, args, options)); // 'args' is an array.
    return match;
  });
  // 2. resolve promises
  const data = await Promise.all(promises);
  // 3. After promises resolve, run second time, returning resolved promises instead of match.
  return noImportHTML.replace(regex, () => data.shift() || ''); // always return something.
}

/**
 * Regex string 'match', deconstruct, build, return only HTML
 * @param match regex match.
 * @param  args multiple parens match.
 * @returns HTML code
 */
async function asyncFn(match: string, args: string[], options: PixxFlowOptions | PixxWebpackOptions) {
  const { pixx } = await import('./index.js');
  // match example: JSX
  // { pixx('./images/happy face.jpg', {
  //   returnReact: true,
  //   omit: { remove: 'public/' },
  //   outDir: 'public',
  // }) }

  // HTML
  // <script>
  //     pixx('./images/compass.jpg', {
  //       widths: [50, 200],
  //       classes: ['one', 'two', 'three'],
  //       withClassName: false,
  //     });
  // </script>

  // JSX only.
  if (!options.isHTML) {
    // Remove React brackets. HTML must be returned as a string, so remove 'returnReact: true'.
    // const startBracket = match.indexOf('{') + 1; // get index of first bracket. Inclusive, so + 1.
    // const endBracket = match.lastIndexOf('}'); // get index of last bracket. Exclusive.
    // const pixxFn = match.slice(startBracket, endBracket).trim();
    // extract only the pixx function.
    const pixxFn = args[0];
    const pixxFnFix = pixxFn!.replaceAll(/returnReact:\s*(?:true|false)\s*,?\s*/gi, '');
    let html = '';
    try {
      if (options.log) console.log(pixxFnFix);
      html = await eval(pixxFnFix);
      return options.comment ? `{/* ${pixxFn} */}\n${html}` : html;
    } catch (error) {
      console.log(chalk.redBright(error));
      return html;
    }
    // HTML
  } else {
    let html = '';
    try {
      // call the pixx function.
      const pixxFn = args[0]!.replaceAll(/returnReact:\s*(?:true|false)\s*,?\s*/gi, '').trim();
      if (options.log) console.log(pixxFn);
      html = await eval(pixxFn);
      return options.comment ? `<!-- ${match.trim()} -->\n${html}` : html;
    } catch (error) {
      console.log(chalk.redBright(error));
      return '';
    }
  }
}
