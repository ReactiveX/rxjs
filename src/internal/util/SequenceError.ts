export interface SequenceError extends Error {
}

export interface SequenceErrorCtor {
  new(message: string): SequenceError;
}

const SequenceErrorImpl = (() => {
  function SequenceErrorImpl(this: Error, message: string) {
    Error.call(this);
    this.message = message;
    this.name = 'SequenceError';
    return this;
  }

  SequenceErrorImpl.prototype = Object.create(Error.prototype);

  return SequenceErrorImpl;
})();

/**
 * An error thrown when something is wrong with the sequence of
 * values arriving on the observable.
 *
 * @see {@link operators/single}
 *
 * @class SequenceError
 */
export const SequenceError: SequenceErrorCtor = SequenceErrorImpl as any;
