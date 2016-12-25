/**
 * An error thrown when duetime elapses.
 *
 * @see {@link timeout}
 */
export interface TimeoutError extends Error {}
export interface TimeoutErrorConstructor {
    new(): TimeoutError;
    readonly prototype: TimeoutError;
}

function TimeoutErrorCtor(this: TimeoutError): TimeoutError {
  const err = Error.call(this, 'Timeout has occurred');
  this.name = 'TimeoutError';
  this.stack = err.stack;
  this.message = err.message;
  return this;
}
TimeoutErrorCtor.prototype = Object.create(Error.prototype, {
  constructor: {
    value: TimeoutErrorCtor,
    enumerable: false,
    writable: true,
    configurable: true
  }
});

export const TimeoutError = TimeoutErrorCtor as any as TimeoutErrorConstructor;