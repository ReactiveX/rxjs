let _enable_super_gross_mode_that_will_cause_bad_things = false;

/**
 * The global configuration object for RxJS, used to configure things
 * like what Promise contructor should used to create Promises
 */
export const config = {
  /**
   * The promise constructor used by default for methods such as
   * {@link toPromise} and {@link forEach}
   *
   * @deprecated remove in v8. RxJS will no longer support this sort of injection of a
   * Promise constructor. If you need a Promise implementation other than native promises,
   * please polyfill/patch Promises as you see appropriate.
   */
  Promise: undefined! as PromiseConstructorLike,

  /**
   * If true, turns on synchronous error rethrowing, which is a deprecated behavior
   * in v6 and higher. This behavior enables bad patterns like wrapping a subscribe
   * call in a try/catch block. It also enables producer interference, a nasty bug
   * where a multicast can be broken for all observers by a downstream consumer with
   * an unhandled error. DO NOT USE THIS FLAG UNLESS IT'S NEEDED TO BY TIME
   * FOR MIGRATION REASONS.
   *
   * @deprecated remove in v8. As of version 8, RxJS will no longer support synchronous throwing
   * of unhandled errors. All errors will be thrown on a separate call stack to prevent bad
   * behaviors described above.
   */
  set useDeprecatedSynchronousErrorHandling(value: boolean) {
    if (value) {
      const error = new Error();
      console.warn('DEPRECATED! RxJS was set to use deprecated synchronous error handling behavior by code at: \n' + error.stack);
    } else if (_enable_super_gross_mode_that_will_cause_bad_things) {
      console.log('RxJS: Back to a better error behavior. Thank you. <3');
    }
    _enable_super_gross_mode_that_will_cause_bad_things = value;
  },

  /**
   * @deprecated remove in v8. As of version 8, RxJS will no longer support synchronous throwing
   * of unhandled errors. All errors will be thrown on a separate call stack to prevent bad
   * behaviors described above.
   */
  get useDeprecatedSynchronousErrorHandling() {
    return _enable_super_gross_mode_that_will_cause_bad_things;
  },
};
