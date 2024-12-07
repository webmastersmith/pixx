import { optional, z } from 'zod';
import { Metadata } from 'sharp';

// sharp input images
const acceptableInputImageTypes = ['avif', 'gif', 'jpeg', 'jpg', 'png', 'tiff', 'webp', 'svg'] as const;
export const InputImageTypeSchema = z.enum(acceptableInputImageTypes, {
  message: `Sharp image library only excepts image types: ${acceptableInputImageTypes.join(', ')}.`,
});

// sharp output images
const acceptableOutputImageTypes = ['avif', 'gif', 'jpeg', 'jpg', 'png', 'tiff', 'webp'] as const;
export const OutputImageTypeSchema = z.enum(acceptableOutputImageTypes, {
  message: `Sharp image library only creates image types: ${acceptableOutputImageTypes.join(', ')}.`,
});
export type OutputImageType = z.infer<typeof OutputImageTypeSchema>;

// filePath schema
export const FilePathSchema = z.object({
  ext: InputImageTypeSchema,
  rootPath: z.string({ message: 'filePath must be a string' }),
  image: z.string({ message: 'filePath must be a string' }),
  name: z.string({ message: 'filePath must be a string' }),
});
export type FilePathType = z.infer<typeof FilePathSchema>;

// check options
export const OptionSchema = z
  .object({
    alt: z.string({ message: 'alt option must be string.' }).optional().default(`image`),
    animation: z.boolean({ message: 'animation option must be true or false.' }).optional().default(false),
    classes: z
      .string({ message: 'class option must an array of strings.' })
      .optional()
      .array()
      .optional()
      .default([]),
    isClassName: z.boolean({ message: 'className option must be true or false.' }).optional().default(true),
    clean: z.boolean({ message: 'clean option must be true or false.' }).optional().default(false),
    fallbackSize: z.number({ message: 'fallbackSize option must be number.' }).optional().default(0),
    heights: z
      .number({ message: 'heights option must be an array of strings.' })
      .optional()
      .array()
      .optional()
      .default([]),
    increment: z.number({ message: 'increment option must be a number.' }).optional().default(300),
    loading: z
      .enum(['eager', 'lazy'], { message: 'loading option can only be "eager" or "lazy".' })
      .optional()
      .default('eager'),
    log: z.boolean({ message: 'log option must be true or false.' }).optional().default(false),
    media: z
      .string({ message: 'media option must an array of strings.' })
      .optional()
      .array()
      .optional()
      .default([]),
    outDir: z.string({ message: 'outDir option must be a string.' }).optional().default('pic_images'),
    picTypes: OutputImageTypeSchema.array().optional().default(['avif', 'webp', 'jpg']),
    showHidden: z.boolean({ message: 'showHidden option must be true or false.' }).optional().default(false),
    sizes: z
      .string({ message: 'sizes option must an array of strings.' })
      .optional()
      .array()
      .optional()
      .default(['100vw']),
    title: z.string({ message: 'title option must be a string.' }).optional().default(''),
    widths: z
      .number({ message: 'widths option must be an array of strings.' })
      .optional()
      .array()
      .optional()
      .default([]),
    withMetadata: z
      .boolean({ message: 'withMetadata option must be true or false.' })
      .optional()
      .default(true),
  })
  .default({});
export type OptionType = z.input<typeof OptionSchema>;

export type StateType = Required<
  OptionType & {
    meta: Metadata;
    file: FilePathType;
    buf: Buffer;
    aspectRatio: string;
    paths: { newImageDir: string };
    fallbackPath: string;
    defaultSizes: ['width' | 'height', number[]] | undefined;
  }
>;

// export interface SharpDetails {
//   alt: string;
//   animated: boolean;
//   c: string; // class
//   className: string; // should your class be called className? default: className
//   clean: boolean; // delete old image files.
//   cssModule: boolean; // styles.class or class="class1 class2"
//   currentFormat: string; // f = 'avif:50' -format and quality can be combined.
//   debug: boolean;
//   desiredAspect: string; // aspect
//   desiredHeight: number;
//   desiredWidth: number;
//   enlarge: boolean;
//   ext: string;
//   _fallback: boolean; // internal use
//   fallbackFormat: string; // Format type of fallback image.
//   fallbackWidth: number;
//   flatten: string[];
//   flattenColor: string;
//   folderPath: string;
//   formats: string[];
//   imgPath: string;
//   imgName: string;
//   loading: string; // eager | lazy
//   mediaQuery: string;
//   name: string;
//   newFileName: string;
//   orgHeight: number;
//   orgWidth: number;
//   print: boolean;
//   progressBar: boolean;
//   quality: number;
//   sharpen: boolean; // boolean
//   sizes: string;
//   srcPath: string;
//   url: string;
//   urls: string[];
//   widths: number[];
//   writePath: string;
//   _writePaths: string[]; // internal use
// }
