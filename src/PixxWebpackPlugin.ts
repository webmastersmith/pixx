export async function PixxWebpackPlugin(source: string): Promise<string> {
  // console.log('pixx source:', source);
  //  @ts-ignore
  const options = this.getOptions() as {};
  // console.log('pixx options:', options);

  const html = await pixxSingleFlow(source, options);
  // console.log(html);
  return html;
}

/**
 * From 'page' or string, run pixx. return html code and comment out function.
 * @param str single str(page) to parse images from.
 */
async function pixxSingleFlow(str: string, options?: any) {
  // JSX Regex to find pixx functions. Ignore if pixx function is commented out.
  const regExJSX = /{\s*(pixx\s*\(.*?(?:'|"|\]|})\s*\))\s*}/gis;
  // Async replace with commented pixx function and html code.
  const source = await replaceAsync(str, regExJSX, options);
  // comment out pixx import.
  const importPixxRegex = /^\s*import .*? from .*?pixx.*?$/gm;
  const requirePixxRegex = /^\s*(const|let|var).*?require(.*?pixx.*?).*?$/gm;
  // .replaceAll(importPixxRegex, (m) => `// ${m.trim()}`)
  // .replaceAll(requirePixxRegex, (m) => `// ${m.trim()}`);
  return source.replaceAll(importPixxRegex, '').replaceAll(requirePixxRegex, '');
}

/**
 * Find pixx function with regex, call it to create images and return html.
 * @param str The text to be searched.
 * @param regex The regex to use when searching HTML or JSX. Regex ignores commented out code.
 * @param isHTML When commenting out code, use HTML or JSX style comments.
 * @returns modified str.
 */
async function replaceAsync(str: string, regex: RegExp, options?: any) {
  const promises: Promise<string>[] = [];
  // 1. Run first time with promises.
  str.replace(regex, (match, ...args) => {
    // do something with match, push into promises array.
    promises.push(asyncFn(match, args, options)); // 'args' is an array.
    return match;
  });
  // 2. resolve promises
  const data = await Promise.all(promises);
  // 3. After promises resolve, run second time, returning resolved promises instead of match.
  return str.replace(regex, () => data.shift() || ''); // always return something.
}

/**
 * Regex string 'match', deconstruct, build, return HTML
 * @param match regex match.
 * @param  args multiple parens match.
 * @returns HTML code
 */
async function asyncFn(match: string, args: string[], options?: any) {
  const { pixx } = await import('./pixx.js');
  const chalk = await import('chalk');

  // match example:
  // { pixx('./images/happy face.jpg', {
  //   returnReact: true,
  //   omit: { remove: 'public/' },
  //   outDir: 'public',
  // }) }

  // Remove React brackets. HTML must be returned as a string, so remove 'returnReact: true'.
  const startBracket = match.indexOf('{') + 1; // get index of first bracket. Inclusive, so + 1.
  const endBracket = match.lastIndexOf('}'); // get index of last bracket. Exclusive.
  const pixxFn = match
    .slice(startBracket, endBracket)
    .trim()
    .replaceAll(/returnReact:\s*(?:true|false)\s*,?\s*/gi, '');

  try {
    // call the pixx function.
    const html = await eval(pixxFn);
    return html;
  } catch (error) {
    console.log(chalk.redBright(error));
    return '';
  }
}
