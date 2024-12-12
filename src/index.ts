import { fromError } from 'zod-validation-error';
import { z } from 'zod';
import { OptionType, StateType, OptionSchema } from './schema.js';
import {
  createImage,
  getState,
  createImgTag,
  createSourceTag,
  splitCondition,
  createPictureTag,
} from '@/utils';
import parse from 'html-react-parser';
// const parse = require('html-react-parser');
import { inspect } from 'util';
import chalk from 'chalk';
// const chalk = require('chalk');

export async function pixx(filePaths: string | string[], options?: OptionType) {
  try {
    // 1. Art direction if array of multiple filePaths images.
    if (Array.isArray(filePaths)) {
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
        states.push([`${state.file.imgName}.${state.file.ext}`, state]);
        // create blurData
        if (state.isBlur) {
          const [imgPath, { blurDataURL }] = await createImage(state, ['width', state.blur], 'jpg', true);
          // print blurData.
          console.log(`\n\n${state.file.image}:`, chalk.blue(imgPath));
          console.log(`${state.file.image} blurDataURL:`, chalk.yellow(blurDataURL), '\n\n');
        }
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
      return optionsParsed.returnHTML ? parse(picture) : picture;
    } // end Art Direction.

    // Responsive Images 👇 -------------------------------------------------------------
    const state = (await getState(filePaths, options)) as StateType;

    // 2. Resolution Switching: single image type.
    if (state.picTypes.length === 1) {
      const img = await createImgTag(state, false);
      // blurData
      let imgPath, blurDataURL;
      if (state.isBlur) {
        [imgPath, { blurDataURL }] = await createImage(state, ['width', state.blur], 'jpg', true);
      }
      // show state after all processing done.
      if (state.log) console.log('\n\nstates:', inspect(state, false, null, true), '\n\n');
      // print img element
      if (state.log) console.log('\n\n', chalk.magentaBright(img), '\n\n');
      // print blurData.
      if (state.isBlur) {
        console.log(`\n\n${state.file.image}:`, chalk.blue(imgPath));
        console.log(`${state.file.image} blurDataURL:`, chalk.yellow(blurDataURL), '\n\n');
      }
      return state.returnHTML ? parse(img) : img;
    } // end Resolution Switching

    // 3. Multiple Types default. state.picTypes.length > 1 and no state.media.length
    const multiTypeImg = await createPictureTag(state);
    // log blur
    let imgPath, blurDataURL;
    if (state.isBlur) {
      [imgPath, { blurDataURL }] = await createImage(state, ['width', state.blur], 'jpg', true);
    }
    // show state after all processing done.
    if (state.log) console.log('\n\nstates:', inspect(state, false, null, true), '\n\n');
    // show picture element
    if (state.log) console.log('\n\n', chalk.magentaBright(multiTypeImg), '\n\n');
    // print blurData.
    if (state.isBlur) {
      console.log(`\n\n${state.file.image}:`, chalk.blue(imgPath));
      console.log(`${state.file.image} blurDataURL:`, chalk.yellow(blurDataURL), '\n\n');
    }
    return state.returnHTML ? parse(multiTypeImg) : multiTypeImg;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(fromError(error).toString());
    }
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    console.log(error);
  }
}
// export default pixx;

// development
// default test
// pixx('./src/test.jpg').then((m) => console.log('\n\n', m, '\n\n'));

// classes test
// let pending = true;
// pixx('./src/test.jpg', {
//   log: true,
//   title: 'my wonder pic',
//   isBlur: true,
//   classes: ['one', 'bg-red-500', { 'bg-blue-200': pending }],
// });

// single type
// pixx('./src/test.jpg', { log: true, picTypes: ['png'] });

// art direction
// let pending = true;
// pixx(['./src/test.jpg', './src/happy face.jpg'], {
//   log: true,
//   clean: true,
//   returnHTML: true,
//   omit: { remove: 'pixx_images', add: './hello' },
//   media: ['(max-width: 400px) happy face.jpg', '(min-width: 401px) test.jpg'],
//   sizes: ['(max-width: 400px) 100vw', '(min-width: 401px) 50vw'],
//   classes: ['one', 'bg-red-500', { 'bg-blue-200': pending }],
//   isBlur: true,
//   // styles: { color: 'blue', backgroundColor: 'red' },
//   styles: ['color: blue', 'backgroundColor: red'],
// }).then((m) => console.log('\n\n', JSON.stringify(m)));
