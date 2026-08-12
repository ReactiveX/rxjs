import '@rxjs/observable-polyfill';

/**
 * An error thrown when an expected value is missing from an Observable sequence.
 */
export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}
