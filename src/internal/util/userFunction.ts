const ERROR_OBJECT = {
  error: null as any,
};

/**
 * Executes a user-provided function within a try-catch, and returns either the result
 * or returns {@link ERROR_OBJECT} if an error has occurred. Use {@link resultIsError} to
 * verify whether the result is an error or not.
 *
 * @param fn the user-provided function to wrap in some error handling for safety
 * @param args The arguments to execute the user-provided function with.
 */
export function tryUserFunction<R>(fn: (...args: any[]) => R, ...args: any[]): typeof ERROR_OBJECT | R {
  ERROR_OBJECT.error = null;
  let result: R;
  try {
    result = fn(...args);
  } catch (err) {
    ERROR_OBJECT.error = err;
    return ERROR_OBJECT;
  }
  return result;
}

/**
 * Used to verify whether the result of {@link tryUserFunction} is an error or not. If
 * this returns true, check {@link ERROR_OBJECT}'s error property for the error value.
 */
export function resultIsError<R>(result: R|typeof ERROR_OBJECT): result is typeof ERROR_OBJECT {
  return result === ERROR_OBJECT;
}
