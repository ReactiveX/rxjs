const message = 'timeout (RxJS)';

const symbol = Symbol(message);
/**
 * Creates an error thrown when duetime elapses.
 *
 * Can be tested for with {@link isTimeoutError}
 *
 * @see {@link timeout}
 *
 */
export function createTimeoutError(): Error {
  const error = new Error(message);
  error[symbol] = true;
  return error;
}

/**
 * Tests to see if an Error is an RxJS Timeout error.
 * @param err any error object to test
 */
export function isTimeoutError(err: Error): boolean {
  return err && err[symbol];
}
