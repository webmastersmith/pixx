import { replaceAsync, pixxFnRegexJSX, pluginReturnEarly, pluginSetOptions } from './utils.js';
import type { PixxPluginInput } from './schema.js';
import chalk from 'chalk';
import fs from 'node:fs';

export async function PixxLoader(source: string): Promise<string> {
  // true, return early, false continue.
  if (pluginReturnEarly(source)) return source;

  //  @ts-ignore -set default options.
  const options = pluginSetOptions(this.getOptions() as PixxPluginInput);

  // @ts-ignore
  const filePath = this.resourcePath;

  // Start
  if (options.log) {
    console.log(chalk.yellow('\nFile currently being parsed:'));
    console.log(chalk.magenta(filePath));
    console.log(chalk.yellow('\noptions'), options);
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
      console.log(chalk.blue('\n\nFile written successfully:'));
      console.log(chalk.green(`${filePath}`));
    } catch (error) {
      console.error(chalk.red(error));
    }
  }

  return html;
}
