/** @prettier */
import { createErrorClass } from './createErrorClass';

export interface ObjectUnsubscribedError extends Error {}

export interface ObjectUnsubscribedErrorCtor {
  new (): ObjectUnsubscribedError;
}

/**
 * An error thrown when an action is invalid because the object has been
 * unsubscribed.
 *
 * @see {@link Subject}
 * @see {@link BehaviorSubject}
 *
 * @class ObjectUnsubscribedError
 */
export const ObjectUnsubscribedError: ObjectUnsubscribedErrorCtor = createErrorClass(
  (_super) =>
    function ObjectUnsubscribedError(this: any) {
      _super(this);
      this.message = 'object unsubscribed';
    }
);
