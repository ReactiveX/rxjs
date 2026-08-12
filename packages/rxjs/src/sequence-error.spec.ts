import { describe, expect, expectTypeOf, it } from 'vitest';
import { SequenceError } from './sequence-error.js';

describe('SequenceError', () => {
  it('preserves the RxJS 7 name, supplied message, stack, and Error prototype chain', () => {
    const error = new SequenceError('Too many matching values');

    expectTypeOf(error).toEqualTypeOf<SequenceError>();
    expect(error.name).toBe('SequenceError');
    expect(error.message).toBe('Too many matching values');
    expect(error.stack).toEqual(expect.any(String));
    expect(error).toBeInstanceOf(SequenceError);
    expect(error).toBeInstanceOf(Error);
    expect(Object.getPrototypeOf(error)).toBe(SequenceError.prototype);
    expect(Object.getPrototypeOf(SequenceError.prototype)).toBe(Error.prototype);
    expect(SequenceError.prototype.constructor).toBe(SequenceError);
  });
});
