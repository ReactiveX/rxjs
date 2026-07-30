import { describe, expect, expectTypeOf, it } from 'vitest';
import { EmptyError } from './empty-error.js';

describe('EmptyError', () => {
  it('preserves the RxJS 7 name, message, stack, and Error prototype chain', () => {
    const error = new EmptyError();

    expectTypeOf(error).toEqualTypeOf<EmptyError>();
    expect(error.name).toBe('EmptyError');
    expect(error.message).toBe('no elements in sequence');
    expect(error.stack).toEqual(expect.any(String));
    expect(error).toBeInstanceOf(EmptyError);
    expect(error).toBeInstanceOf(Error);
    expect(Object.getPrototypeOf(error)).toBe(EmptyError.prototype);
    expect(Object.getPrototypeOf(EmptyError.prototype)).toBe(Error.prototype);
    expect(EmptyError.prototype.constructor).toBe(EmptyError);
  });
});
