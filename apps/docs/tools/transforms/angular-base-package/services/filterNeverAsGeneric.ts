/**
 * This filter is filtering word 'never' when 'never' appears as
 * generic type. For example, next line:
 *
 * ```
 * const NEVER: Observable<never>;
 * ```
 *
 * will filter 'never' in generic declaration of Observable type.
 *
 * This filter is not perfect at all and does not include many
 * cases, such as multiple generic parameter (e.g. <string, never>),
 * but it should be enough to cover the most use cases.
 */
module.exports = function filterNeverAsGeneric(): (words: string[], index: number) => boolean {
  return (words: string[], index: number) => {
    const previousWord = words[index - 1];
    const nextWord = words[index + 1];

    return words[index] === 'never' && /</.test(previousWord) && />/.test(nextWord);
  };
};
