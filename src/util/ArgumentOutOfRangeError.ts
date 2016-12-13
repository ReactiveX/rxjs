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
    const message = 'argument out of range';
    super(message);

    Object.defineProperty(this, 'name', {
      enumerable: false,
      writable: false,
      value: 'ArgumentOutOfRangeError'
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
  (<any>Object).setPrototypeOf(ArgumentOutOfRangeError.prototype, Error.prototype);
} else {
  ArgumentOutOfRangeError.prototype = Object.create(Error.prototype);
}