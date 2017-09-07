/**
 * An error thrown when an action is invalid because the object has been
 * unsubscribed.
 *
 * @see {@link Subject}
 * @see {@link BehaviorSubject}
 *
 * @class ObjectUnsubscribedError
 */
export interface ObjectUnsubscribedError extends Error {}
export interface ObjectUnsubscribedErrorConstructor {
    new(): ObjectUnsubscribedError;
    readonly prototype: ObjectUnsubscribedError;
}

function ObjectUnsubscribedErrorCtor(this: ObjectUnsubscribedError): ObjectUnsubscribedError {
  const err = Error.call(this, 'object unsubscribed');
  this.name = 'ObjectUnsubscribedError';
  this.stack = err.stack;
  this.message = err.message;
  return this;
}
ObjectUnsubscribedErrorCtor.prototype = Object.create(Error.prototype, {
  constructor: {
    value: ObjectUnsubscribedErrorCtor,
    enumerable: false,
    writable: true,
    configurable: true
  }
});

export const ObjectUnsubscribedError = ObjectUnsubscribedErrorCtor as any as ObjectUnsubscribedErrorConstructor;