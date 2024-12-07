import { fromError } from 'zod-validation-error';
import { z } from 'zod';
import { OptionSchema, OptionType, StateType } from '@/schema';
import {
  defaultSize,
  getMetadata,
  getFile,
  createImage,
  getAspectRatio,
  getNames,
  createFallback,
} from '@/utils';

export async function pic(filePath: string, options?: OptionType) {
  try {
    // throw error if options are not correct.
    const optionsParsed = OptionSchema.parse(options);
    // throw error is image cannot be found.
    const { file, buf } = getFile(filePath);
    // get image metadata. Throw error if width or height cannot be determined.
    const meta = await getMetadata(buf, optionsParsed?.showHidden);
    // get file names
    const names = getNames(optionsParsed, file);
    // defaults
    const state = {
      ...optionsParsed,
      meta,
      file,
      buf,
      names,
      aspectRatio: getAspectRatio(meta.width! / meta.height!),
      defaultSizes: defaultSize(meta.width, meta.height, optionsParsed.increment),
    } as StateType;
    // if (state.log) console.log('state: ', state);
    console.log('state: ', state);

    // Logic Functions ------------------------------------------------
    // always create fallback
    createFallback(state); // purposely not 'awaiting'.

    // Resolution Switching: single image type.

    // Multiple Types
    // state.picTypes.length > 1 and no state.media.length

    // Art Direction: state.media types.

    // for (const w of [100, 200, 300]) {
    //   createImage(state, ['width', w], 'jpg');
    // }

    return;
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
pic('./src/test.jpg');
export default pic;
