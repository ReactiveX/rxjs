/**
 * An error thrown when an Observable or a sequence was queried but has no
 * elements.
 *
 * @see {@link first}
 * @see {@link last}
 * @see {@link single}
 *
 * @class EmptyError
 */
export class EmptyError extends Error {

  public readonly name = 'EmptyError';

  constructor() {
    super('no elements in sequence');
    (Object as any).setPrototypeOf(this, EmptyError.prototype);
  }
}
