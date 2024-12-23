import { replaceAsync, pixxFnRegexJSX, pluginReturnEarly, pluginSetOptions } from './utils.js';
import { PixxPluginInput } from './schema.js';
import chalk from 'chalk';
import fs from 'fs';

export async function PixxLoader(source: string): Promise<string> {
  // true, return early, false continue.
  if (pluginReturnEarly(source)) return source;

  //  @ts-ignore -set default options.
  const options = pluginSetOptions(this.getOptions() as PixxPluginInput);

  // @ts-ignore
  const filePath = this.resourcePath;

  // Start
  if (options.log) {
    console.log(chalk.magenta(filePath));
    console.log('options', options);
    console.log(chalk.yellow('\n\nSource React File:\n'), chalk.magentaBright(source), '\n\n');
  }

  // Async replace with commented pixx function and html code.
  const html = await replaceAsync(source, pixxFnRegexJSX, options);

  if (options.log)
    console.log(chalk.yellow('\n\nHTML returned to NextJS Server:\n'), chalk.greenBright(html), '\n\n');

  // overwrite?
  if (options.overwrite) {
    try {
      fs.writeFileSync(filePath, html);
      console.log(chalk.green(`\n\nFile: ${filePath} written successfully.\n\n`));
    } catch (error) {
      console.error(chalk.red(error));
    }
  }

  return html;
}
