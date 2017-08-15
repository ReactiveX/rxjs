/**
 * An error thrown when duetime elapses.
 *
 * @see {@link timeout}
 *
 * @class TimeoutError
 */
export class TimeoutError extends Error {
  private err: Error;

  constructor() {
    const err: any = super('Timeout has occurred');
    this.err = err;
    (<any> this).name = err.name = 'TimeoutError';
    (<any> this).message = err.message;
  }

  get stack() {
    return this.err.stack;
  }
}
