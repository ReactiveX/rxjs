/**
 * An error thrown when an action is invalid because the object has been
 * unsubscribed.
 *
 * @see {@link Subject}
 * @see {@link BehaviorSubject}
 *
 * @class ObjectUnsubscribedError
 */
export class ObjectUnsubscribedError extends Error {
  constructor() {
    const message = 'object unsubscribed';
    super(message);

    Object.defineProperty(this, 'name', {
      enumerable: false,
      writable: false,
      value: 'ObjectUnsubscribedError'
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
  (<any>Object).setPrototypeOf(ObjectUnsubscribedError.prototype, Error.prototype);
} else {
  ObjectUnsubscribedError.prototype = Object.create(Error.prototype);
}