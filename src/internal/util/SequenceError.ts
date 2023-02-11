/**
 * An error thrown when something is wrong with the sequence of
 * values arriving on the observable.
 *
 * @see {@link single}
 *
 * @class SequenceError
 */
export class SequenceError extends Error {
  name = 'SequenceError';

  constructor(message: string) {
    super(message);
  }
}
