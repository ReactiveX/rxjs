import { createRxError, RxErrorCode } from 'rxjs/internal/util/errors';

export interface ObjectUnsubscribedError extends Error {
}

export interface ObjectUnsubscribedErrorCtor {
  new(): ObjectUnsubscribedError;
}

function ObjectUnsubscribedErrorImpl(this: any) {
  Error.call(this);
  this.message = 'object unsubscribed';
  this.name = 'ObjectUnsubscribedError';
  return this;
}

ObjectUnsubscribedErrorImpl.prototype = Object.create(Error.prototype);

/**
 * An error thrown when an action is invalid because the object has been
 * unsubscribed.
 *
 * NOT INTENDED TO BE CREATED BY CONSUMING CODE.
 *
 * @see {@link Subject}
 * @see {@link BehaviorSubject}
 *
 * @class ObjectUnsubscribedError
 *
 * @deprecated (gone in v8) for `instanceof` checks, instead use {@link isOutOfRangeError}
 */
export const ObjectUnsubscribedError: ObjectUnsubscribedErrorCtor = ObjectUnsubscribedErrorImpl as any;

export function createObjectUnsubscribedError() {
  return createRxError('object unsubscribed', RxErrorCode.ObjectUnsubscribedError, ObjectUnsubscribedError);
}
