import fs from 'fs';
import chalk from 'chalk';
import { replaceAsync, pixxFnRegexJSX, pluginReturnEarly, pluginSetOptions } from './utils';
import { PixxPluginInput } from './schema.js';

export function VitePluginReactPixx(option?: PixxPluginInput) {
  return {
    name: 'vite-plugin-pixx', // this name will show up in warnings and errors
    async load(id: string) {
      if (/(j|t)sx$/.test(id)) {
        const text = fs.readFileSync(id, 'utf-8');
        // true, return early, false continue.
        if (pluginReturnEarly(text)) return;

        // set default options
        const options = pluginSetOptions(option);

        // Start
        if (options.log) {
          console.log(chalk.yellow('\nFile currently being parsed:'));
          console.log(chalk.magenta(id));
          console.log(chalk.yellow('\noptions'), options);
          console.log(chalk.yellow('\n\nSource React File:\n'), chalk.magentaBright(text), '\n\n');
        }

        const html = await replaceAsync(text, pixxFnRegexJSX, options);

        if (options.log)
          console.log(chalk.yellow('\n\nHTML returned to Vite Server:\n'), chalk.greenBright(html), '\n\n');

        // overwrite?
        if (options.overwrite)
          fs.writeFile(id, html, (err) => {
            if (err) console.error(chalk.red(err));
            else {
              console.log(chalk.blue('\n\nFile written successfully:'));
              console.log(chalk.green(`${id}`));
            }
          });

        return html;
      }
      return;
    },
  };
}
