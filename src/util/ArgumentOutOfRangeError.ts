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
export interface ArgumentOutOfRangeError extends Error {}
export interface ArgumentOutOfRangeErrorConstructor {
    new(): ArgumentOutOfRangeError;
    readonly prototype: ArgumentOutOfRangeError;
}

function ArgumentOutOfRangeErrorCtor(this: ArgumentOutOfRangeError): ArgumentOutOfRangeError {
  const err = Error.call(this, 'argument out of range');
  this.name = 'ArgumentOutOfRangeError';
  this.stack = err.stack;
  this.message = err.message;
  return this;
}
ArgumentOutOfRangeErrorCtor.prototype = Object.create(Error.prototype, {
  constructor: {
    value: ArgumentOutOfRangeErrorCtor,
    enumerable: false,
    writable: true,
    configurable: true
  }
});

export const ArgumentOutOfRangeError = ArgumentOutOfRangeErrorCtor as any as ArgumentOutOfRangeErrorConstructor;