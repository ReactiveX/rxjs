export interface EmptyError extends Error {
}

export interface EmptyErrorCtor {
  new(): EmptyError;
}

function EmptyErrorImpl(this: any) {
  Error.call(this);
  this.message = 'no elements in sequence';
  this.name = 'EmptyError';
  return this;
}

EmptyErrorImpl.prototype = Object.create(Error.prototype);

/**
 * An error thrown when an Observable or a sequence was queried but has no
 * elements.
 *
 * NOT INTENDED TO BE CREATED BY CONSUMING CODE.
 *
 * @see {@link first}
 * @see {@link last}
 * @see {@link single}
 *
 * @class EmptyError
 *
 * @deprecated (gone in v8) for `instanceof` checks, instead use {@link isEmptyError}
 */
export const EmptyError: EmptyErrorCtor = EmptyErrorImpl as any;
