const symbol = Symbol('unsubscription error (RxJS)');
/**
 * Creates an error thrown when one or more errors have occurred during the
 * `unsubscribe` of a {@link Subscription}.
 *
 * Can be tested for with {@link isUnsubscriptionError}
 *
 */
export function createUnsubscriptionError(errors: Error[]): Error {
  const errorList = errors
    .map((err, i) => `  ${i + 1}) Error: ${err && err.message ? err.message : err}`)
    .join('\n');
  const message = `${errors.length} errors occurred during unsubscription:
${errorList}`;

  const error = new Error(message);
  error[symbol] = true;
  (<any>error).errors = errors;
  return error;
}

/**
 * Tests to see if an Error is an RxJS Unsubscription error.
 * @param err any error object to test
 */
export function isUnsubscriptionError(err: Error): boolean {
  return err && err[symbol];
}
