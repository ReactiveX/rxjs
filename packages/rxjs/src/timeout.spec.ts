import { afterEach, beforeAll, describe, expect, expectTypeOf, it, vi } from 'vitest';
import '@rxjs/observable-polyfill';

type TimeoutSymbol = typeof import('./timeout.js').timeout;
type TimeoutErrorClass = typeof import('./timeout.js').TimeoutError;

let timeout: TimeoutSymbol;
let TimeoutError: TimeoutErrorClass;

beforeAll(async () => {
  ({ timeout, TimeoutError } = await import('./timeout.js'));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('timeout', () => {
  it('installs an exact Symbol operator and exports TimeoutError', () => {
    const result = Observable.from([1])[timeout]({ each: 10 });
    const error = new TimeoutError();
    type HasStringNamedTimeout = 'timeout' extends keyof Observable<unknown> ? true : false;

    expectTypeOf(result).toEqualTypeOf<Observable<number | never>>();
    expectTypeOf<HasStringNamedTimeout>().toEqualTypeOf<false>();
    expect(error.name).toBe('TimeoutError');
    expect('timeout' in Observable.prototype).toBe(false);
    expect(Symbol.keyFor(timeout)).toBeUndefined();
  });

  it('restarts an each timer and reports the latest timeout info', () => {
    vi.useFakeTimers();
    const source = controllable<number>();
    const errors: unknown[] = [];

    source.observable[timeout]({ each: 10, meta: 'test' }).subscribe({
      error: (error) => errors.push(error),
    });
    vi.advanceTimersByTime(6);
    source.subscriber.next(1);
    vi.advanceTimersByTime(10);

    expect(errors).toHaveLength(1);
    expect(errors[0]).toBeInstanceOf(TimeoutError);
    expect((errors[0] as InstanceType<TimeoutErrorClass>).info).toEqual({
      meta: 'test',
      seen: 1,
      lastValue: 1,
    });
  });

  it('uses first only for the initial value when each is absent', () => {
    vi.useFakeTimers();
    const source = controllable<number>();
    const values: number[] = [];

    source.observable[timeout]({ first: 10 }).subscribe((value) => values.push(value));
    vi.advanceTimersByTime(5);
    source.subscriber.next(1);
    vi.advanceTimersByTime(100);

    expect(values).toEqual([1]);
    expect(source.subscriber.active).toBe(true);
  });

  it('aborts the timed-out source before subscribing to the fallback', () => {
    vi.useFakeTimers();
    const source = controllable<number>();
    const values: number[] = [];

    source.observable[timeout]({ each: 10, with: () => Observable.from([2]) }).subscribe((value) => values.push(value));
    vi.advanceTimersByTime(10);

    expect(source.subscriber.active).toBe(false);
    expect(values).toEqual([2]);
  });

  it('forwards source errors immediately and clears the timer', () => {
    vi.useFakeTimers();
    const failure = new Error('source failed');
    const source = controllable<number>();
    const errors: unknown[] = [];

    source.observable[timeout]({ each: 10 }).subscribe({ error: (error) => errors.push(error) });
    source.subscriber.error(failure);

    expect(errors).toEqual([failure]);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('does not schedule after a synchronous completion', () => {
    vi.useFakeTimers();
    let completions = 0;

    new Observable<number>((subscriber) => subscriber.complete())
      [timeout]({ each: 10 })
      .subscribe({ complete: () => completions++ });

    expect(completions).toBe(1);
    expect(vi.getTimerCount()).toBe(0);
  });
});

function controllable<T>(): {
  observable: Observable<T>;
  subscriber: Subscriber<T>;
} {
  let subscriber!: Subscriber<T>;
  return {
    observable: new Observable<T>((currentSubscriber) => {
      subscriber = currentSubscriber;
    }),
    get subscriber() {
      return subscriber;
    },
  };
}
