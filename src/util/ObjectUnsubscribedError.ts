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
  private err: Error;

  constructor() {
    const err: any = super('object unsubscribed');
    this.err = err;
    (<any> this).name = err.name = 'ObjectUnsubscribedError';
    (<any> this).message = err.message;
  }

  get stack() {
    return this.err.stack;
  }
}
