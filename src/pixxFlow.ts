import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { PixxFlowOptions } from './schema';
import chalk from 'chalk';
import { replaceAsync, pixxFnRegexHTML, pixxFnRegexJSX } from './utils';

export async function pixxFlow(option?: PixxFlowOptions) {
  try {
    const options = { ...option };
    // set options defaults
    if (!Array.isArray(options?.include)) options.include = ['**/*.html', '**/*.jsx', '**/*.tsx'];
    if (!Array.isArray(options?.ignore)) options.ignore = ['node_modules/**', '**/pixx*'];
    if (typeof options?.log !== 'boolean') options.log = false;
    // return HTML and pixx function commented out.
    if (typeof options?.comment !== 'boolean') options.comment = true;
    if (typeof options?.overwrite !== 'boolean') options.overwrite = false;

    // All files to parse. string[].
    const files = await (options?.ignore
      ? glob(options.include, { ignore: options.ignore })
      : glob(options.include));
    if (options?.log) console.log(files);

    // Loop files. Extract static code. Run code.
    for (const file of files) {
      // isHTML file. Change comment style.
      options.isHTML = /htm.?$/i.test(file);
      console.log(chalk.blueBright('Parsing:'), chalk.greenBright(file), '\n\n');
      const textIn = fs.readFileSync(file, 'utf-8');
      // if 'pixx' function not found in file, skip.
      if (!textIn.includes('pixx')) {
        console.log(chalk.yellowBright(`Pixx function not found in ${file}. Skipping...\n\n`));
        continue;
      }

      const html = await replaceAsync(textIn, options.isHTML ? pixxFnRegexHTML : pixxFnRegexJSX, options);

      // write file.
      const parsed = path.parse(path.resolve(file));
      if (options?.log) console.log(parsed);
      // finalize file name and write.
      parsed.base = options?.overwrite ? parsed.base : 'pixx-' + parsed.base;
      fs.writeFileSync(path.format(parsed), html);
      if (options?.log) console.log('\n' + chalk.greenBright(path.format(parsed)));
    }
  } catch (error) {
    console.log(error);
  }
}
