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

  public readonly name = 'ArgumentOutOfRangeError';

  constructor() {
    super('argument out of range');
    (Object as any).setPrototypeOf(this, ArgumentOutOfRangeError.prototype);
  }
}
