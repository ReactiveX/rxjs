/**
 * An error thrown when an element was queried at a certain index of an
 * Observable, but no such index or position exists in that sequence.
 *
 * @see {@link elementAt}
 * @see {@link take}
 * @see {@link takeLast}
 *
 * @class ArgumentOutOfRangeError
 */
export class ArgumentOutOfRangeError extends Error {
  private err: Error;

  constructor() {
    const err: any = super('argument out of range');
    this.err = err;
    (<any> this).name = err.name = 'ArgumentOutOfRangeError';
    (<any> this).message = err.message;
  }

  get stack() {
    return this.err.stack;
  }
}
