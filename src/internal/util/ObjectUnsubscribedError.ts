/**
 * An error thrown when an action is invalid because the object has been
 * unsubscribed.
 *
 * @see {@link Subject}
 * @see {@link BehaviorSubject}
 */
export class ObjectUnsubscribedError extends Error {
  name = 'ObjectUnsubscribedError';

  constructor() {
    super('object unsubscribed');
  }
}
