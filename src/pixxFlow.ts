import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { PixxFlowOptions } from './schema';
import chalk from 'chalk';
import { replaceAsync, pixxFnRegexHTML, pixxFnRegexJSX } from './utils';

export async function pixxFlow(option?: PixxFlowOptions): Promise<boolean> {
  try {
    const options = { ...option };
    // set options defaults
    if (!Array.isArray(options?.include)) options.include = ['**/*.html', '**/*.jsx', '**/*.tsx'];
    if (!Array.isArray(options?.ignore)) options.ignore = ['node_modules/**', '**/pixx*'];
    if (typeof options?.log !== 'boolean') options.log = false;
    // return HTML with pixx function commented out or removed.
    if (typeof options?.comment !== 'boolean') options.comment = true;
    if (typeof options?.overwrite !== 'boolean') options.overwrite = false;

    // if 'overwrite' true, change 'comment' to true.
    if (options.overwrite) options.comment = true;

    // All files to parse. string[].
    const files = await glob(options.include, { ignore: options.ignore });
    if (options?.log) console.log(files);

    // Loop files. Extract static code. Run code.
    for (const file of files) {
      // isHTML file. Change comment style.
      if (typeof options?.isHTML !== 'boolean') options.isHTML = /htm.?$/i.test(file);
      console.log(chalk.blueBright('Parsing:'), chalk.greenBright(file), '\n\n');
      const textIn = fs.readFileSync(file, 'utf-8');
      // if 'pixx' function not found in file, skip.
      if (!textIn.includes('pixx')) {
        console.log(chalk.yellowBright(`\n\nPixx function not found in ${file}. Skipping...\n\n`));
        continue;
      }

      const html = await replaceAsync(textIn, options.isHTML ? pixxFnRegexHTML : pixxFnRegexJSX, options);

      // write file.
      const parsed = path.parse(path.resolve(file));
      if (options?.log) console.log(parsed);
      // finalize file name and write.
      parsed.base = options?.overwrite ? parsed.base : 'pixx-' + parsed.base;
      const filePath = path.format(parsed);
      fs.writeFileSync(filePath, html);
      console.log(chalk.green(`\n\nFile written successfully: ${filePath}\n\n`));
    }
    return true;
  } catch (error) {
    console.error(chalk.red(error));
    return false;
  }
}
