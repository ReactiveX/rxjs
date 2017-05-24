const message = 'object unsubscribed (RxJS)';

const symbol = Symbol(message);
/**
 * Creates an error thrown when an action is invalid because the object has been
 * unsubscribed.
 *
 * @see {@link Subject}
 * @see {@link BehaviorSubject}
 */
export function createObjectUnsubscribedError(): Error {
  const error = new Error(message);
  error[symbol] = true;
  return error;
}

/**
 * Tests to see if an Error is an RxJS ObjectUnsubscribed error.
 * @param err any error object to test
 */
export function isObjectUnsubscribedError(err: Error): boolean {
  return err && err[symbol];
}
