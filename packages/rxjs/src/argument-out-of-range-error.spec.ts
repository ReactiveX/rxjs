import { describe, expect, it } from 'vitest';
import { ArgumentOutOfRangeError } from './argument-out-of-range-error.js';

describe('ArgumentOutOfRangeError', () => {
  it('preserves the RxJS 7 public error identity and message', () => {
    const error = new ArgumentOutOfRangeError();

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ArgumentOutOfRangeError);
    expect(error.name).toBe('ArgumentOutOfRangeError');
    expect(error.message).toBe('argument out of range');
  });
});
