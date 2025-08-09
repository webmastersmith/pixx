import fs from 'node:fs';
import chalk from 'chalk';
import { replaceAsync, pixxFnRegexJSX, pluginReturnEarly, pluginSetOptions } from './utils';
import type { PixxPluginInput } from './schema.js';
// import util from 'node:util';

export function pixxVitePlugin(option?: PixxPluginInput) {
  return {
    name: 'vite-plugin-pixx', // this name will show up in warnings and errors
    // configResolved(config) {
    //   console.log(config);
    // },
    async load(_id: string) {
      // '_id' is file path.
      // remove query-string('?key=value&key2=value2'), when ssr splits files.
      const [id, ...rest] = _id.split('?');
      if (!id) return null; // return early
      // console.log(id);

      if (/(\.(j|t)sx|\.astro)$/.test(id)) {
        const text = fs.readFileSync(id, 'utf-8');
        // true, return early, false continue.
        if (pluginReturnEarly(text)) return;

        // set default options
        const options = pluginSetOptions(option);

        // Start
        if (options.log) {
          console.log(chalk.yellow('\nFile currently being parsed:'));
          console.log(chalk.magenta(id));
          console.log(chalk.yellow('\nVite Options:'), options);
          console.log(chalk.yellow('\n\nSource React File:\n'), chalk.magentaBright(text), '\n\n');
        }

        const extraOptions = {
          vite: true,
        };
        const html = await replaceAsync(text, pixxFnRegexJSX, options, extraOptions);

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
      return null;
    }, // end load
  }; // end VitePlugin return
}
