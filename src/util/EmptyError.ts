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
  private err: Error;

  constructor() {
    const err: any = super('no elements in sequence');
    this.err = err;
    (<any> this).name = err.name = 'EmptyError';
    (<any> this).message = err.message;
  }

  get stack() {
    return this.err.stack;
  }
}
