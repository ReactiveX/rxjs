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
export interface EmptyError extends Error {}
export interface EmptyErrorConstructor {
    new(): EmptyError;
    readonly prototype: EmptyError;
}

function EmptyErrorCtor(this: EmptyError): EmptyError {
  const err = Error.call(this, 'no elements in sequence');
  this.name = 'EmptyError';
  this.stack = err.stack;
  this.message = err.message;
  return this;
}
EmptyErrorCtor.prototype = Object.create(Error.prototype, {
  constructor: {
    value: EmptyErrorCtor,
    enumerable: false,
    writable: true,
    configurable: true
  }
});

export const EmptyError = EmptyErrorCtor as any as EmptyErrorConstructor;