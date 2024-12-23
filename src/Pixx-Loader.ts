import { replaceAsync, pixxFnRegexJSX } from './utils.js';
import { PixxWebpackOptions } from './schema.js';
import chalk from 'chalk';

export async function PixxLoader(source: string): Promise<string> {
  // console.log('pixx source:', source);
  //  @ts-ignore
  const options = this.getOptions() as PixxWebpackOptions;
  if (typeof options?.comment !== 'boolean') options.comment = false;
  if (typeof options?.log !== 'boolean') options.log = false;
  if (typeof options?.isHTML !== 'boolean') options.isHTML = false;
  if (typeof options?.overwrite !== 'boolean') options.overwrite = false;

  // console.log('pixx options:', options);
  if (options?.log) {
    console.log('options', options);
    console.log(chalk.yellow('\n\nSource React File:\n'), chalk.magentaBright(source), '\n\n');
  }
  const html = await pixxSingleFlow(source, options);
  if (options?.log)
    console.log(chalk.yellow('\n\nHTML returned to NextJS Server:\n'), chalk.greenBright(html), '\n\n');
  return html;
}

/**
 * From 'page' or string, run pixx. return html code and comment out function.
 * @param str single str(page) to parse images from.
 */
async function pixxSingleFlow(str: string, options: PixxWebpackOptions) {
  // Async replace with commented pixx function and html code.
  const html = await replaceAsync(str, pixxFnRegexJSX, options);
  return html;
}
