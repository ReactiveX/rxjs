import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import { identity } from './identity.js';

describe('identity', () => {
  it('returns primitive values unchanged and preserves their generic type', () => {
    const value = identity('rxjs' as const);

    expectTypeOf(value).toEqualTypeOf<'rxjs'>();
    expect(value).toBe('rxjs');
  });

  it('returns the same object reference and preserves its shape', () => {
    const input = { name: 'RxJS', version: 7 };
    const result = identity(input);

    expectTypeOf(result).toEqualTypeOf<{ name: string; version: number }>();
    expect(result).toBe(input);
  });

  it('is assignable to callbacks with extra arguments', () => {
    const project: (value: number, index: number) => number = identity;

    expectTypeOf(project).toEqualTypeOf<(value: number, index: number) => number>();
    expect(project(42, 3)).toBe(42);
  });

  it('ignores its receiver and extra runtime arguments', () => {
    const receiverHook = vi.fn();
    const extraArgument = vi.fn();
    const input = { stable: true };

    const result = Reflect.apply(identity, { receiverHook }, [input, extraArgument]);

    expect(result).toBe(input);
    expect(receiverHook).not.toHaveBeenCalled();
    expect(extraArgument).not.toHaveBeenCalled();
  });
});
