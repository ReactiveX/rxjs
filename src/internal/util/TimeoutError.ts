import { TimeoutInfo } from "../operators/timeoutWith";

/** @prettier */
export interface TimeoutError extends Error {
  /**
   * The information provided to the error by the timeout
   * operation that created the error. Will be `null` if
   * used directly in non-RxJS code with an empty constructor. 
   * (Note that using this constructor directly is not recommended, you should
   * create your own errors)
   */
  info: TimeoutInfo<any> | null;
}

export interface TimeoutErrorCtor {
  new (info?: TimeoutInfo<any>): TimeoutError;
}

const TimeoutErrorImpl = (() => {
  function TimeoutErrorImpl(this: any, info: TimeoutInfo<any>|null = null) {
    Error.call(this);
    this.message = 'Timeout has occurred';
    this.name = 'TimeoutError';
    this.info = info;
    return this;
  }

  TimeoutErrorImpl.prototype = Object.create(Error.prototype);

  return TimeoutErrorImpl;
})();

/**
 * An error thrown by the {@link operators/timeout} operator.
 * 
 * Provided so users can use as a type and do quality comparisons.
 * We recommend you do not subclass this or create instances of this class directly. 
 * If you have need of a error representing a timeout, you should
 * create your own error class and use that.
 *
 * @see {@link operators/timeout}
 *
 * @class TimeoutError
 */
export const TimeoutError: TimeoutErrorCtor = TimeoutErrorImpl as any;
