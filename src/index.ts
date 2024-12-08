import { fromError } from 'zod-validation-error';
import { z } from 'zod';
import { OptionType, StateType, OutputImageType } from '@/schema';
import { createImage, getState, createSrcSet, createImgTag, createSourceTag } from '@/utils';

export async function pic(filePaths: string | string[], options?: OptionType) {
  try {
    // 1. Art direction only. filePaths string or array?
    if (Array.isArray(filePaths)) {
      return;
    }

    const state = (await getState(filePaths, options)) as StateType;

    // 2. Resolution Switching: single image type.
    if (state.picTypes.length === 1) {
      return await createImgTag(state, false);
    }

    // 3. Multiple Types default. state.picTypes.length > 1 and no state.media.length
    let picture = '<picture>\n';
    for (const type of state.picTypes) {
      picture += `\t${await createSourceTag(state, type)}\n`;
    }
    picture += `\t${await createImgTag(state, true)}\n`;
    picture += '</picture>';
    return picture;
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

// development
// default test
pic('./src/test.jpg').then((m) => console.log(m));

// classes test
// let pending = true;
// pic('./src/test.jpg', {
//   clean: false,
//   log: true,
//   title: 'my wonder pic',
//   classes: ['one', 'bg-red-500', { 'bg-blue-200': pending }],
// }).then((m) => console.log(m));

// single image test
// pic('./src/test.jpg', { log: true, picTypes: ['png'] }).then((m) => console.log(m));
export default pic;
