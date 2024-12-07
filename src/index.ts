import { fromError } from 'zod-validation-error';
import { z } from 'zod';
import { OptionSchema, OptionType, StateType } from '@/schema';
import { defaultSize, getMetadata, getFile, createImage, getAspectRatio, startNames } from '@/utils';

export async function pic(filePath: string, options?: OptionType) {
  try {
    // throw error if options are not correct.
    const optionsParsed = OptionSchema.parse(options);
    // throw error is image cannot be found.
    const { file, buf } = getFile(filePath);
    // get image metadata. Throw error if width or height cannot be determined.
    const meta = await getMetadata(buf, optionsParsed?.showHidden);
    // get file names. create outDir, clean?
    const paths = startNames(optionsParsed, file, meta);
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
    if (state.log) console.log('state: ', state);

    // Logic Functions ------------------------------------------------
    // always create fallback
    state.fallbackPath = await createImage(state, [], 'jpg'); // purposely not 'awaiting'.

    // 1. Art Direction: state.media types.
    if (state.media.length) {
      return;
    }

    // 2. Resolution Switching: single image type.
    if (state.picTypes.length < 2) {
      return;
    }

    // 3. Multiple Types default. state.picTypes.length > 1 and no state.media.length
    // for (const w of [100, 200, 300]) {
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
pic('./src/test.jpg', { clean: true, log: true });
export default pic;
