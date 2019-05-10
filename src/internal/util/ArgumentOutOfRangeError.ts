import { createRxError, RxErrorCode } from 'rxjs/internal/util/errors';

export interface ArgumentOutOfRangeError extends Error {
}

export interface ArgumentOutOfRangeErrorCtor {
  new(): ArgumentOutOfRangeError;
}

function ArgumentOutOfRangeErrorImpl(this: any) {
  Error.call(this);
  this.message = 'out of range';
  this.name = 'ArgumentOutOfRangeError';
  return this;
}

ArgumentOutOfRangeErrorImpl.prototype = Object.create(Error.prototype);

/**
 * An error thrown when an element was queried at a certain index of an
 * Observable, but no such index or position exists in that sequence.
 *
 * NOT INTENDED TO BE CREATED BY CONSUMING CODE.
 *
 * @see {@link elementAt}
 * @see {@link take}
 * @see {@link takeLast}
 *
 * @class ArgumentOutOfRangeError
 *
 * @deprecated (gone in v8) for `instanceof` checks, instead use {@link isOutOfRangeError}
 */
export const ArgumentOutOfRangeError: ArgumentOutOfRangeErrorCtor = ArgumentOutOfRangeErrorImpl as any;

export function createOutOfRangeError() {
  return createRxError('out of range', RxErrorCode.OutOfRange, ArgumentOutOfRangeError);
}
