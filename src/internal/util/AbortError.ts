import { createErrorClass } from './createErrorClass';

export interface AbortError extends Error {}

export interface AbortErrorCtor {
  /**
   * @deprecated Internal implementation detail. Do not construct error instances.
   * Cannot be tagged as internal: https://github.com/ReactiveX/rxjs/issues/6269
   */
  new (): AbortError;
}

/**
 * An error thrown when an abort signal is received and causes a promise to reject.
 *
 * @see {@link firstValueFrom}
 * @see {@link lastValueFrom}
 *
 * @class AbortError
 */
export const AbortError: AbortErrorCtor = createErrorClass(
  (_super) =>
    function AbortErrorImpl(this: any) {
      _super(this);
      this.name = 'AbortError';
      this.message = 'Aborted by AbortSignal';
    }
);
