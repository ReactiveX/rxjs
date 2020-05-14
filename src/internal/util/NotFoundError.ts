export interface NotFoundError extends Error {
}

export interface NotFoundErrorCtor {
  new(message: string): NotFoundError;
}

const NotFoundErrorImpl = (() => {
  function NotFoundErrorImpl(this: Error, message: string) {
    Error.call(this);
    this.message = message;
    this.name = 'NotFoundError';
    return this;
  }

  NotFoundErrorImpl.prototype = Object.create(Error.prototype);

  return NotFoundErrorImpl;
})();

/**
 * An error thrown when a value or values are missing from an
 * observable sequence.
 *
 * @see {@link operators/single}
 *
 * @class NotFoundError
 */
export const NotFoundError: NotFoundErrorCtor = NotFoundErrorImpl as any;
