import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import { noop } from './noop.js';

describe('noop', () => {
  it('has the RxJS 7 no-argument void signature', () => {
    expectTypeOf(noop).toEqualTypeOf<() => void>();

    const callback: (value: string, index: number) => void = noop;
    expectTypeOf(callback).toEqualTypeOf<(value: string, index: number) => void>();
  });

  it('returns undefined', () => {
    expect(noop()).toBeUndefined();
  });

  it('ignores callback arguments and receiver state without side effects', () => {
    const argument = vi.fn();
    const receiverHook = vi.fn();
    const receiver = { receiverHook };

    const result = Reflect.apply(noop, receiver, [argument, 42]);

    expect(result).toBeUndefined();
    expect(argument).not.toHaveBeenCalled();
    expect(receiverHook).not.toHaveBeenCalled();
  });
});
