/**
 * An error thrown when an Observable or a sequence was queried but has no
 * elements.
 *
 * @see {@link first}
 * @see {@link last}
 * @see {@link single}
 * @see {@link firstValueFrom}
 * @see {@link lastValueFrom}
 */
export class EmptyError extends Error {
  name = 'EmptyError';

  constructor() {
    super('no elements in sequence');
  }
}
