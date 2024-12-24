import { fromError } from 'zod-validation-error';
import { z } from 'zod';
import { OptionType, StateType, OptionSchema, Pixx } from './schema.js';
import {
  createImage,
  getState,
  createImgTag,
  createSourceTag,
  splitCondition,
  createPictureTag,
} from './utils';
import parse from 'html-react-parser';
import { inspect } from 'util';
import chalk from 'chalk';
import type React from 'react';
// @ts-ignore -stop the 'reactNode' error, when scraping page and not calling function in React.
export async function pixx(filePaths: string | string[], options?: OptionType): React.JSX;
export async function pixx(
  filePaths: string | string[],
  options?: OptionType
): Promise<string | React.JSX.Element | React.JSX.Element[]> {
  try {
    // 1. Art direction if array of multiple filePaths images.
    if (Array.isArray(filePaths) && filePaths.length > 1) {
      // check if media tag has break points.
      const optionsParsed = OptionSchema.parse(options);
      // make sure media was provided.
      if (!optionsParsed.media.length)
        throw new Error('Art Direction must have at least one media condition.');
      // last filepaths will be used for img fallback.

      // Store each image path and state.
      const states: [string, StateType][] = [];
      for (const filePath of filePaths) {
        const state = (await getState(filePath, options)) as StateType;
        states.push([`${state.file.imgName}${state.file.ext}`, state]);
      } // end images.

      // Create picture element.
      let picture = '<picture>\n';
      // Loop each media condition, build the 'source' tags to include media condition.
      for (const mediaStr of optionsParsed.media) {
        // split media condition and image name.
        const [media, file] = splitCondition(mediaStr!);
        const fileName = file?.replaceAll(' ', '_'); // remove spaces from file name.
        // if (optionsParsed.log) console.log('\n\nMedia Condition:', media, fileName, '\n\n');
        // make sure media condition exist.
        if (!media || typeof media !== 'string')
          throw new Error('Error with media array. Verify media condition is correct.');
        // find state matching fileName.
        const [_, state] = states.find((a) => a[0] === fileName) as [string, StateType];
        // Create a 'source' element with media attribute for each img 'type'. (e.g. avif, webp, jpg).
        for (const type of optionsParsed.picTypes) {
          picture += `\t${await createSourceTag(state!, type, media)}\n`;
        }
      } // end media loop

      // last image for fallback image.
      picture += `\t${await createImgTag(states.at(-1)![1], true)}\n`;
      picture += '</picture>';
      // show state after all processing done.
      if (optionsParsed.log) console.log('\n\nstates:', inspect(states, false, null, true), '\n\n');
      // show created image element.
      if (optionsParsed.log) console.log('\n\n', chalk.magentaBright(picture), '\n\n');
      return optionsParsed.returnReact ? parse(picture) : picture;
    } // end Art Direction.

    // Responsive Images 👇 -------------------------------------------------------------
    // filePaths could be an array of one or empty.
    if (Array.isArray(filePaths)) {
      if (filePaths.length === 1) filePaths = filePaths[0]!;
      else throw new Error('Input file error. Check pixx input files.');
    }

    const state = (await getState(filePaths, options)) as StateType;

    // 2. Resolution Switching: single image type.
    if (state.picTypes.length === 1) {
      const img = await createImgTag(state, false);
      // blurData
      let imgPath, blurDataURL;
      // show state after all processing done.
      if (state.log) console.log('\n\nstates:', inspect(state, false, null, true), '\n\n');
      // print img element
      if (state.log) console.log('\n\n', chalk.magentaBright(img), '\n\n');
      return state.returnReact ? parse(img) : img;
    } // end Resolution Switching

    // 3. Multiple Types default. state.picTypes.length > 1 and no state.media.length
    const multiTypeImg = await createPictureTag(state);

    // log blur
    let imgPath, blurDataURL;
    // show state after all processing done.
    if (state.log) console.log('\n\nstates:', inspect(state, false, null, true), '\n\n');
    // show picture element
    if (state.log) console.log('\n\n', chalk.magentaBright(multiTypeImg), '\n\n');
    // print blurData.
    return state.returnReact ? parse(multiTypeImg) : multiTypeImg;
  } catch (error) {
    if (error instanceof z.ZodError) {
      // throw new Error();
      console.log(chalk.red(fromError(error).toString()));
      return '';
    }
    if (error instanceof Error) {
      console.log(chalk.red(error.message));
      return '';
      // throw new Error(error.message);
    }
    console.log(chalk.red(error));
    return '';
  }
}
// export default pixx;
