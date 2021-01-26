import { createErrorClass } from './createErrorClass';

export interface ArgumentOutOfRangeError extends Error {}

export interface ArgumentOutOfRangeErrorCtor {
  new (): ArgumentOutOfRangeError;
}

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
export const ArgumentOutOfRangeError: ArgumentOutOfRangeErrorCtor = createErrorClass(
  (_super) =>
    function ArgumentOutOfRangeErrorImpl(this: any) {
      _super(this);
      this.name = 'ArgumentOutOfRangeError';
      this.message = 'argument out of range';
    }
);
