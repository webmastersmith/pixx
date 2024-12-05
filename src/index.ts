import { fromError } from 'zod-validation-error';
import { z } from 'zod';
import { OptionSchema, OptionType, StateType } from '@/schema';
import { defaultSize, getMetadata, getName } from '@/utils';

export async function pic(filePath: string, options: OptionType = {}) {
  try {
    // throw error is image cannot be found.
    const file = getName(filePath);
    // throw error if options are not correct.
    const optionsParsed = OptionSchema.parse(options);
    // get image metadata.
    const meta = await getMetadata(filePath);

    // defaults
    const state: StateType = {
      meta,
      file,
      increment: 300, // 300px
      defaultSizes: defaultSize(
        meta?.width,
        meta?.height,
        optionsParsed?.increment ? optionsParsed.increment : 300
      ),
      alt: `image ${file.image}`,
      className: true, // class or className for styling
      class: [],
      clean: false, // always remake images? useful when developing.
      heights: [],
      loading: 'eager', // eager | lazy
      log: false, // output image creation to console.
      outDir: 'images',
      picTypes: ['avif', 'webp', 'jpg'],
      widths: [], // if aspectRatio: true, height is ignored.
      ...optionsParsed,
    };
    console.log(state);
    return `<picture class={styles.texasImage}>
      <source
        type="image/avif"
        srcset="/header/texasFlag/texasFlag_20-19_100x95.avif 100w, /header/texasFlag/texasFlag_22-21_200x191.avif 200w, /header/texasFlag/texasFlag_22-21_265x253.avif 265w"
        sizes="100px"
      />
      <source
        type="image/webp"
        srcset="/header/texasFlag/texasFlag_20-19_100x95.webp 100w, /header/texasFlag/texasFlag_22-21_200x191.webp 200w, /header/texasFlag/texasFlag_22-21_265x253.webp 265w"
        sizes="100px"
      />
      <source
        type="image/png"
        srcset="/header/texasFlag/texasFlag_20-19_100x95.png 100w, /header/texasFlag/texasFlag_22-21_200x191.png 200w, /header/texasFlag/texasFlag_22-21_265x253.png 265w"
        sizes="100px"
      />
      <img
        src="/header/texasFlag/texasFlag_20-19_100x95.png"
        width="100"
        height="95"
        alt="Image of Texas Flag"
        class={styles.texasImage}
        loading="lazy"
      />
    </picture>`;
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
