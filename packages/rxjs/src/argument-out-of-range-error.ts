import '@rxjs/observable-polyfill';

/**
 * An error thrown when an Observable sequence has no value at the requested
 * index.
 */
export class ArgumentOutOfRangeError extends Error {
  constructor() {
    super('argument out of range');
    this.name = 'ArgumentOutOfRangeError';
  }
}
