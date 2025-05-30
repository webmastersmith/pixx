import * as fs from 'node:fs';
import * as path from 'node:path';
import sharp from 'sharp';
import {
  type FilePathType,
  type Meta,
  type OutputImageType,
  type OptionRequiredType,
  type OptionType,
  type PixxFlowOptions,
  type StateType,
  type PixxPluginOptions,
  type PixxPluginInput,
  OptionSchema,
} from './schema';
import exifr from 'exifr';
import chalk from 'chalk';
import { imageSize } from 'image-size';

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
  if (optionsParsed.nextjs || optionsParsed.vite) {
    // only change if remove is empty.
    if (!optionsParsed.omit.remove) optionsParsed.omit.remove = 'public/';
    // only change outDir is default.
    if (optionsParsed.outDir === 'pixx_images') optionsParsed.outDir = 'public';
  }
  // get file names. create outDir, clean?
  const paths = createNewImageDir(optionsParsed, file);

  // only parse defaultSizes if none were provided.
  const defaultSizes =
    optionsParsed.widths.length > 0 || optionsParsed.heights.length > 0
      ? []
      : defaultSize(meta, optionsParsed, file);
  // defaults
  const state: StateType = {
    ...optionsParsed,
    meta,
    file,
    buf,
    paths,
    aspectRatio: getAspectRatio(meta.width / meta.height),
    defaultSizes,
  } as StateType;

  // filter sizes above image size.
  if (state.heights.length > 0) state.heights = state.heights.filter((h) => h <= state.meta.height);
  if (state.widths.length > 0) state.widths = state.widths.filter((w) => w <= state.meta.width);

  // check last item in sizes array for default media condition. If includes ')' not default.
  if (state.sizes.at(-1)?.includes(')'))
    console.log(
      chalk.red(
        `\n\nDid you forget the default "sizes" media condition on pixx('${state.file.base}', { 
        sizes: ${state.sizes} })? ------------------------------- \n--------------------------------------------------------------------------- \n---------------------------------------------------------------------------\n\n`
      )
    );

  // All checks pass.
  // 1. Create Fallback Image.
  // Check if fallback width is bigger than original image width.
  if (state.fallbackWidth > state.meta.width) state.fallbackWidth = state.meta.width;
  // Create fallback image same as original image size unless fallbackWidth is provided.
  const sizeArr: [] | ['width', number] = state.fallbackWidth ? ['width', state.fallbackWidth] : [];
  const [fallbackPath, { width, height }] = await createImage(state, sizeArr, 'jpg');
  state.fallbackData = { fallbackPath, width, height };

  // 2. create blur image
  if (state.withBlur) {
    // find smallest side.
    const smallestSide: ['height' | 'width', number] =
      state.meta.width > state.meta.height ? ['height', state.blurSize] : ['width', state.blurSize];
    // create blur image -last item is true, tells 'createImage' to create dataURL.
    const [blurPath, { width, height, blurDataURL }] = await createImage(state, smallestSide, 'webp', true);
    state.blurData = { blurPath, width, height, blurDataURL };
    console.log(`\n\n${state.file.base}:`, chalk.blue(blurPath));
    console.log(`${state.file.base} blurDataURL:`, chalk.yellow(blurDataURL), '\n\n');

    // fallbackPreloadData default. Ensure exist if 'blurOnly' is true.
    state.fallbackPreloadData = { fallbackPreloadPath: '', width: 0, height: 0 };
    // If blurOnly = false, create lo-res image.
    if (!state.blurOnly) {
      // Create lo-res image and add to style attribute and add preload tag to head.
      if (!state.fallbackPreloadWidth)
        state.fallbackPreloadWidth = Math.floor(state.fallbackData[smallestSide[0]] * 0.3);
      // preload images created as webp.
      const [fallbackPreloadPath, size] = await createImage(
        state,
        [smallestSide[0], state.fallbackPreloadWidth],
        'webp', // type
        false, // isBlur
        true // isPreload
      );
      state.fallbackPreloadData = { fallbackPreloadPath, width: size.width, height: size.height };

      // preload tag
      const fetch = state.withClassName ? 'fetchPriority' : 'fetchpriority';
      console.log(chalk.green('HTML preload link. Add this to your "head" element.'));
      console.log(
        `<${chalk.yellowBright(
          'link'
        )} rel="preload" href="${fallbackPreloadPath}" as="image" type="image/webp" ${fetch}="${
          state.preloadFetchPriority === 'auto' ? 'high' : state.preloadFetchPriority
        }" />\n`
      );
      // NextJS 15
      const nextjs = `
import ReactDOM from 'react-dom';
ReactDOM.preload('${fallbackPreloadPath}', {
  as: 'image',
  type: 'image/webp',
  fetchPriority: '${state.preloadFetchPriority === 'auto' ? 'high' : state.preloadFetchPriority}',
});
\n
  `;
      console.log(
        chalk.green('NextJS 15 App router preload link. Add this "inside" your "page.tsx" function.'),
        chalk.magenta(nextjs)
      );
    } // end blurOnly

    // add styles -separator could be comma(JSX) or semi-colon(HTML).
    const urlsJSX = `backgroundImage: '${
      state.blurOnly ? '' : `url("${state.fallbackPreloadData.fallbackPreloadPath}"),`
    } url("${blurDataURL}")', backgroundSize: '${state.backgroundSize}'`;
    const urlsHTML = `background-image: ${
      state.blurOnly ? '' : `url('${state.fallbackPreloadData.fallbackPreloadPath}'),`
    } url('${blurDataURL}'); background-size: ${state.backgroundSize}`;
    const placeholderImages = state.withClassName ? urlsJSX : urlsHTML;
    // styles for JSX could have brackets.
    const fixStyles = state.withClassName ? state.styles.replaceAll(/{|}/g, '').trim() : state.styles;
    // create style tag.
    const sep = state.styles ? (state.withClassName ? ',' : ';') : '';
    const newStyle = state.withClassName
      ? `{ ${placeholderImages}${sep} ${fixStyles} }`
      : `${placeholderImages}${sep} ${fixStyles}`;
    state.styles = newStyle;
  } // end blur image.

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
    const dimensions = imageSize(buf);
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

/**
 * Create classes. Dynamic classes will need the 'cn' function. Decide whether JSX or string return.
 * @param state State object.
 * @returns classes string.
 */
function classBuilder(state: StateType) {
  const regEx = /^(d:|{)/; // is dynamic

  // Check if has dynamic or has 'cn'. Returns boolean.
  const hasDynamic =
    !!state.classes.filter((item) => regEx.test(item)).length || state.classes.includes('cn');
  // dynamic will need the cn function. Must be brackets for HTML or JSX.
  if (hasDynamic) {
    const mapped = state.classes
      .filter((item) => item !== 'cn') // remove 'cn' from array if added.
      .map((item) => {
        if (regEx.test(item)) return item.replace('d:', ''); // keep variables without quotes.
        return `'${item}'`; // add quotes to strings.
      })
      .join(', ');
    return `{cn(${mapped})}`;
  }
  // Not Dynamic. OK to quote JSX or HTML.
  return `"${state.classes.join(' ')}"`;
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
 * When 'state' is being setup, if no 'widths' or 'heights' provided, use 'incrementSize' to automatically create images.
 * Default create image sizes every 300px.
 * Only use 'width', and keep aspect ratio.
 * @param meta Image metadata.
 * @param optionsParsed pass in all options defaults.
 * @param file Image name.
 * @returns ['width', numbers[]]
 */
export function defaultSize(
  meta: Meta,
  optionsParsed: OptionRequiredType,
  file: FilePathType
): ['width', number[]] {
  const increaseSize = optionsParsed.incrementSize;
  const width = meta.width;
  // return early if 'increaseSize' is >= image width.
  if (increaseSize >= width) {
    console.log(
      chalk.cyan(`\n\n${file.name} 'increaseSize' (${increaseSize}) was >= image 'width' (${width}).\n\n`)
    );
    return ['width', [width]];
  }

  // Find sizes
  let size = increaseSize;
  const sizes: number[] = [];
  // return the smaller side
  while (size < width) {
    sizes.push(size);
    size += increaseSize;
  } // end while
  // Check if last size was equal to width. If not, add original image size.
  if (sizes.at(-1) !== width) sizes.push(width);
  return ['width', sizes];
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
  // biome-ignore lint/suspicious/noExplicitAny: Type cast to 'any' then FilePathType.
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
      const mediant: [number, number] = [lower[0] + upper[0], lower[1] + upper[1]];

      if (val * mediant[1] > mediant[0]) {
        if (lim < mediant[1]) {
          return upper;
        }
        lower = mediant;
      } else if (val * mediant[1] === mediant[0]) {
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
}): { width: number; height: number } {
  let left: number;
  let right: number;
  // if aspectRatio, use that for formula.
  if (aspectRatio) {
    const aspect = aspectRatio.split(':');
    const w = aspect[0] ? +aspect[0] : 0;
    const h = aspect[1] ? +aspect[1] : 0;
    // to find h = orgHeight/orgWidth*desiredWidth
    // to find w = orgWidth/orgHeight*desiredHeight
    left = returnHeight ? h : w;
    right = returnHeight ? w : h;
  } else {
    left = returnHeight ? orgHeight : orgWidth;
    right = returnHeight ? orgWidth : orgHeight;
  }
  const missing = Math.round((left / right) * desiredDimension);
  return {
    width: returnHeight ? desiredDimension : missing,
    height: returnHeight ? missing : desiredDimension,
  };
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
  size: [] | ['width' | 'height', number],
  type: OutputImageType,
  isBlur = false, // tru adds 'placeholder' and creates base64BlurDataURI.
  isPreload = false // true adds 'preload-' to image name.
): Promise<[string, { width: number; height: number; blurDataURL: string }]> {
  // Find missing side dimension. Return w/h info.
  const options: { width: number; height: number; smartSubsample: boolean; blurDataURL: string } = {
    width: 0,
    height: 0,
    smartSubsample: false,
    blurDataURL: '',
  };
  // If size is empty, use original image size for w/h.
  if (!size.length) {
    options.width = state.meta.width;
    options.height = state.meta.height;
  } else {
    // Passed a resize, find opposite side dimensions.
    const dimension = {
      orgWidth: state.meta.width,
      orgHeight: state.meta.height,
      desiredDimension: size[1],
      returnHeight: size[0] === 'width',
    };
    // get missing dimension. returns { width, height }
    const imageSize = getDimension(dimension);
    options.width = imageSize.width;
    options.height = imageSize.height;
  } // end else

  // create subfolder path
  const middle = isPreload ? 'preload-' : 'placeholder-';
  const imageName = `${state.file.imgName}-${!isBlur && !isPreload ? '' : middle}${options.width}w${
    options.height
  }h.${type}`;
  // get relative path for srcset paths.
  const newImagePath = path.join(state.paths.newImageDir, imageName);
  // get absolute path for creating images.
  const resolvedNewImagePath = path.join(state.paths.resolvedNewImageDir, imageName);

  // create webp images w/ high quality chroma subSampling.
  options.smartSubsample = type === 'webp';

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

  // image has been created. Fix return img path. linux or remove/add beginning.
  const fixImgPath = state.linuxPaths
    ? newImagePath.replaceAll('\\', '/').replace(state.omit.remove || '', state.omit.add || '')
    : newImagePath.replace(state.omit.remove || '', state.omit.add || '');

  // increment image count.
  state.imgCount++;
  // only run if state has 'bar' function attached.
  if (typeof state.cliBar === 'function') state.cliBar(state.file.base, state.imgCount, state.totalImages);

  // blurDataURL
  // only create blur data if isBlur and withBlur are true. For 'img' element.
  if (isBlur && state.withBlur)
    options.blurDataURL = `data:image/${type};base64,${(
      await sharp(state.buf).resize(state.blurSize).toBuffer()
    ).toString('base64')}`;

  return [fixImgPath, options as { width: number; height: number; blurDataURL: string }];
}

/**
 * Create images and return srcset string.
 * @param state state object
 * @param type image exstension type
 * @returns srcset string
 */
export async function createSrcSet(state: StateType, type: OutputImageType) {
  // create images from: width or height.or defaultSizes.
  const srcset = [];
  const sizes = state.widths.length
    ? state.widths
    : state.heights.length
    ? state.heights
    : state.defaultSizes[1];
  const key = state.widths.length ? 'width' : state.heights.length ? 'height' : state.defaultSizes[0];
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
export async function createImgTag(state: StateType, isPicture = false) {
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
  imgStr += `src="${state.fallbackData.fallbackPath}" `;
  imgStr += `alt="${state.alt}" `;
  imgStr += `width="${state.fallbackData.width}" `;
  imgStr += `height="${state.fallbackData.height}" `;
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
export async function createSourceTag(state: StateType, type: OutputImageType, media = '') {
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

// JSX/TSX. -match pixx function, do not match commented function.
export const pixxFnRegexJSX = /(?<!{\/\*\s*){\s*(pixx\s*(?:<[^>]*>)?\s*\(.*?(?:'|"|\]|})\s*\));?\s*}/gis;
// { pixx('./images/happy face.jpg', {
//   returnJSX: true,
//   omit: { remove: 'public/' },
//   outDir: 'public',
// }) }

// html  -match pixx function, do not match commented function.
export const pixxFnRegexHTML =
  /(?<!<!--\s*)(?:<script[^>]*>).*?(pixx\s*\(.*?(?:'|"|\]|})\s*\));?.*?(?:<\/script>)/gis;
// <script>
//     pixx('./images/compass.jpg', {
//       widths: [50, 200],
//       classes: ['one', 'two', 'three'],
//       withClassName: false,
//     });
// </script>

// If import 'pixx' is commented out, return false. -JSX only test.
export const returnEarlyRegex = /^(?<!\/)\s*(?:import|const|var|let).*?(?:'|")pixx(?:'|")/m;
const returnJSXRegex = /returnJSX:\s*(?:true|false)\s*,?\s*/gi;
// placeholders. remove before eval. This helps with 'linting' errors till done.
const placeholderRegex = /(?:v:[^\]]*],?\s*)/g;

/**
 * Run async code inside replaceAll function.
 * Use regex to find pixx functions, call function to create images and return html.
 * @param str The text to be searched.
 * @param regex The regex to use when searching HTML or JSX. Regex ignores commented out code.
 * @param options options to know how to comment code. HTML or JSX style comments.
 * @returns HTML or empty str.
 */
export async function replaceAsync(str: string, regex: RegExp, options: PixxFlowOptions | PixxPluginOptions) {
  // comment out pixx import.
  const importPixxRegex = /^\s*import .*?pixx.*? from .*?pixx.*?$/gm;
  const requirePixxRegex = /^\s*(const|let|var) .*?pixx.*? require(.*?pixx.*?).*?$/gm;
  const replaceText = options.comment ? (m: string) => `// ${m.trim()}` : '';
  // if import/require '{ pixx }', then it will get commented or removed.
  const noImportHTML = str
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
 * Use regex match to call pixx function, build images, return HTML or empty string.
 * @param match regex match.
 * @param  args multiple parens match.
 * @param options options to know how to comment code. HTML or JSX style comments.
 * @returns HTML or empty string.
 */
async function asyncFn(match: string, args: string[], options: PixxFlowOptions | PixxPluginOptions) {
  const { pixx } = await import('./index.js');
  // match example: JSX
  // { pixx('./images/happy face.jpg', {
  //   returnJSX: true,
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

  try {
    // args[0] removes everything outside pixx(). HTML must be returned as a string, so remove 'returnJSX: true'.
    const pixxFn = args[0] ? args[0].replaceAll(returnJSXRegex, '').replace(placeholderRegex, '').trim() : '';
    if (options.log) {
      console.log(chalk.yellow('\n\npixx function passed into "eval()":'));
      console.log(chalk.blue(`${pixxFn}\n\n`));
    }

    // run pixx function.
    let html = '';
    // biome-ignore lint/security/noGlobalEval: Convert string to object.
    if (pixxFn && typeof pixxFn === 'string') html = await eval(pixxFn);
    else throw new Error('Something was wrong with pixx function. Check code and retry.');

    // If comment, return comment, else HTML.
    return options.comment
      ? options.isHTML
        ? `<!-- ${match.trim()} -->\n${html}`
        : `{/* ${match.trim()} */}\n${html}`
      : html;
  } catch (error) {
    console.log(chalk.redBright(error));
    return '';
  }
}

/**
 * Test if text has pixx function, or if pixx function is commented out.
 * @param str text to scan for 'pixx' word.
 * @returns boolean.
 */
export function pluginReturnEarly(str: string): boolean {
  // If no pixx function, return early. -this is faster.
  if (!str.includes('pixx')) return true;
  // Has pixx function, check if pixx import statement is commented out. -JSX only test.
  if (!returnEarlyRegex.test(str)) return true;
  // File need processing.
  return false;
}

/**
 * Create options defaults.
 * @param option options to control plugins.
 * @returns options with defaults.
 */
export function pluginSetOptions(option: PixxPluginInput) {
  // Start -set options defaults.
  const options = { ...option };
  if (typeof options?.log !== 'boolean') options.log = false;
  if (typeof options?.overwrite !== 'boolean') options.overwrite = false;
  if (typeof options?.comment !== 'boolean') options.comment = false;
  if (typeof options?.isHTML !== 'boolean') options.isHTML = false;

  // if 'overwrite' true, change 'comment' to true.
  if (options.overwrite) options.comment = true;

  return options as PixxPluginOptions;
}
