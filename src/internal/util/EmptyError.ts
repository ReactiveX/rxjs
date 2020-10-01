import { createErrorClass } from './createErrorClass';

export interface EmptyError extends Error {
}

export interface EmptyErrorCtor {
  new(): EmptyError;
}

/**
 * An error thrown when an Observable or a sequence was queried but has no
 * elements.
 *
 * @see {@link first}
 * @see {@link last}
 * @see {@link single}
 *
 * @class EmptyError
 */
export const EmptyError: EmptyErrorCtor = createErrorClass((_super) => function EmptyErrorImpl(this: any) {
  _super(this);
  this.name = 'EmptyError';
  this.message = 'no elements in sequence';
});