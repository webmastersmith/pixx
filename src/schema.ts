import { z } from 'zod';
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
  imgName: z.string({ message: 'filePath must be a string' }),
});
export type FilePathType = z.infer<typeof FilePathSchema>;

// omit and replace
const OmitSchema = z
  .object({
    remove: z.string({ message: 'omit remove option must be string.' }).optional(),
    add: z.string({ message: 'replace add option must be string.' }).optional(),
  })
  .optional();

// check options
export const OptionSchema = z
  .object({
    alt: z.string({ message: 'alt option must be string.' }).optional().default(`image`),
    animation: z.boolean({ message: 'animation option must be true or false.' }).optional().default(false),
    blur: z.number({ message: 'blur option must be a number.' }).optional().default(10),
    isBlur: z.boolean({ message: 'isBlur option must be a number.' }).optional().default(false),
    classes: z
      .union([z.string().optional(), z.record(z.string(), z.boolean()).optional()])
      .optional()
      .array()
      .optional()
      .default([]),
    clean: z.boolean({ message: 'clean option must be true or false.' }).optional().default(false),
    decoding: z
      .enum(['sync', 'async'], { message: 'decoding option can only be "sync" or "async".' })
      .optional()
      .default('async'),
    fallbackWidth: z.number({ message: 'fallbackWidth option must be a number.' }).optional().default(0),
    heights: z
      .number({ message: 'heights option must be an array of strings.' })
      .optional()
      .array()
      .optional()
      .default([]),
    increment: z.number({ message: 'increment option must be a number.' }).optional().default(300),
    isClassName: z.boolean({ message: 'className option must be true or false.' }).optional().default(true),
    linuxPaths: z.boolean({ message: 'linuxPaths option must be true or false.' }).optional().default(true),
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
    outDir: z.string({ message: 'outDir option must be a string.' }).optional().default('pixx_images'),
    omit: OmitSchema.default({ remove: '', add: '' }),
    picTypes: OutputImageTypeSchema.array().min(1).default(['avif', 'webp', 'jpg']),
    preload: z.boolean({ message: 'preload option must be true or false.' }).optional().default(false),
    preloadFetchPriority: z
      .enum(['auto', 'low', 'high'], {
        message: 'preloadFetchPriority option can only be "auto", "low" or "high".',
      })
      .optional()
      .default('auto'),
    returnHTML: z.boolean({ message: 'returnHTML option must be true or false.' }).optional().default(false),
    sizes: z
      .string({ message: 'sizes option must an array of strings.' })
      .optional()
      .array()
      .optional()
      .default(['100vw']),
    styles: z
      .array(z.string({ message: 'styles option must be an array of strings or object' }).optional())
      .or(
        z
          .record(z.string(), z.string(), { message: 'styles option must be an array of strings or object' })
          .optional()
      )
      .optional()
      .default([]),
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
type NonNullable<T> = Exclude<T, null | undefined>; // remove undefined from property.
export type OptionType = z.input<typeof OptionSchema>; // Required removes '?'.
export type OptionRequiredType = Required<NonNullable<OptionType>>; // Required removes '?'.

export type StateType = Required<
  OptionRequiredType & {
    meta: Metadata;
    file: FilePathType;
    buf: Buffer;
    aspectRatio: string;
    paths: { newImageDir: string };
    fallbackPath: string;
    fallbackSize: { width: number; height: number };
    classStr: string;
    imgCount: number;
    totalImages: number;
    // cliBar: GenericBar | boolean;
    cliBar: (name: string, step: number, totalSteps: number) => void;
    defaultSizes: ['width' | 'height', number[]];
  }
>;
