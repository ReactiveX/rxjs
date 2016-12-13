/**
 * An error thrown when duetime elapses.
 *
 * @see {@link timeout}
 *
 * @class TimeoutError
 */
export class TimeoutError extends Error {
  constructor() {
    const message = 'Timeout has occurred';
    super(message);

    Object.defineProperty(this, 'name', {
      enumerable: false,
      writable: false,
      value: 'TimeoutError'
    });

    Object.defineProperty(this, 'message', {
      enumerable: false,
      writable: true,
      value: message
    });

    Object.defineProperty(this, 'stack', {
      enumerable: false,
      writable: false,
      value: (new Error(message)).stack
    });
  }
}

if (typeof (<any>Object).setPrototypeOf === 'function') {
  (<any>Object).setPrototypeOf(TimeoutError.prototype, Error.prototype);
} else {
  TimeoutError.prototype = Object.create(Error.prototype);
}
