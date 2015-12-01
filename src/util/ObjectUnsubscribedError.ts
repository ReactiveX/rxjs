/**
 * an error thrown when an action is invalid because the object
 * has been unsubscribed
 */
export class ObjectUnsubscribedError extends Error {
  constructor() {
    super('object unsubscribed');
    this.name = 'ObjectUnsubscribedError';
  }
}