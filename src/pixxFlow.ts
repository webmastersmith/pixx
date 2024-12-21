import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { PixxFlowOptions } from './schema';
import chalk from 'chalk';
import { replaceAsync } from './utils';

export async function pixxFlow(options: PixxFlowOptions) {
  try {
    // All files to parse. string[].
    const files = await (options?.ignore
      ? glob(options.include, { ignore: options.ignore })
      : glob(options.include));
    if (options?.log) console.log(files);

    // return HTML and pixx function commented out.
    options.comment = true;
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
      // Regex to find pixx functions not commented out.
      const regExJSX = /{\s*(?!\/\*)\s*(pixx\s*\(.*?(?:'|"|\]|})\s*\));?\s*}/gis; // jsx/tsx.
      // regExJSX:
      // { pixx('./images/happy face.jpg', {
      //   returnReact: true,
      //   omit: { remove: 'public/' },
      //   outDir: 'public',
      // }) }
      const regExHTML =
        /(?<!<!--\s*)(?:<script[^>]*>).*?(pixx\s*\(.*?(?:'|"|\]|})\s*\));?.*?(?:<\/script>)/gis;
      // regExHTML:
      // <script>
      //     pixx('./images/compass.jpg', {
      //       widths: [50, 200],
      //       classes: ['one', 'two', 'three'],
      //       withClassName: false,
      //     });
      // </script>

      const html = await replaceAsync(textIn, options.isHTML ? regExHTML : regExJSX, options);

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
