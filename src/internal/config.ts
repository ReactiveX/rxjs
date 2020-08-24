/** @prettier */
let _enable_super_gross_mode_that_will_cause_bad_things = false;
let _enable_deoptimized_subscriber_creation = false;

/**
 * The global configuration object for RxJS, used to configure things
 * like what Promise contructor should used to create Promises
 */
export const config = {
  /**
   * If true, console logs for deprecation warnings will not be emitted.
   * @deprecated this will be removed in v8 when all deprecated settings are removed.
   */
  quietBadConfig: false,

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
    if (!this.quietBadConfig) {
      if (value) {
        const error = new Error();
        console.warn('DEPRECATED! RxJS was set to use deprecated synchronous error handling behavior by code at: \n' + error.stack);
      } else if (_enable_super_gross_mode_that_will_cause_bad_things) {
        console.log('RxJS: Back to a better error behavior. Thank you. <3');
      }
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

  /**
   * If true, enables an as-of-yet undocumented feature from v5: The ability to access
   * `unsubscribe()` via `this` context in `next` functions created in observers passed
   * to `subscribe`.
   *
   * This is being removed because the performance was severely problematic, and it could also cause
   * issues when types other than POJOs are passed to subscribe as subscribers, as they will likely have
   * their `this` context overwritten.
   *
   * @deprecated remove in v8. As of version 8, RxJS will no longer support altering the
   * context of next functions provided as part of an observer to Subscribe. Instead,
   * you will have access to a subscription or a signal or token that will allow you to do things like
   * unsubscribe and test closed status.
   */
  set useDeprecatedNextContext(value: boolean) {
    if (!this.quietBadConfig) {
      if (value) {
        const error = new Error();
        console.warn(
          'DEPRECATED! RxJS was set to use deprecated next context. This will result in deoptimizations when creating any new subscription. \n' +
            error.stack
        );
      } else if (_enable_deoptimized_subscriber_creation) {
        console.log('RxJS: back to more optimized subscription creation. Thank you. <3');
      }
    }
    _enable_deoptimized_subscriber_creation = value;
  },

  /**
   * @deprecated remove in v8. As of version 8, RxJS will no longer support altering the
   * context of next functions provided as part of an observer to Subscribe. Instead,
   * you will have access to a subscription or a signal or token that will allow you to do things like
   * unsubscribe and test closed status.
   */
  get useDeprecatedNextContext(): boolean {
    return _enable_deoptimized_subscriber_creation;
  },
};
