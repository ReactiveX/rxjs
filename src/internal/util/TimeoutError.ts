export interface TimeoutError extends Error {
}

export interface TimeoutErrorCtor {
  new(): TimeoutError;
}

function TimeoutErrorImpl(this: any) {
  Error.call(this);
  this.message = 'Timeout has occurred';
  this.name = 'TimeoutError';
  return this;
}

TimeoutErrorImpl.prototype = Object.create(Error.prototype);

/**
 * An error thrown when duetime elapses.
 *
 * NOT INTENDED TO BE CREATED BY CONSUMING CODE.
 *
 * @see {@link operators/timeout}
 *
 * @class TimeoutError
 *
 * @deprecated (gone in v8) for `instanceof` checks, instead use {@link isTimeoutError}
 */
export const TimeoutError: TimeoutErrorCtor = TimeoutErrorImpl as any;
