import { glob } from 'glob';
import fs from 'fs';
import { pixx } from './pixx';
import { Pixx, PixxFlowOptions } from './schema';
import { inspect } from 'util';
import chalk from 'chalk';

export async function pixxFlow(pixx: Pixx, options: PixxFlowOptions) {
  try {
    // All files to parse. string[].
    const files = await (options?.ignore
      ? glob(options.include, { ignore: options.ignore })
      : glob(options.include));
    if (options?.log || options?.debug) console.log(files);

    // Loop files. Extract static code. Run code.
    for (const file of files) {
      console.log(chalk.blueBright('Parsing:'), chalk.greenBright(file), '\n\n');
      const textIn = fs.readFileSync(file, 'utf-8');
      const isHTML = /htm.?$/i.test(file);
      // Regex to find pixx functions not commented out.
      const regExJSX = /(?<!\/\*\s*{\s*)pixx\s*\((.*?(?:'|"|\]|})\s*)\);?\s*}/gis; // jsx/tsx.
      const regExHTML = /(?<!<!--\s*)pixx\s*\((.*?(?:'|"|\]|})\s*)\);?/gis; // html
      const textOut = await replaceAsync(textIn, isHTML ? regExHTML : regExJSX, isHTML, options, file);

      if (options?.debug) console.log('Processed text to write:', textOut);
      // write file.
      fs.writeFileSync(`avoid-${file.replaceAll('\\', '')}`, textOut);
    }
  } catch (error) {
    console.log(error);
  }

  /**
   * Find with provided regular expression, modify and return.
   * @param str The text to be searched.
   * @param regex The regex to use when searching HTML or JSX. Regex ignores commented out code.
   * @param isHTML When commenting out code, use HTML or JSX style comments.
   * @returns modified str.
   */
  async function replaceAsync(
    str: string,
    regex: RegExp,
    isHTML: boolean,
    options: PixxFlowOptions,
    fileName: string
  ) {
    const promises: Promise<string>[] = [];
    // 1. Run first time with promises.
    str.replace(regex, (match, ...args) => {
      // do something with match, push into promises array. 'args' is an array.
      promises.push(asyncFn(match, args, isHTML, options, fileName));
      return match;
    });
    // 2. resolve promises
    const data = await Promise.all(promises);
    // 3. After promises resolve, run second time, returning resolved promises instead of match.
    return str.replace(regex, () => data.shift() || ''); // always return something.
  }
}

async function asyncFn(
  match: string,
  args: string[],
  isHTML: boolean,
  options: PixxFlowOptions,
  fileName: string
) {
  if (options?.log || options?.debug) console.log(chalk.cyanBright(fileName));
  if (options?.log || options?.debug) console.log(chalk.red('Regex Match:'), chalk.yellowBright(match));
  if (options?.debug) console.log('args:', args[0]);
  // check args for match on pixx arguments. Other args are numbers.
  let wholeMatch = '';
  // remove React output.
  if (typeof args[0] === 'string')
    wholeMatch += args[0].trim().replaceAll(/returnReact:\s*(?:true|false)\s*,?\s*/gi, '');
  // Check if pixx has options as argument. This will match only the 'paths'.
  const singleImageWithOptionsRegex = /['"][^'"]*['"](?=\s*,\s*{)/;
  const multipleImageWithOptionsRegex = /\[[^\]]*\](?=\s*,\s*{)/;

  // Test if single image or an array. assign matching regex.
  const regEx = multipleImageWithOptionsRegex.test(wholeMatch)
    ? multipleImageWithOptionsRegex
    : singleImageWithOptionsRegex.test(wholeMatch)
    ? singleImageWithOptionsRegex
    : null;
  if (options?.debug) console.log(chalk.redBright('Regex that matched:'), regEx);

  let _files = 'No files found';
  let _pixxOptions = 'No options were passed into pixx.';
  // use matching regex to split paths and options.
  if (regEx) {
    const m = wholeMatch.match(regEx);
    // The match start and end index.
    const start = m && typeof m.index === 'number' ? m.index : 0;
    const end = start + ((m && m[0].length) || 0);
    _files = wholeMatch.slice(start, end);
    // Get object passed to pixx, remove beginning comma and spaces.
    _pixxOptions = wholeMatch.slice(end).trim().replace(/,\s*/, '');
    if (options?.debug)
      console.log(chalk.blueBright('_files:'), _files, chalk.blueBright('\n_options: '), _pixxOptions);
    // must be only _files and no _pixxOptions.
  } else _files = wholeMatch;

  // convert to string[].
  const pixxFiles = _files
    .replaceAll(/\[|\]|'|"/g, '')
    .trim()
    .split(',')
    .map((s) => s.trim())
    .filter((s) => !!s);

  if (options?.log || options?.debug) console.log(chalk.blueBright('pixxFiles passed into pixx:'), pixxFiles);
  if (options?.log || options?.debug)
    console.log(chalk.blueBright('_pixxOptions String:'), chalk.green(_pixxOptions));
  // only parse _pixxOptions if it exist.
  let pixxOptions = chalk.redBright('Could not parse pixx options. It is malformed. ');
  if (_pixxOptions.startsWith('{'))
    try {
      pixxOptions = eval('(' + _pixxOptions + ')');
    } catch (e) {
      console.log(e);
    }
  // log options.
  if ((options?.log || options?.debug) && _pixxOptions.includes('{')) {
    if (typeof pixxOptions === 'object')
      console.log(chalk.blueBright('Pixx options after parse:'), inspect(pixxOptions, false, null, true));
    // Object parse failed.
    else console.log(chalk.blueBright('Pixx options after parse:'), pixxOptions);
    console.log(
      chalk.yellowBright('Pixx options should be returned as an object. Pixx object "typeof" is:'),
      chalk.magentaBright(typeof pixxOptions)
    );
  }
  // object parse failed.
  if (_pixxOptions.includes('{') && typeof pixxOptions !== 'object') {
    console.log(
      chalk.redBright(
        'Object parse Failed. No images were created from this function. Use a code formatter to properly format the pixx function.\n\n'
      )
    );
    return '';
  }

  // Comment out 'match' Code and return.
  let commentMatch = '';
  let html = '';
  // JSX Add comments
  if (!isHTML) {
    // everything but last '}'
    const code = match.trim().slice(0, -1);
    commentMatch += `/* ${match.trim()} */}`;
    html += await (pixxOptions && typeof pixxOptions === 'object'
      ? pixx(pixxFiles, pixxOptions)
      : pixx(pixxFiles));
    if (options?.log || options?.debug)
      console.log(chalk.blueBright('Is this an HTML file?'), chalk.magentaBright(isHTML), '\n\n');
  } else {
    // HTML page
    if (options?.log || options?.debug)
      console.log(chalk.blueBright('Is this an HTML file?'), chalk.magentaBright(isHTML), '\n\n');

    commentMatch += `<!-- ${match} -->`;
    html += await (pixxOptions && typeof pixxOptions === 'object'
      ? pixx(pixxFiles, pixxOptions)
      : pixx(pixxFiles));
  }
  return `${commentMatch}\n${html.trim()}\n\n`;
}
