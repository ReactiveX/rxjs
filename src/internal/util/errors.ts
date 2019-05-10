
export const enum RxErrorCode {
  Empty = 0,
  OutOfRangeError = 1,
  ObjectUnsubscribedError = 2,
  TimeoutError = 3,
  TeardownError = 4,
}

export function createRxError(message: string, code: RxErrorCode, ErrorType: any = Error) {
  const result = new ErrorType('RxJS: ' + message);
  (result as any).__rxjsErrorCode = code;
  return result;
}

/**
 * Tests to see if the error passed is an error that was created by RxJS internals.
 */
export function isRxError(err: any) {
  return '__rxjsErrorCode' in err;
}

/**
 * Checks to see if the value passed is an error thrown by RxJS when an Observable
 * sequence was empty.
 */
export function isEmptyError(err: any) {
  return err.__rxjsErrorCode === RxErrorCode.Empty;
}

/**
 * Checks to see if the value passed is an error thrown by RxJS when an argument
 * was out of range.
 */
export function isOutOfRangeError(err: any) {
  return err.__rxjsErrorCode === RxErrorCode.OutOfRangeError;
}

/**
 * Checks to see if the value passed is an error thrown by RxJS when a Subject
 * was unsubscribed, and an action was taken on it.
 */
export function isObjectUnsubscribedError(err: any) {
  return err.__rxjsErrorCode === RxErrorCode.ObjectUnsubscribedError;
}

/**
 * Checks to see if the value passed is an error thrown by RxJS when an observable
 * times out, for example with the {@link timeout} operator.
 */
export function isTimeoutError(err: any) {
  return err.__rxjsErrorCode === RxErrorCode.TimeoutError;
}

/**
 * Checks to see if the value passed is an error that was thrown while executing
 * teardown during either completion, error handling or unsubscription of the observable
 * chain.
 */
export function isTeardownError(err: any) {
  return err.__rxjsErrorCode === RxErrorCode.TeardownError;
}
