import util from 'node:util';
import fs from 'node:fs';
import { z } from 'zod';
import { type TStore, optionDefaults, type OptionType, Pixx } from './schema.js';
import {
  createAllImages,
  waitTillWriteStreamFinished,
  createStore,
  createAllImageMeta,
  splitCondition,
  stripAnsi,
  getLogFileName,
} from './utils';
import chalk from 'chalk';

// 1. pixx function can be passed a single image filename, or array of image filenames for 'art direction'.
// 2. Node version ES2022.

export async function pixx(
  _filePaths: string | string[],
  options: Partial<OptionType> = optionDefaults
  // @ts-ignore
): string {
  // @ts-ignore
  return async (extraOptions: Partial<OptionType> = {}): string => {
    // write stream -only used if log is on.

    let ws = undefined;
    let store = {} as TStore;

    try {
      // 1. Create the store. Verify passed in options.
      store = createStore(_filePaths, optionDefaults, options, extraOptions);
      ws = store.options.log ? fs.createWriteStream(getLogFileName(_filePaths)) : undefined;

      // Check if default media descriptor was provided in 'sizes' array. e.g. '100vw'.
      // last item in sizes array should only be a media descriptor. If includes ')' not default.
      if (store.options.sizes.at(-1)?.includes(')')) {
        const msg = `\n\nDid you forget the default "sizes" media condition on pixx('${store.originalImagePaths.join(
          ', '
        )}', {
      sizes: ${
        store.options.sizes
      } })? ------------------------------- \n--------------------------------------------------------------------------- \n---------------------------------------------------------------------------\n\n`;
        console.log(chalk.red(msg));
        if (store.options.log) ws?.write(msg);
      }

      // Check if media condition was provided, when NOT Art Direction.
      if (store.options.media.length > 0 && !store.isArtDirection) {
        const msg = 'Media Condition was provided, but only one image. Ignoring Media Condition.\n\n';
        console.log(chalk.yellow(msg));
        if (store.options.log) ws?.write(msg);
      }

      // 2. Get image metadata for each pixx image.
      await createAllImageMeta(store, ws);

      // 3. Create all the images.
      await createAllImages(store, ws);

      // 4. Build the HTML
      // Create HTML 'picture' element.
      let picture = '<picture>\n'; // closing </picture>
      let img = '\t<img ';
      // Loop each imageMeta condition, build the 'source' tags to include media condition.
      for (const [i, imageMeta] of store.imagesMeta.entries()) {
        // Only Art Direction has Media Condition. Split media condition and image name.
        const [mediaCondition, fileName] =
          store.isArtDirection && imageMeta.mediaCondition
            ? splitCondition(imageMeta.mediaCondition)
            : ['', ''];

        // 'picture' Element -Art Direction, Multiple Types
        if (!store.isResolutionSwitching) {
          picture += imageMeta.sources.reduce((acc, el) => {
            const { type, srcset } = el;
            let source = '\t<source ';
            source += `type="image/${type}" `;
            source += mediaCondition ? `media="${mediaCondition}" ` : ''; // media
            source += `sizes="${store.options.sizes.join(', ')}" `; // sizes
            source += `${store.css.srcSet}="${srcset}" `; // srcset
            source += '/>\n';
            return acc + source;
          }, ''); // end reduce.
        }

        // Only build and add 'fallback' image if it's the last image. 'srcset' only for 'Resolution Switching'.
        if (i + 1 === store.imagesMeta.length) {
          img += `src="${imageMeta.fallbackImage.HTMLPath}" `; // src
          img += store.isResolutionSwitching ? `${store.css.srcSet}="${imageMeta.sources[0]?.srcset}" ` : ''; // srcset
          img += imageMeta.styles
            ? `style=${store.css.leftBracket}${imageMeta.styles}${store.css.rightBracket} `
            : ''; // style
          img += imageMeta.classStr ? `${store.css.className}=${imageMeta.classStr} ` : ''; // class.
          img += store.options.sizes ? `sizes="${store.options.sizes.join(', ')}" ` : ''; // sizes
          img += `alt="${store.options.alt}" `; // alt
          img += `width="${imageMeta.fallbackImage.width}" `; // width
          img += `height="${imageMeta.fallbackImage.height}" `; // height
          img += store.options.title ? `title="${store.options.title}" ` : ''; // title
          img += `loading="${store.options.loading}" `; // loading
          img += `decoding="${store.options.decoding}" `; // decoding
          img += `${store.css.fetchPriority}="${store.options.fetchPriority}" `; // fetchPriority
          img += ` ${store.options.jsx ? '/' : ''}>`;
        }
      } // end imagesMeta loop.

      const pic = store.isResolutionSwitching ? img : `${picture}${img}\n</picture>`;

      // log Content-Security-Policy for styles.
      if (store.csp.styleSrc.length) {
        // <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src 'self' data:; base-uri 'self'; manifest-src 'self'; style-src 'self' 'sha256-K7ogv...DNM=' 'sha256-vv9Io...ow=';">
        const styleSha = store.csp.styleSrc.map((s) => `'${s}'`).join(' ');
        const stylePolicy = `default-src 'none'; img-src 'self' data:; base-uri 'self'; manifest-src 'self'; style-src 'self' ${styleSha};`;

        let msg = chalk.yellow('\n\nContent Security Policy\n');
        // Header Response Object
        msg += chalk.yellow('If you have access to the "Response" header add:\n');
        msg += chalk.green(`Content-Security-Policy "${stylePolicy}"\n\n`);

        // HTML Head
        msg += chalk.yellow(
          'If you do not have access to the "Response" header, add the following to your HTML \'head\' section:\n'
        );
        msg += chalk.green(`<meta http-equiv="Content-Security-Policy" content="${stylePolicy}">\n\n`);

        // Styles SHA
        msg += chalk.yellow('Content Security Policy "style-src" Hash Values:\n');
        msg += chalk.green(`${styleSha}\n\n`);

        console.log(msg);
        if (store.options.log) ws?.write(stripAnsi(msg));
      }

      // Finalize logging file.
      if (store.options.log) {
        ws?.write(pic);
        ws?.write(`\n\nStore:\n${util.inspect(store, false, null, false)}\n\n`);
        ws?.end();
        await waitTillWriteStreamFinished(ws);
      }
      return pic;
    } catch (error) {
      // don't crash vite with thrown error. just log to console.
      if (error instanceof z.ZodError) {
        // throw new Error();
        const zErr = z.prettifyError(error);
        console.log(chalk.red(zErr));
        if (store.options.log)
          ws?.write(
            stripAnsi(`\n\nZod Error:\n${zErr}\n\nStore:\n${util.inspect(store, false, null, false)}\n\n`)
          );
      }
      if (error instanceof Error) {
        console.log(chalk.red(util.inspect(error, false, null, true)));
        if (store.options.log)
          ws?.write(
            stripAnsi(
              `\n\nPixx Error:\n${util.inspect(error, false, null, false)}\n\nStore:\n${util.inspect(
                store,
                false,
                null,
                false
              )}\n\n`
            )
          );
      } else {
        console.log(chalk.red(`Unknown Error: ${error}`));
        if (store.options.log)
          ws?.write(
            stripAnsi(`Unknown Error: ${error}\n\nStore:\n${util.inspect(store, false, null, false)}`)
          );
      }
      if (store.options.log) {
        ws?.end();
        await waitTillWriteStreamFinished(ws); // wait for ws to finish.
      }
      return '';
    }
  };
}
// export default pixx;
