/**
 * An error thrown when duetime elapses.
 *
 * @see {@link timeout}
 *
 * @class TimeoutError
 */
export class TimeoutError extends Error {
  constructor() {
    super('Timeout has occurred');

    (<any>Object).setPrototypeOf(this, TimeoutError.prototype);
  }
}
