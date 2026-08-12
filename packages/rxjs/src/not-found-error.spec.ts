import { describe, expect, expectTypeOf, it } from 'vitest';
import { NotFoundError } from './not-found-error.js';

describe('NotFoundError', () => {
  it('preserves the RxJS 7 name, supplied message, stack, and Error prototype chain', () => {
    const error = new NotFoundError('No matching values');

    expectTypeOf(error).toEqualTypeOf<NotFoundError>();
    expect(error.name).toBe('NotFoundError');
    expect(error.message).toBe('No matching values');
    expect(error.stack).toEqual(expect.any(String));
    expect(error).toBeInstanceOf(NotFoundError);
    expect(error).toBeInstanceOf(Error);
    expect(Object.getPrototypeOf(error)).toBe(NotFoundError.prototype);
    expect(Object.getPrototypeOf(NotFoundError.prototype)).toBe(Error.prototype);
    expect(NotFoundError.prototype.constructor).toBe(NotFoundError);
  });
});
