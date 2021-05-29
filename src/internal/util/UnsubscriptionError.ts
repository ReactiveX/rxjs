import { createErrorClass } from './createErrorClass';

export interface UnsubscriptionError extends Error {
  readonly errors: any[];
}

export interface UnsubscriptionErrorCtor {
  /**
   * @deprecated Internal implementation detail. Do not construct error instances.
   * Cannot be tagged as internal: https://github.com/ReactiveX/rxjs/issues/6269
   */
  new (errors: any[]): UnsubscriptionError;
}

/**
 * An error thrown when one or more errors have occurred during the
 * {@link unsubscribe} call of a {@link Subscription}.
 *
 * When {@link unsubscribe} is called, RxJS will attempt to execute all teardowns,
 * even if one of them errors. Errors that occur during unsubscription will be
 * collected and rethrown at the end as an `UnsubscriptionError`. This
 * error has an `errors` property on it that contains an `Array` of all
 * errors thrown during teardown.
 *
 * Note: This error can also be thrown during error or completion of an observable.
 * In those cases, there is no particular way to handle the errors, and it will
 * be reported to global error handling (e.g. `window.onerror` or `process.on('error', fn)`)
 */
export const UnsubscriptionError: UnsubscriptionErrorCtor = createErrorClass(
  (_super) =>
    function UnsubscriptionErrorImpl(this: any, errors: (Error | string)[]) {
      _super(this);
      this.message = errors
        ? `${errors.length} errors occurred during unsubscription:
${errors.map((err, i) => `${i + 1}) ${err.toString()}`).join('\n  ')}`
        : '';
      this.name = 'UnsubscriptionError';
      this.errors = errors;
    }
);
