import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { FilePathSchema, FilePathType } from '@/types';

/**
 * Get original image size and format.
 * @param sharpDetails image state
 * @returns object: width, height, format
 */
export async function getMetadata(filePath: string) {
  const details = await sharp(filePath).metadata();
  // { width, height, format };
  return details;
}

/**
 * Create image sizes every 300px
 * @param width find widths every 300px
 * @param height find height every 300px
 */
export function defaultSize(
  width: number = 0,
  height: number = 0,
  increaseSize: number
): ['width' | 'height', number[]] | undefined {
  // return early if not a number or less than 1.
  if (Number.isNaN(+width) || Number.isNaN(+height)) return;
  if (width < 1 || height < 1) return;

  // width, height ok, get default sizes.
  let size = increaseSize;
  const sizes: number[] = [];
  // return the smaller size
  const smallSide = width <= height ? width : height;
  const key = width <= height ? 'width' : 'height';
  while (size < smallSide) {
    if (size < smallSide) {
      sizes.push(size);
      size += increaseSize;
    } else {
      // check if image was smaller than increaseSize;
      if (sizes.length === 0) {
        console.error('Image increase size was bigger than image.');
        sizes.push(smallSide);
      }
      break;
    }
  }
  return [key, sizes];
}

/**
 * Destructure file path and image name.
 * Throw error is path is faulty or images does not exist.
 * @param filePath path of image.
 */
export function getName(filePath: string): FilePathType {
  if (!fs.existsSync(filePath)) throw new Error(`File not found: ${filePath}`);
  const paths = filePath.split(/\/|\\/);
  const image = paths.pop();
  const lastIndex = image?.lastIndexOf('.');
  const name = image?.slice(0, lastIndex);
  const ext = image?.slice(lastIndex! + 1);
  const rootPath = path.join(...paths); // if 'paths' is empty, will return '.'
  const file = { rootPath, image, name, ext };
  return FilePathSchema.parse(file);
}
