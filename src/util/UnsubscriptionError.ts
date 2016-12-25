/**
 * An error thrown when one or more errors have occurred during the
 * `unsubscribe` of a {@link Subscription}.
 */
export interface UnsubscriptionError extends Error {
  errors: any[];
}
export interface UnsubscriptionErrorConstructor {
    new(errors: any[]): UnsubscriptionError;
    readonly prototype: UnsubscriptionError;
}

function UnsubscriptionErrorCtor(this: UnsubscriptionError, errors: any[]): UnsubscriptionError {
  const msg = !!errors ?
    `${errors.length} errors occurred during unsubscription:
  ${errors.map((err, i) => `${i + 1}) ${err.toString()}`).join('\n  ')}` : '';
  const err: Error = Error.call(this, msg);

  this.name = 'UnsubscriptionError';
  this.stack = err.stack;
  this.message = err.message;
  this.errors = errors;
  return this;
}
UnsubscriptionErrorCtor.prototype = Object.create(Error.prototype, {
  constructor: {
    value: UnsubscriptionErrorCtor,
    enumerable: false,
    writable: true,
    configurable: true
  }
});

export const UnsubscriptionError = UnsubscriptionErrorCtor as any as UnsubscriptionErrorConstructor;
