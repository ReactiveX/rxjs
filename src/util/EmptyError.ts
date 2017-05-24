const message = 'sequence empty (RxJS)';

const symbol = Symbol(message);
/**
 * Creates an error thrown when an Observable or a sequence was queried but has no
 * elements.
 *
 * Can be tested for with {@link isEmptyError}
 * @see {@link first}
 * @see {@link last}
 * @see {@link single}
 */
export function createEmptyError(): Error {
  const error = new Error(message);
  error[symbol] = true;
  return error;
}

/**
 * Tests to see if an Error is an RxJS Empty error.
 * @param err any error object to test
 */
export function isEmptyError(err: Error): boolean {
  return err && err[symbol];
}
