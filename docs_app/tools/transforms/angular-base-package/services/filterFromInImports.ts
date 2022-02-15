/**
 * This filter is filtering word 'from' in ES6 import statements.
 * For example, next line:
 *
 * ```
 * import { interval, from } from 'rxjs';
 * ```
 *
 * will filter the second occurrence of the word 'from' leaving
 * it without the link, but the first occurrence will remain
 * unfiltered, thus it will get the link to
 * /api/index/function/from
 */
module.exports = function filterFromInImports(): (words: string[], index: number) => boolean {
  return (words: string[], index: number) => {
    const previousWord = words[index - 1];
    const nextWord = words[index + 1];

    return words[index] === 'from' && /}/.test(previousWord) && /'/.test(nextWord);
  };
};
