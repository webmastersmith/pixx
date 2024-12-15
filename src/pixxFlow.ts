import { glob } from 'glob';
import fs from 'fs';
import { pixx } from './pixx';
import { Pixx, PixxFlowOptions } from './schema';
import { inspect } from 'util';

export async function pixxFlow(
  pixx: Pixx,
  globFiles: { include: string[]; ignore: string[] },
  options?: PixxFlowOptions
) {
  // pixx('./src/happy face.jpg').then((m) => console.log('\n\n', m, '\n\n'));

  const files = await (globFiles?.ignore
    ? glob(globFiles.include, { ignore: globFiles.ignore })
    : glob(globFiles.include));
  if (options?.log) console.log(files);

  // Loop files. Extract static code. Run code.
  for (const file of files) {
    console.log('Parsing:', file);
    const textIn = fs.readFileSync(file, 'utf-8');
    const isHTML = /htm.?$/i.test(file);
    const regExJSX = /(?<!\/\*\s*{\s*)pixx\s*\((.*?(?:'|"|\]|})\s*)\);?\s*}/gis; // jsx/tsx.
    const regExHTML = /(?<!<!--\s*)pixx\s*\((.*?(?:'|"|\]|})\s*)\);?/gis; // html
    const textOut = await replaceAsync(textIn, isHTML ? regExHTML : regExJSX, isHTML, options);
    if (options?.log) console.log('Processed text to write:', textOut);
    // write file.
    fs.writeFileSync(`avoid-${file.replaceAll('\\', '')}`, textOut);
  }

  /**
   * Find with provided regular expression, modify and return.
   * @param str The text to be searched.
   * @param regex The regex to use when searching HTML or JSX. Regex ignores commented out code.
   * @param isHTML When commenting out code, use HTML or JSX style comments.
   * @returns modified str.
   */
  async function replaceAsync(str: string, regex: RegExp, isHTML: boolean, options?: PixxFlowOptions) {
    const promises: Promise<string>[] = [];
    // 1. Run first time with promises.
    str.replace(regex, (match, ...args) => {
      // do something with match, push into promises array. 'args' is an array.
      promises.push(asyncFn(match, args, isHTML, options));
      return match;
    });
    // 2. resolve promises
    const data = await Promise.all(promises);
    // 3. After promises resolve, run second time, returning resolved promises instead of match.
    return str.replace(regex, () => data.shift() || ''); // always return something.
  }
}

async function asyncFn(match: string, args: string[], isHTML: boolean, options?: PixxFlowOptions) {
  if (options?.log) console.log('match', match);
  if (options?.log) console.log('\n\nargs:', args[0], '\n\n\n');
  // check args for match on pixx arguments. Other args are numbers.
  let wholeMatch = '';
  if (typeof args[0] === 'string')
    wholeMatch += args[0].trim().replaceAll(/returnReact:\s*(?:true|false)\s*,?\s*/gi, '');
  const singleImageWithOptionsRegex = /['"][^'"]*['"](?=\s*,\s*{)/;
  const multipleImageWithOptionsRegex = /\[[^\]]*\](?=\s*,\s*{)/;

  // assign matching regex. -can be [], {} or ', {}
  const regEx = multipleImageWithOptionsRegex.test(wholeMatch)
    ? multipleImageWithOptionsRegex
    : singleImageWithOptionsRegex.test(wholeMatch)
    ? singleImageWithOptionsRegex
    : null;
  if (options?.log) console.log('regex:', regEx);

  let _files = '';
  let _pixxOptions = '';
  if (regEx) {
    const m = wholeMatch.match(regEx);
    // Get match start and end index.
    const start = m && typeof m.index === 'number' ? m.index : 0;
    const end = start + ((m && m[0].length) || 0);
    _files += wholeMatch.slice(start, end);
    _pixxOptions += wholeMatch.slice(end).trim().replace(/,\s*/, '');
    if (options?.log) console.log('\n\n_files', _files, '\n\n_options: ', _pixxOptions, '\n\n');
    // must be only _files and no _pixxOptions.
  } else _files += wholeMatch;

  // convert to string[].
  const pixxFiles = _files
    .replaceAll(/\[|\]|'|"/g, '')
    .trim()
    .split(',')
    .map((s) => s.trim())
    .filter((s) => !!s);

  if (options?.log) console.log('\n\npixxFiles:', pixxFiles, '\n\n');
  const pixxOptions = eval(_pixxOptions) || undefined;
  if (options?.log) console.log('\n\noptions:', inspect(options, false, null, true), '\n\n');

  // Comment Code and return.
  let commentMatch = '';
  let html = '';
  if (!isHTML) {
    // JSX Add comments
    const code = match.trim().slice(0, -1);
    const bracket = match.trim().slice(-1);
    commentMatch += `/* ${match.trim()} */${bracket}`;
    html += await (pixxOptions ? pixx(pixxFiles, pixxOptions) : pixx(pixxFiles));
  } else {
    // HTML page
    commentMatch += `<!-- ${match} -->`;
    // html += await (pixxOptions ? pixx(pixxFiles, pixxOptions) : pixx(pixxFiles));
  }
  return `${commentMatch}\n${html.trim()}\n\n`;
  // return matchFix;
}
