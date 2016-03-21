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
    super('object unsubscribed');
    this.name = 'ObjectUnsubscribedError';
  }
}