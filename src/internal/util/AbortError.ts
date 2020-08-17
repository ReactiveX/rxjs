export interface AbortError extends Error {
}

export interface AbortErrorCtor {
  new(): AbortError;
}

const AbortErrorImpl = (() => {
  function AbortErrorImpl(this: Error) {
    Error.call(this);
    this.message = 'Abort exception';
    this.name = 'AbortError';
    return this;
  }

  AbortErrorImpl.prototype = Object.create(Error.prototype);

  return AbortErrorImpl;
})();

/**
 * An error thrown when an Observable or a sequence was queried but has no
 * elements.
 *
 * @see {@link first}
 * @see {@link last}
 * @see {@link single}
 *
 * @class AbortError
 */
export const AbortError: AbortErrorCtor = AbortErrorImpl as any;