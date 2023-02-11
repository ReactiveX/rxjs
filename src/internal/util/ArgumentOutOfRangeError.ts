/**
 * An error thrown when an element was queried at a certain index of an
 * Observable, but no such index or position exists in that sequence.
 *
 * @see {@link elementAt}
 * @see {@link take}
 * @see {@link takeLast}
 */
export class ArgumentOutOfRangeError extends Error {
  name = 'ArgumentOutOfRangeError';

  constructor() {
    super('argument out of range');
  }
}
