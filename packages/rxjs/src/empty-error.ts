import '@rxjs/observable-polyfill';

/**
 * An error thrown when an Observable sequence has no elements.
 */
export class EmptyError extends Error {
  constructor() {
    super('no elements in sequence');
    this.name = 'EmptyError';
  }
}
