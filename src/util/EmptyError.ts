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
export class EmptyError extends Error {
  constructor() {
    const message = 'no elements in sequence';
    super(message);

    Object.defineProperty(this, 'name', {
      enumerable: false,
      writable: false,
      value: 'EmptyError'
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
  (<any>Object).setPrototypeOf(EmptyError.prototype, Error.prototype);
} else {
  EmptyError.prototype = Object.create(Error.prototype);
}
