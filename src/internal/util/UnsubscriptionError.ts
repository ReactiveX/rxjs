import { RxErrorCode } from 'rxjs/internal/util/errors';

export interface UnsubscriptionError extends Error {
  readonly errors: any[];
}

export interface UnsubscriptionErrorCtor {
  new(errors: any[]): UnsubscriptionError;
}

function UnsubscriptionErrorImpl(this: any, errors: any[]) {
  Error.call(this);
  this.message = errors ?
  `${errors.length} errors occurred during unsubscription:
${errors.map((err, i) => `${i + 1}) ${err.toString()}`).join('\n  ')}` : '';
  this.name = 'UnsubscriptionError';
  this.errors = errors;
  return this;
}

UnsubscriptionErrorImpl.prototype = Object.create(Error.prototype);

/**
 * An error thrown when one or more errors have occurred during the
 * `unsubscribe` of a {@link Subscription}.
 *
 * NOT INTENDED TO BE CREATED BY CONSUMING CODE.
 *
 * @class UnsubscriptionError
 *
 * @deprecated (gone in v8) for `instanceof` checks, instead use {@link isTeardownError}
 */
export const UnsubscriptionError: UnsubscriptionErrorCtor = UnsubscriptionErrorImpl as any;

export function createTeardownError(errors: any[]) {
  const error: any = new UnsubscriptionError(errors);
  error.__rxjsErrorCode = RxErrorCode.Teardown;
  return error;
}
