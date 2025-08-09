import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import util from 'node:util';
import sharp from 'sharp';
import type {
  PixxFlowOptions,
  TImageMeta,
  TStore,
  PixxPluginOptions,
  PixxPluginInput,
  TNewImageMeta,
  OptionType,
  PicTypes,
} from './schema';
import { OptionSchema, JSX, HTML } from './schema.js';
import exifr from 'exifr';
import chalk from 'chalk';
import { imageSize } from 'image-size';
import { z } from 'zod';

/**
 * Strip ANSI color codes from text.
 * ANSI color codes are sequences used in terminal emulators, allowing you to change text color, background color, and apply styles like bold or underline.
 * @param str string to strip ANSI color codes from text.
 * @returns text without ANSI color codes.
 */
export function stripAnsi(str: string) {
  // biome-ignore lint/suspicious/noControlCharactersInRegex: Added on purpose.
  const ansiColorRegex = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;
  return str.replaceAll(ansiColorRegex, '');
}

/**
 * Print to terminal a progress bar.
 * @param store pixx state.
 * @param imageMeta metadata from original image.
 * @param newImageMeta metadata for image to be created.
 * @param elapsedTime Time to create the image.
 * @param ws WriteStream.
 * @returns void
 */
export function progressBar(
  store: TStore,
  imageMeta: TImageMeta,
  newImageMeta: TNewImageMeta,
  elapsedTime: string,
  ws: fs.WriteStream | undefined
): void {
  const baseName = imageMeta.file.base;
  const name = newImageMeta.file.base;
  const step = imageMeta.createdImageCount;
  const totalSteps = imageMeta.images.length;
  const log = store.options.log;
  const showProgressBar = store.options.showProgressBar;

  // Drawing the Progress Bar Image
  const drawProgressBar = (progress: number) => {
    const barWidth = 30; // length of bar.
    const filledWidth = Math.floor((progress / 100) * barWidth);
    const emptyWidth = barWidth - filledWidth;
    const progressBar = chalk.cyan('█').repeat(filledWidth) + chalk.cyan('▒').repeat(emptyWidth);
    return `[${progressBar}] ${progress}%`;
  };
  const progressPercentage = Math.floor((step / totalSteps) * 100);
  const padStartTotal = totalSteps.toString().length;

  // write to console.
  if (showProgressBar) process.stdout.clearLine(0);
  if (showProgressBar) process.stdout.cursorTo(0);
  const msg = `${chalk.blue(step.toString().padStart(padStartTotal, '0'))} ${name.padEnd(
    baseName.length + 20
  )}`;
  const msgBar = `${drawProgressBar(progressPercentage)}`;
  if (showProgressBar) process.stdout.write(`${msg} ${msgBar}\n`);
  if (log) ws?.write(stripAnsi(`${msg} ${msgBar.padEnd(4)} ${elapsedTime}\n`));
}

/**
 * The 'state' for the pixx function.
 * @param _filePaths Original images passed to 'pixx' function. Can be string | string[].
 * @param optionDefaults default options
 * @param options client provided options
 * @returns store object.
 */
export function createStore(
  _filePaths: string | string[],
  optionDefaults: OptionType,
  options: Partial<OptionType>,
  extraOptions: Partial<OptionType>
): TStore {
  // Check file name.
  const checkedFilePaths = z.string().or(z.array(z.string()).min(1)).parse(_filePaths);
  // Convert to array if string. -from this point on, filePaths will be string[];
  const filePaths = typeof checkedFilePaths === 'string' ? [checkedFilePaths] : checkedFilePaths;

  // Create the 'store'.
  const store = {} as TStore;
  store.originalImagePaths = filePaths;
  store.totalImageCount = 0; // set totalImageCount.
  store.createdImageCount = 0; // increase as each image is created.
  // determine if Art Direction, Multiple Image Types, or Resolution Switching.
  store.isArtDirection = filePaths.length > 1;
  store.csp = { styleSrc: [], imgSrc: [] }; // content-security-policy.
  store.imagesMeta = [] as TImageMeta[]; // image meta data.

  // combine provided options and optionDefaults. Check for errors with zod.
  // extra options before client provided options, so client can override set options.
  store.options = OptionSchema.parse({
    ...structuredClone(optionDefaults),
    ...structuredClone(extraOptions),
    ...structuredClone(options),
  });

  // Add correct CSS words depending on JSX or HTML.
  store.css = store.options.jsx ? JSX : HTML;
  store.isResolutionSwitching = store.options.picTypes.length < 2;
  store.isDynamicClasses = store.options.classes.some((c) => /^d:|^cn$/.test(c));

  // HTML cannot have spaces in directory or image name.
  store.options.newImagesDirectory = store.options.newImagesDirectory.replaceAll(' ', '_');

  // Vite -Fix new image paths for Vite.
  if (store.options.vite) {
    // Vite only works if images are in 'public' folder.
    store.options.omit.remove = 'public/'; // Images can only be stored in public for build to work properly.
    store.options.newImagesDirectory = 'public'; // Images can only be stored in public for build to work properly.
  }

  // Above-The-Fold
  if (store.options.aboveTheFold) {
    // Image will show on page load. Changes: loading: 'eager', fetchPriority: 'high', withBlur: true,
    store.options.loading = 'eager';
    store.options.fetchPriority = 'high';
    store.options.withBlur = true;
  }

  return store;
}

/**
 * Create the metadata, new image dimensions, and paths for each image passed to pixx.
 * @param store pixx state
 * @param ws logging writestream
 */
export async function createAllImageMeta(store: TStore, ws: fs.WriteStream | undefined) {
  // Get 'imageMeta' for all the pixx images.
  for (const [i, filePath] of (store.originalImagePaths as string[]).entries()) {
    // Art Direction can have multiple images, but only one fallback. Choose last image as fallback.
    const imageMeta = await getImageMeta(store, filePath, ws, i + 1 === store.originalImagePaths.length);

    // Attach the matching media condition. -only for Art Direction.
    if (store.isArtDirection) {
      // Art direction must have at least one 'media condition'.
      if (store.options.media.length === 0)
        throw new Error('Art Direction must have at least one media condition.');

      // match the media condition to image.
      const [mediaCondition] = store.options.media.filter((mediaStr) =>
        mediaStr.includes(imageMeta.file.base)
      );
      imageMeta.mediaCondition = mediaCondition ? mediaCondition : '';
    }
    store.imagesMeta.push(imageMeta);
  }
}

/**
 * Prevent pixx from closing until logging 'WriteStream' finishes.
 * @param ws logging writestream
 * @returns promise<1>
 */
export const waitTillWriteStreamFinished = (ws: fs.WriteStream | undefined) =>
  new Promise((res, rej) => {
    if (!ws) res(1); // return if 'ws' is undefined.
    ws?.on('close', () => {
      res(1);
    });
  });

/**
 * Create log file name from original file names passed to pixx.
 * @param _str all filePaths passed to pixx.
 * @returns single string of joined filePaths
 */
export function getLogFileName(_str: string | string[]) {
  let name = '';
  if (Array.isArray(_str)) {
    for (const [i, str] of _str.entries()) {
      name += path.parse(str).base;
      // add '_' between file names.
      if (i + 1 !== _str.length) name += '_';
    }
    return `${name.replaceAll(' ', '_')}.log`;
  }
  if (typeof _str === 'string') {
    name = path.parse(_str).base;
    return `${name.replaceAll(' ', '_')}.log`;
  }
  throw new Error('Pixx images must be a string or array of strings.');
}

/**
 * Each 'pixx image', create metadata and convert image to buffer.
 * Create fallback, preload, blurData from image.
 * Create all the needed image dimensions and paths.
 * @param store pixx state
 * @param filePath path to original image.
 * @returns imageMeta state.
 */
export async function getImageMeta(
  store: TStore,
  filePath: string,
  ws: fs.WriteStream | undefined,
  isFallback = true
) {
  const imageMeta = {} as TImageMeta;
  // check if image exist and normalize path. checkIfImageExist will throw error is image cannot be found.
  imageMeta.file = checkIfImageExist(filePath); // file is the absolute path of original image.
  // Check if image type is approved.
  const validInputImages = ['.avif', '.gif', '.jpeg', '.jpg', '.png', '.tiff', '.webp', '.svg'];
  if (!validInputImages.includes(imageMeta.file.ext)) {
    let msg = chalk.red(
      `Sharp only excepts these image types: ${chalk.yellow(`'${validInputImages.join(', ')}'`)}.`
    );
    msg += chalk.red(`\nCheck ${chalk.yellow(`'${imageMeta.file.base}'`)} is the correct image type.\n\n`);
    if (store.options.log) ws?.write(stripAnsi(msg));
    throw new Error(msg);
  }
  imageMeta.buf = fs.readFileSync(path.format(imageMeta.file));
  // get image metadata. Throws error if width or height cannot be determined.
  imageMeta.sharpMeta = await getImageMetadata(store, imageMeta, ws);
  imageMeta.isFallbackImage = isFallback; // Only Art direction can have no fallback image.
  // Set Defaults.
  imageMeta.totalImages = 0;
  imageMeta.createdImageCount = 0;
  // all the image types zod will accept.
  imageMeta.srcsetByType = {
    avif: '',
    gif: '',
    jpeg: '',
    jpg: '',
    png: '',
    tiff: '',
    webp: '',
  }; // set default
  imageMeta.sources = []; // create the 'srcset' from this. Keeps order because first 'truthy' value is taken by browser.
  imageMeta.images = []; // all images that need to be created.

  // Create New Images Directory
  // New images directory with name of image. If clean: true, delete image directory, then recreate.
  imageMeta.absoluteNewImageDir = createNewImageDir(store, imageMeta); // absolute path of new image directory.

  // Aspect Ratio
  imageMeta.aspectRatio = getAspectRatio(imageMeta.sharpMeta.width / imageMeta.sharpMeta.height);

  // Class Names
  imageMeta.classStr = classBuilder(store);

  // ImageSizes
  // With original image size known, to prevent 'sharp' from 'up sizing' image, remove client provided image sizes larger than the original image size.
  // Check if client provided 'widths' or 'heights', else create 'defaultSizes', then sort.
  const sizes =
    store.options.widths.length > 0
      ? store.options.widths.filter((w) => w <= imageMeta.sharpMeta.width)
      : store.options.heights.length > 0
      ? store.options.heights.filter((h) => h <= imageMeta.sharpMeta.height)
      : defaultSizes(store, imageMeta, ws);
  // sort small to big -this sets the order for 'srcset' images because first 'truthy' value is taken by browser.
  sizes.sort((a, b) => a - b);
  imageMeta.imageSizes = sizes; // record image sizes

  //
  // Fallback Image.
  // Create fallback image same as original image size unless fallbackWidth is provided.
  // Art direction can have multiple images, only use the imageMeta.fallbackWidth, which is set for each image.
  if (imageMeta.isFallbackImage) {
    // Check if client supplied fallback width and fallback width is <= original image width.
    imageMeta.fallbackWidth =
      store.options.fallbackWidth && store.options.fallbackWidth <= imageMeta.sharpMeta.width
        ? store.options.fallbackWidth
        : imageMeta.sharpMeta.width;
    const fallbackDimension = getDimension(imageMeta, imageMeta.fallbackWidth);
    const _fallbackPath = path.parse(imageMeta.file.base);
    _fallbackPath.name =
      `${_fallbackPath.name}-fallback_w${fallbackDimension.width}h${fallbackDimension.height}`.replaceAll(
        ' ',
        '_'
      ); // modify image name.
    _fallbackPath.ext = '.jpg'; // always JPG.
    _fallbackPath.base = _fallbackPath.name + _fallbackPath.ext;
    const fallbackMeta = {
      ...fallbackDimension,
      file: _fallbackPath,
      absolutePath: path.join(imageMeta.absoluteNewImageDir, _fallbackPath.base),
      HTMLPath: createHTMLImagePath(store, imageMeta, _fallbackPath.base),
    };
    imageMeta.fallbackImage = fallbackMeta;
    imageMeta.images.push(fallbackMeta);
  }

  //
  // Blur
  // above-the-fold. Only use if 'withBlur' is true.
  if (store.options.withBlur) {
    // The 'blur' image will just be 'dataURL'. It will be attached to 'backgroundImage'. Normalized to 'webp'.
    const blurDimension = getDimension(
      imageMeta,
      store.options.blurSize,
      imageMeta.sharpMeta.width < imageMeta.sharpMeta.height // use smallest dimension.
    );
    const _blurPath = path.parse(imageMeta.file.base);
    _blurPath.name = `${_blurPath.name}-blur_w${blurDimension.width}h${blurDimension.height}`.replaceAll(
      ' ',
      '_'
    ); // modify image name.
    _blurPath.ext = '.webp'; // standardize blur image.
    _blurPath.base = _blurPath.name + _blurPath.ext;
    imageMeta.blurImage = {
      ...blurDimension,
      file: _blurPath,
      blurDataURL: `data:image/webp;base64,${(
        await sharp(imageMeta.buf).resize(blurDimension).toBuffer()
      ).toString('base64')}`,
    };
  }

  // Preload
  // Art Direction only preload for fallback image.
  if (store.options.withPreload && imageMeta.isFallbackImage) {
    // Make sure fetch priority is 'high'.
    store.options.fetchPriority = 'high';

    // fallbackWidth can be 0. Create fallback of image width.
    const preloadFallbackWidth = imageMeta.fallbackWidth
      ? imageMeta.fallbackWidth
      : imageMeta.sharpMeta.width;
    if (!store.options.preloadWidth)
      store.options.preloadWidth = Math.round((preloadFallbackWidth * 100 * (0.3 * 100)) / 10000);
    const preloadDimension = getDimension(imageMeta, store.options.preloadWidth);
    const _preloadPath = path.parse(imageMeta.file.base);
    _preloadPath.name =
      `${_preloadPath.name}-preload_w${preloadDimension.width}h${preloadDimension.height}`.replaceAll(
        ' ',
        '_'
      ); // modify image name.
    _preloadPath.ext = '.webp'; // standardize preload image.
    _preloadPath.base = _preloadPath.name + _preloadPath.ext;
    const preloadMeta = {
      ...preloadDimension,
      file: _preloadPath,
      absolutePath: path.join(imageMeta.absoluteNewImageDir, _preloadPath.base),
      HTMLPath: createHTMLImagePath(store, imageMeta, _preloadPath.base),
    };
    imageMeta.preloadImage = preloadMeta;
    imageMeta.images.push(preloadMeta);
    // preload tag
    const preloadTextHead = '\n\nHTML preload link. Add this to your "head" element.';
    const preloadTextBody = `\n<link rel="preload" href="${imageMeta.preloadImage.HTMLPath}" as="image" type="image/webp" ${store.css.fetchPriority}="${store.options.fetchPriority}" />\n`;
    console.log(`${chalk.green(preloadTextHead)}${chalk.yellowBright(preloadTextBody)}`);
    if (store.options.log) ws?.write(preloadTextHead + preloadTextBody);
  }

  // Styles.
  // Create final 'styles' tag, including 'backgroundImage' blurData and preload.
  // With art direction, style hash could already exist, so only record if 'isFallbackImage' is true.
  if (imageMeta.isFallbackImage) {
    const singleQuote = store.options.jsx ? "'" : ''; // need single quote for JSX.
    const preloadImage = store.options.withPreload
      ? `url(${store.css.quote}${imageMeta.preloadImage?.HTMLPath}${store.css.quote})`
      : '';
    const blurImage = store.options.withBlur
      ? `url(${store.css.quote}${imageMeta.blurImage?.blurDataURL}${store.css.quote})`
      : '';
    const imageBackgroundSize = `${store.css.backgroundSize}: ${singleQuote}${store.options.backgroundSize}${singleQuote}`;
    const backgroundImageStyle =
      store.options.withPreload && store.options.withBlur
        ? `${store.css.backgroundImage}: ${singleQuote}${preloadImage}, ${blurImage}${singleQuote}${store.css.separator} ${imageBackgroundSize}` // both preload and blur
        : store.options.withPreload
        ? `${store.css.backgroundImage}: ${singleQuote}${preloadImage}${singleQuote}${store.css.separator} ${imageBackgroundSize}` // only preload
        : store.options.withBlur
        ? `${store.css.backgroundImage}: ${singleQuote}${blurImage}${singleQuote}${store.css.separator} ${imageBackgroundSize}` // only blur
        : '';

    //
    // JSX styles may have brackets.
    // const noBracketsStyles = store.options.styles.replaceAll(/{|}/g, '').trim();
    // combine backgroundImage with client provided styles.
    const combinedStyles = `${
      backgroundImageStyle ? backgroundImageStyle + store.css.separator : ''
    } ${styleBuilder(store)}`.trim(); // trim needed.

    // Content-Security-Policy -hash from styles.
    if (combinedStyles) {
      // Content-Security-Policy
      // style-src: inline styles must have hash.
      const hash = csp(combinedStyles);
      if (!store.csp.styleSrc.includes(hash)) store.csp.styleSrc.push(hash);
    }

    // JSX needs brackets.
    imageMeta.styles = combinedStyles
      ? store.options.jsx
        ? `{ ${combinedStyles} }`
        : combinedStyles.trim()
      : '';
  } // end styles

  // Create New Image Paths. Determine missing dimension. Sort 'sizes' and 'picTypes'.
  imageMeta.images.push(...returnHTMLPaths(store, imageMeta, ws));
  // add new images to total.
  store.totalImageCount += imageMeta.images.length;
  imageMeta.totalImages += imageMeta.images.length;

  return imageMeta;
}

/**
 * Create the 'paths' for each new image.
 * Using client provided 'widths' or 'heights' or using 'incrementSize' and finding 'defaultSizes', create all the new images metadata.
 * @param store pixx state
 * @param imageMeta original image metadata
 * @param ws WriteStream
 * @returns TNewImageMeta[]
 */
function returnHTMLPaths(
  store: TStore,
  imageMeta: TImageMeta,
  ws: fs.WriteStream | undefined
): TNewImageMeta[] {
  // Sort order of image types for 'source' attribute in the 'picture' element.
  // sort _picTypes: avif, webp, ...others, jpg last.
  const sortedPicTypes = [];
  const _picTypes = store.options.picTypes; // _picTypes = ['avif', 'gif', 'jpeg', 'jpg', 'png', 'tiff', 'webp'];
  if (_picTypes.includes('avif')) sortedPicTypes.push('avif');
  if (_picTypes.includes('webp')) sortedPicTypes.push('webp');
  if (_picTypes.includes('tiff')) sortedPicTypes.push('tiff');
  if (_picTypes.includes('gif')) sortedPicTypes.push('gif');
  if (_picTypes.includes('png')) sortedPicTypes.push('png');
  if (_picTypes.includes('jpg')) sortedPicTypes.push('jpg');
  if (_picTypes.includes('jpeg')) sortedPicTypes.push('jpeg');

  // determine if missing dimension is 'width' or 'height'.
  // true = return missing height value. false = return missing width value.
  const returnHeight = store.options.widths.length > 0 ? true : store.options.heights.length === 0;

  const newImages: TNewImageMeta[] = []; // all new images.
  // loop image types and sizes for each image needed.
  for (const type of sortedPicTypes) {
    // build the 'srcset' attribute for each image 'type'.
    let srcset = ''; // smallest to largest size, because browser takes first truthy value.
    for (const [i, _size] of imageMeta.imageSizes.entries()) {
      // get missing dimension
      const size = getDimension(imageMeta, _size, returnHeight);
      // create TNewImageMeta.
      const _path = path.parse(imageMeta.file.base);
      _path.name = `${_path.name}_w${size.width}h${size.height}`.replaceAll(' ', '_');
      _path.ext = `.${type}`;
      _path.base = _path.name + _path.ext;

      // create srcset string.
      const HTMLPath = `${createHTMLImagePath(store, imageMeta, _path.base)} ${size.width}w`;
      // Record srcset.
      srcset += `${HTMLPath}${i + 1 !== imageMeta.imageSizes.length ? ', ' : ''}`; // no comma last 'srcset'.

      // Create new image object.
      newImages.push({
        ...size,
        file: _path,
        absolutePath: path.join(imageMeta.absoluteNewImageDir, _path.base),
        HTMLPath,
      });
    } // end sizes

    // Add 'srcset' for each type.
    imageMeta.srcsetByType[type as PicTypes] = srcset;
    imageMeta.sources.push({ type, srcset }); // This keeps 'type' order. For building 'picture' element.
  }
  return newImages;
}

/**
 * Use 'sharp' image library to get original image metadata.
 * If sharp cannot determine original image width or height, use 'imageSize' library.
 * Throws Error is width or height cannot be determined.
 * @param store pixx state
 * @param imageMeta original image metadata
 * @param ws logging writestream
 * @returns original image metadata.
 */
export async function getImageMetadata(
  store: TStore,
  imageMeta: TImageMeta,
  ws: fs.WriteStream | undefined
): Promise<sharp.Metadata> {
  const meta = await sharp(imageMeta.buf).metadata();

  // Make sure width, height are included in the metadata.
  if (!meta.width || !meta.height || Number.isNaN(+meta.width) || Number.isNaN(+meta.height)) {
    const dimensions = imageSize(imageMeta.buf);
    console.log('\n\nWidth and Height attributes are missing from image metadata. Adding...');
    console.log(dimensions, '\n\n');
    // throw error if second attempt to get image width, height fails.
    if (
      !dimensions.width ||
      !dimensions.height ||
      Number.isNaN(+dimensions.width) ||
      Number.isNaN(+dimensions.height)
    )
      throw new Error('Image Width or Height could not be determined.');
    // add width and height to metadata.
    meta.width = dimensions.width;
    meta.height = dimensions.height;
  }
  // show image EXIF, TIFF, GPS, XMP, IPTC, ICC, JFIF/Thumbnail data.
  if (store.options.log) {
    // catch crash. If Exifr crashes, just log and continue.  Exifr data does not exist on every image.
    try {
      const exifData = await exifr.parse(imageMeta.buf, true);
      // const msgTitle = `\n\nEXIFR Data from ${chalk.greenBright(imageMeta.file.base)}:\n`;
      // const msg = `${util.inspect(exifData, false, null, true)}\n\n`;
      // console.log(msgTitle + msg);
      // ws -no color
      const msgTitleNoColor = `\n\nEXIFR Data from ${imageMeta.file.base}:\n`;
      const msgNoColor = `${util.inspect(exifData, false, null, false)}\n\n`;
      if (store.options.log) ws?.write(msgTitleNoColor + msgNoColor);
      // throw new Error('this is a test yo!'); // to test error.
    } catch (e) {
      const msgTitle = `\n\nEXIFR ERROR: image ${path.format(imageMeta.file)}:\n`;
      const msgBody = `EXIFR image metadata reader failed to process ${imageMeta.file.base} metadata.\n${imageMeta.file.base} header could be corrupted or EXIFR data may no exist on image.\n`;
      let msgError = '';
      if (e instanceof Error) msgError = `EXIFR Error Message: ${e.message}\n\n`;
      else msgError = util.inspect(e, false, null, false);
      // console.log(chalk.red(msgTitle), chalk.yellowBright(msgBody), chalk.white(msgError));
      if (store.options.log) ws?.write(msgTitle + msgBody + msgError);
    }
  }
  return meta;
}

/**
 * Create classes. Extract 'dynamic' classes.
 * Dynamic classes will need the 'cn' function due to variables only available at build time.
 * @param store pixx state.
 * @returns HTML: classes string, JSX dynamic classes wrapped in the 'cn' function.
 */
function classBuilder(store: TStore): string {
  if (store.options.classes.length === 0) return '';

  const dRegEx = /^d:|^cn$/g;
  // HTML cannot use 'dynamic' classes. Must use JS to manipulate classes during runtime.
  if (!store.options.jsx) {
    return store.options.classes
      .map((item) => item.replace(dRegEx, '').trim())
      .filter((c) => !!c) // remove empty classes.
      .join(' ');
  }

  // JSX syntax. dynamic will need the cn function. Must be brackets for HTML or JSX.
  return `{cn(${store.options.classes
    .map((item) => {
      return dRegEx.test(item)
        ? item.trim().replace(dRegEx, '') // keep variables without quotes.
        : `'${item.trim()}'`; // add quotes to strings.
    })
    .filter((c) => !!c) // remove empty classes.
    .join(', ')})}`;
}

/**
 * Create styles. Extract 'dynamic' styles.
 * An array of strings.
 * @param store pixx state.
 * @returns HTML and JSX styles returned as a string.
 */
function styleBuilder(store: TStore): string {
  const styles = store.options.styles;
  if (styles.length === 0) return '';

  // HTML: styles: ['color: blue', 'line-height: 20', 'margin-top: 20px']
  // // returns: style="color: blue; line-height: 20px; margin-top: 20"
  // JSX: styles: ["color: 'blue'", "lineHeight: 20", "marginTop: '20px'", "marginBottom: size"]
  // // returns: style={{ color: 'blue', lineHeight: '20px', marginTop: 20, marginBottom: size }}

  // JSX syntax. dynamic will need the cn function. Must be brackets for HTML or JSX.
  const s = `${store.options.styles.join(`${store.options.jsx ? ', ' : '; '}`).trim()}`;
  // console.log(s);
  return s;
}

/**
 * Split media condition. e.g. '(max-width: 600px) 100vw'
 * Media array will have media condition and filename. e.g. '(max-width: 400px) happy face.jpg'
 * @param condition media condition and media descriptor or image name.
 * @returns array with media condition and media descriptor. The last condition (descriptor) will not have media condition.
 */
export function splitCondition(condition: string): [string, string] {
  // if only descriptor.
  if (!/\) /.test(condition)) return ['', condition];
  // media condition and descriptor.
  const idx = condition.lastIndexOf(') ') + 1;
  return [condition.substring(0, idx).trim(), condition.substring(idx + 1).trim()];
}

/**
 * When 'imageMeta' is being setup, if no 'widths' or 'heights' provided, use 'incrementSize' to automatically create image sizes.
 * Default creates image sizes every 300px.
 * Only use 'width', and keep aspect ratio.
 * @param store: pixx state.
 * @param imageMeta original image metadata.
 * @param ws logging writestream.
 * @returns ['width', numbers[]]
 */
export function defaultSizes(store: TStore, imageMeta: TImageMeta, ws: fs.WriteStream | undefined) {
  const increaseSize = store.options.incrementSize;
  const orgImageWidth = imageMeta.sharpMeta.width;
  // return early if 'increaseSize' is >= image width.
  if (increaseSize >= orgImageWidth) {
    const msg = `\n\n${imageMeta.file.name} 'increaseSize' (${increaseSize}px) was >= image 'width' (${orgImageWidth}px).\n\n`;
    console.log(chalk.cyan(msg));
    if (store.options.log) ws?.write(msg);
    return [orgImageWidth];
  }

  // Find sizes
  let size = increaseSize;
  const sizes: number[] = [];
  // return the smaller side
  while (size < orgImageWidth) {
    sizes.push(size);
    size += increaseSize;
  } // end while
  // Check if last size was equal to orgImageWidth. If not, add original image size.
  if (sizes.at(-1) !== orgImageWidth) sizes.push(orgImageWidth);
  return sizes;
}

/**
 * Check if image exist. Destructure file path.
 * Throw error is path is faulty or images does not exist.
 * @param filePath path of image
 * @returns absolute path as path.ParsedPath.
 */
export function checkIfImageExist(filePath: string): path.ParsedPath {
  // create absolute path from filePath.
  const absolutePath = path.resolve(path.normalize(filePath));
  if (!fs.existsSync(absolutePath)) throw new Error(`File not found: ${absolutePath}`);
  // break filePath into file name parts.
  // {
  //   root: '',
  //   dir: './images',
  //   base: 'img1.webp',
  //   ext: '.webp',
  //   name: 'img1'
  // }
  return path.parse(absolutePath);
}

/**
 * New image HTML path. Modify image path per 'omit', 'linuxPaths' and 'newImagesDirectory' options.
 * @param store pixx state
 * @param imageMeta original image meta data
 * @param imageName new image to be created name.
 * @returns relative image path for new image.
 */

function createHTMLImagePath(store: TStore, imageMeta: TImageMeta, _imageName: string) {
  // combine newImagesDirectory
  const wholePath = path.join(
    store.options.newImagesDirectory,
    imageMeta.file.base.replaceAll(' ', '_'),
    _imageName
  );

  // Fix path separators.
  const filePath = store.options.linuxPaths // true by default.
    ? wholePath.replaceAll(path.sep, path.posix.sep)
    : wholePath.replaceAll(path.posix.sep, path.win32.sep);

  // omit and add path correction.
  const htmlPath = `${store.options.omit.add}${filePath.replace(store.options.omit.remove, '')}`.trim();
  return htmlPath;
}

/**
 * Create new image directory. Delete if 'clean' flag is true. Check if image exist.
 * @param store pixx state
 * @param imageMeta original image metadata.
 * @returns absolute path of new image directory.
 */
export function createNewImageDir(store: TStore, imageMeta: TImageMeta) {
  // newImage directory path -keep relative because srcset will use this path.
  const newImageDir = path.join(
    process.cwd(),
    store.options.newImagesDirectory,
    imageMeta.file.base.replaceAll(' ', '_')
  );
  // clean?
  if (store.options.clean) fs.rmSync(newImageDir, { recursive: true, force: true });
  // create image directory
  if (!fs.existsSync(newImageDir)) fs.mkdirSync(newImageDir, { recursive: true });
  return newImageDir;
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
 * When given width or height along with original image dimensions, return opposite dimension.
 * @param imageMeta image meta data
 * @param desiredDimension the width or height you would like image to be.
 * @param returnHeight boolean. If true, the missing dimension is height.
 * @returns height and width needed to keep original image aspect ratio.
 */
export function getDimension(
  imageMeta: TImageMeta,
  desiredDimension: number,
  returnHeight = true // return height default. missing height is default.
): { width: number; height: number } {
  // Determine proper missing dimension.
  const left = returnHeight ? imageMeta.sharpMeta.height : imageMeta.sharpMeta.width;
  const right = returnHeight ? imageMeta.sharpMeta.width : imageMeta.sharpMeta.height;
  const missing = Math.round((left / right) * desiredDimension);
  return {
    width: returnHeight ? desiredDimension : missing,
    height: returnHeight ? missing : desiredDimension,
  };
}

/**
 * Create Content-Security-Policy hash from buffer or string.
 * @param bufOrString buffer or string to create content-security-policy hash from.
 * @param hash crypto hashed value, base64 encoded.
 * @returns hash
 */
export function csp(bufOrString: Buffer | string, hash = 'sha256') {
  // create buffer from string.
  const buf = typeof bufOrString === 'string' ? Buffer.from(bufOrString, 'utf-8') : bufOrString;
  // make sure data is buffer.
  if (!Buffer.isBuffer(buf)) throw new Error('CSP function must be passed a buffer or string.');
  return `${hash}-${crypto.createHash(hash).update(buf).digest('base64')}`;
}

/**
 * Create all images. Timestamp.
 * @param store pixx state
 * @param ws logging writestream.
 */
export async function createAllImages(store: TStore, ws: fs.WriteStream | undefined) {
  // Create images. Total Images should match.
  const msgTitle = `\nTotal Images to Create: ${chalk.red(store.totalImageCount)}\n`;
  if (store.options.showProgressBar) process.stdout.write(msgTitle);
  if (store.options.log) ws?.write(stripAnsi(msgTitle));

  // Art Direction will have multiple images.
  for (const imageMeta of store.imagesMeta) {
    const start = Date.now();
    const msgImage = `Creating ${chalk.red(imageMeta.images.length)} Images from ${chalk.greenBright(
      imageMeta.file.base
    )}\n`;
    if (store.options.showProgressBar) process.stdout.write(msgImage);
    if (store.options.log) ws?.write(stripAnsi(msgImage));

    // Create images in parallel.
    const nothing = await Promise.all(
      imageMeta.images.map(async (newImageMeta) => {
        await createImage(store, imageMeta, newImageMeta, ws);
      })
    );
    const end = Date.now();
    const time = (end - start) / 1000;
    const timeText = time < 1 ? `${time}ms` : `${time}s`;
    const msgTime = `${chalk.yellow('Total Creation Time:')} ${timeText}\n\n`;
    if (store.options.showProgressBar) process.stdout.write(msgTime);
    if (store.options.log) ws?.write(stripAnsi(msgTime));
  }
}

/**
 * Create image from given dimensions.
 * @param store pixx state
 * @param imageMeta original image metadata
 * @param newImageMeta the image to be created metadata.
 * @returns created image specs.
 */
export async function createImage(
  store: TStore,
  imageMeta: TImageMeta,
  newImageMeta: TNewImageMeta,
  ws: fs.WriteStream | undefined
) {
  const sharpOptions = {
    width: newImageMeta.width,
    height: newImageMeta.height,
    smartSubsample: false,
  };

  // webp images benefit from high quality chroma subSampling.
  sharpOptions.smartSubsample = newImageMeta.file.ext === '.webp';

  // only create if image does not exist.
  const start = Date.now();
  if (!fs.existsSync(newImageMeta.absolutePath)) {
    // keep original image metadata.
    if (store.options.withMetadata)
      await sharp(imageMeta.buf, { animated: store.options.withAnimation })
        .withMetadata()
        .resize(sharpOptions)
        .toFormat(newImageMeta.file.ext.replace('.', '') as keyof sharp.FormatEnum)
        .toFile(newImageMeta.absolutePath);
    // do not copy original image metadata.
    else
      await sharp(imageMeta.buf, { animated: store.options.withAnimation })
        .resize(sharpOptions)
        .toFormat(newImageMeta.file.ext.replace('.', '') as keyof sharp.FormatEnum)
        .toFile(newImageMeta.absolutePath);
  }
  const end = Date.now();
  const time = (end - start) / 1000;
  const timeText = time < 1 ? `${time}ms` : `${time}s`;
  store.createdImageCount++;
  imageMeta.createdImageCount++;

  // Call progress bar if client request it.
  if (store.options.showProgressBar || store.options.log)
    progressBar(store, imageMeta, newImageMeta, timeText, ws);
  return;
}

//
//
//
// FOR PixxFlow or Vite 👇.
//
//
// JSX/TSX. -match pixx function, do not match commented function.
export const pixxFnRegexJSX = /(?<!{\/\*\s*){\s*(pixx\s*(?:<[^>]*>)?\s*\(.*?(?:'|"|\]|})\s*\));?\s*}/gis;
// { pixx('./images/happy face.jpg', {
//   returnJSX: true,
//   omit: { remove: 'public/' },
//   newImagesDirectory: 'public',
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
 * Run async pixx code inside replaceAll function.
 * Use regex to find pixx functions, call function to create images and return html.
 * @param str The text to be searched.
 * @param regex The regex to use when searching HTML or JSX. Regex ignores commented out code.
 * @param options options to know how to comment code. HTML or JSX style comments.
 * @returns HTML or empty str.
 */
export async function replaceAsync(
  str: string,
  regex: RegExp,
  options: PixxFlowOptions | PixxPluginOptions,
  extraOptions: Partial<OptionType> = {}
) {
  // comment out pixx import.
  const importPixxRegex = /^\s*import .*?pixx.*? from .*?pixx.*?$/gm;
  const requirePixxRegex = /^\s*(const|let|var) .*?pixx.*? require(.*?pixx.*?).*?$/gm;
  const replaceText = (m: string) => `// ${m.trim()}`;
  // if import/require '{ pixx }', then it will get commented or removed.
  const noImportHTML = str.replaceAll(importPixxRegex, replaceText).replaceAll(requirePixxRegex, replaceText);

  const promises: Promise<string>[] = [];
  // 1. Run first time with promises.
  noImportHTML.replace(regex, (match, ...args) => {
    // do something with match, push into promises array.
    promises.push(asyncFn(match, args, options, extraOptions)); // 'args' is an array.
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
 * @returns HTML string or empty string.
 */
async function asyncFn(
  match: string,
  args: string[],
  options: PixxFlowOptions | PixxPluginOptions,
  extraOptions: Partial<OptionType>
) {
  const { pixx } = await import('./index.js');
  // match example: JSX
  // { pixx('./images/happy face.jpg', {
  //   returnJSX: true,
  //   omit: { remove: 'public/' },
  //   newImagesDirectory: 'public',
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
    // extra options are passed in from pixxFlow or vite-plugin-pixx.
    // biome-ignore lint/security/noGlobalEval: Convert string to object.
    if (pixxFn && typeof pixxFn === 'string') html = await (await eval(pixxFn))(extraOptions);
    else throw new Error('Something was wrong with pixx function. Check code and retry.');

    // If comment, return comment, else HTML.
    return options.isHTML ? `<!-- ${match.trim()} -->\n${html}` : `{/* ${match.trim()} */}\n${html}`;
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
  // returnEarlyRegex checks if pixx import statement is commented out. -JSX only test.
  return str.includes('pixx') ? !returnEarlyRegex.test(str) : true; // 'false' file needs processing.
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
  if (typeof options?.isHTML !== 'boolean') options.isHTML = false; // JSX only for vite. SolidJS may need this flag.

  return options as PixxPluginOptions;
}
