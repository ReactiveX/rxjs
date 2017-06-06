const message = 'argument out of range (RxJS)';

const symbol = Symbol(message);
/**
 * Creates an error thrown when an element was queried at a certain index of an
 * Observable, but no such index or position exists in that sequence.
 *
 * Can be tested for with {@link isArgumentOutOfRangeError}
 * @see {@link elementAt}
 * @see {@link take}
 * @see {@link takeLast}
 */
export function createArgumentOutOfRangeError(): Error {
  const error = new Error(message);
  error[symbol] = true;
  return error;
}

/**
 * Tests to see if an Error is an RxJS ArgumentOutOfRange error.
 * @param err any error object to test
 */
export function isArgumentOutOfRangeError(err: Error): boolean {
  return err && err[symbol];
}
