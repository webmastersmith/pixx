import { z } from 'zod';
import type { Metadata } from 'sharp';
import type parse from 'html-react-parser';

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
  dir: z.string({ message: 'filePath must be a string' }),
  base: z.string({ message: 'filePath must be a string' }),
  name: z.string({ message: 'filePath must be a string' }),
  imgName: z.string({ message: 'filePath must be a string' }),
});
export type FilePathType = z.infer<typeof FilePathSchema>;

// omit and replace
const OmitSchema = z
  .object({
    remove: z.string({ message: 'omit "remove" option must be string.' }).optional(),
    add: z.string({ message: 'omit "add" option must be string.' }).optional(),
  })
  .optional();

// check options
export const OptionSchema = z
  .object({
    alt: z.string({ message: 'alt option must be string.' }).optional().default('image'),
    backgroundSize: z
      .string({ message: 'backgroundSize option must be a string.' })
      .optional()
      .default('cover'),
    blurSize: z.number({ message: 'blurSize option must be a number.' }).optional().default(16),
    blurOnly: z.boolean({ message: 'blurOnly option must be true or false.' }).optional().default(false),
    classes: z.string({ message: 'classes option must an array of strings.' }).array().optional().default([]),
    clean: z.boolean({ message: 'clean option must be true or false.' }).optional().default(false),
    // cn: z
    //   .custom<CN>((val) => true)
    //   .optional()
    //   .default(cn),
    decoding: z
      .enum(['auto', 'sync', 'async'], { message: 'decoding option can only be "auto", "sync" or "async".' })
      .optional()
      .default('auto'),
    fallbackWidth: z.number({ message: 'fallbackWidth option must be a number.' }).optional().default(0),
    fallbackPreloadWidth: z
      .number({ message: 'fallbackPreload option must be a number.' })
      .optional()
      .default(0),
    fetchPriority: z
      .enum(['auto', 'high', 'low'], { message: 'fetchPriority option can only be "auto", "high" or "low".' })
      .optional()
      .default('auto'),
    heights: z
      .number({ message: 'heights option must be an array of numbers.' })
      .array()
      .optional()
      .default([]),
    incrementSize: z.number({ message: 'incrementSize option must be a number.' }).optional().default(300),
    linuxPaths: z.boolean({ message: 'linuxPaths option must be true or false.' }).optional().default(true),
    loading: z
      .enum(['eager', 'lazy'], { message: 'loading option can only be "eager" or "lazy".' })
      .optional()
      .default('lazy'),
    log: z.boolean({ message: 'log option must be true or false.' }).optional().default(false),
    media: z.string({ message: 'media option must an array of strings.' }).array().optional().default([]),
    nextjs: z.boolean({ message: 'nextjs option must be true or false.' }).optional().default(false),
    outDir: z.string({ message: 'outDir option must be a string.' }).optional().default('pixx_images'),
    omit: OmitSchema.default({ remove: '', add: '' }),
    picTypes: OutputImageTypeSchema.array().min(1).default(['avif', 'webp', 'jpg']),
    preloadFetchPriority: z
      .enum(['auto', 'low', 'high'], {
        message: 'preloadFetchPriority option can only be "auto", "low" or "high".',
      })
      .optional()
      .default('auto'),
    progressBar: z.boolean({ message: 'progressBar option must be true or false.' }).optional().default(true),
    returnJSX: z.boolean({ message: 'returnJSX option must be true or false.' }).optional().default(false),
    sizes: z
      .string({ message: 'sizes option must be an array of strings.' })
      .array()
      .optional()
      .default(['100vw']),
    styles: z.string({ message: 'styles option must be a string.' }).optional().default(''),
    title: z.string({ message: 'title option must be a string.' }).optional().default(''),
    vite: z.boolean({ message: 'vite option must be true or false.' }).optional().default(false),
    v: z
      .custom<unknown[]>((val: unknown[]) => true)
      .optional()
      .default([]),
    widths: z
      .number({ message: 'widths option must be an array of strings.' })
      .array()
      .optional()
      .default([]),
    withAnimation: z
      .boolean({ message: 'withAnimation option must be true or false.' })
      .optional()
      .default(false),
    withBlur: z.boolean({ message: 'withBlur option must be true or false.' }).optional().default(false),
    withClassName: z
      .boolean({ message: 'withClassName option must be true or false.' })
      .optional()
      .default(true),
    withMetadata: z
      .boolean({ message: 'withMetadata option must be true or false.' })
      .optional()
      .default(false),
  })
  .default({});
type NonNullable<T> = Exclude<T, null | undefined>; // remove undefined from property.
export type OptionType = z.input<typeof OptionSchema>; // Required removes '?'.
export type OptionRequiredType = Required<NonNullable<OptionType>>; // Required removes '?'.

// Sharp Metadata with  width/height number[]
export type Meta = Omit<Metadata, 'width' | 'height'> & { width: number; height: number };
export type StateType = Required<
  OptionRequiredType & {
    meta: Meta;
    file: FilePathType;
    buf: Buffer;
    aspectRatio: string;
    paths: { newImageDir: string; resolvedNewImageDir: string };
    fallbackData: { width: number; height: number; fallbackPath: string };
    fallbackPreloadData: { width: number; height: number; fallbackPreloadPath: string };
    blurData: { blurPath: string; width: number; height: number; blurDataURL: string };
    classStr: string;
    imgCount: number;
    totalImages: number;
    cliBar: ((name: string, step: number, totalSteps: number) => void) | string;
    defaultSizes: ['width' | 'height', number[]];
  }
>;

export type Pixx = (
  FilePaths: string | string[],
  options?: OptionType
) => Promise<string | undefined | ReturnType<typeof parse>>;

export type PixxFlowOptions = {
  include?: string[];
  ignore?: string[];
  log?: boolean;
  overwrite?: boolean;
  isHTML?: boolean;
  comment?: boolean;
};

export type PixxPluginInput =
  | {
      log?: boolean;
      overwrite?: boolean;
      isHTML?: boolean;
      comment?: boolean;
      regularExpression?: string;
    }
  | undefined;

export type PixxPluginOptions = NonNullable<Required<PixxPluginInput>>;
