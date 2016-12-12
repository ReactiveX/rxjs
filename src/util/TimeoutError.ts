/**
 * An error thrown when duetime elapses.
 *
 * @see {@link timeout}
 *
 * @class TimeoutError
 */
export class TimeoutError extends Error {
  constructor() {
    const err: any = super('Timeout has occurred');
    (this as any).__proto__ = TimeoutError.prototype;

    (<any> this).name = err.name = 'TimeoutError';
    (<any> this).stack = err.stack;
    (<any> this).message = err.message;
  }
}
