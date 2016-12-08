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
  constructor() {
    const err: any = super('argument out of range');
    (this as any).__proto__ = ArgumentOutOfRangeError.prototype;

    (<any> this).name = err.name = 'ArgumentOutOfRangeError';
    (<any> this).stack = err.stack;
    (<any> this).message = err.message;
  }
}
