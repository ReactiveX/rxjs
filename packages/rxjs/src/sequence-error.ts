import '@rxjs/observable-polyfill';

/**
 * An error thrown when an Observable sequence contains an invalid number of values.
 */
export class SequenceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SequenceError';
  }
}
