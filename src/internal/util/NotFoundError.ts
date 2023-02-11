/**
 * An error thrown when a value or values are missing from an
 * observable sequence.
 *
 * @see {@link single}
 */

export class NotFoundError extends Error {
  name = 'NotFoundError';

  constructor(message: string) {
    super(message);
  }
}
