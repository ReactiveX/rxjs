/** @prettier */
import { createErrorClass } from './createErrorClass';

export interface NotFoundError extends Error {}

export interface NotFoundErrorCtor {
  new (message: string): NotFoundError;
}

/**
 * An error thrown when a value or values are missing from an
 * observable sequence.
 *
 * @see {@link operators/single}
 *
 * @class NotFoundError
 */
export const NotFoundError: NotFoundErrorCtor = createErrorClass('NotFoundError', function (message: string) {
  this.message = message;
});
