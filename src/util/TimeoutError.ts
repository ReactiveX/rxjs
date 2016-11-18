/**
 * An error thrown when duetime elapses.
 *
 * @see {@link timeout}
 *
 * @class TimeoutError
 */
export class TimeoutError extends Error {
  constructor(message?: any) {
    const err: any = super(message || 'Timeout has occurred');
    (<any> this).name = err.name = 'TimeoutError';
    (<any> this).stack = err.stack;
    (<any> this).message = err.message;
  }
}
