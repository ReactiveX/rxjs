import { afterEach, beforeAll, describe, expect, expectTypeOf, it, vi } from 'vitest';
import '@rxjs/observable-polyfill';

type SampleTimeSymbol = typeof import('./sample-time.js').sampleTime;

let sampleTime: SampleTimeSymbol;

beforeAll(async () => {
  ({ sampleTime } = await import('./sample-time.js'));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('sampleTime', () => {
  it('installs an exact Symbol operator with a host-period contract', () => {
    const result = Observable.from([1])[sampleTime](10);
    type HasStringNamedSampleTime = 'sampleTime' extends keyof Observable<unknown> ? true : false;

    expectTypeOf(result).toEqualTypeOf<Observable<number>>();
    expectTypeOf<HasStringNamedSampleTime>().toEqualTypeOf<false>();
    expect('sampleTime' in Observable.prototype).toBe(false);
    expect(Symbol.keyFor(sampleTime)).toBeUndefined();
  });

  it('emits only the latest new value at each host interval', () => {
    vi.useFakeTimers();
    const source = controllable<number>();
    const values: number[] = [];

    source.observable[sampleTime](10).subscribe((value) => values.push(value));
    source.subscriber.next(1);
    source.subscriber.next(2);
    vi.advanceTimersByTime(10);
    vi.advanceTimersByTime(10);
    source.subscriber.next(3);
    vi.advanceTimersByTime(10);

    expect(values).toEqual([2, 3]);
  });

  it('completes without flushing and clears the host interval', () => {
    vi.useFakeTimers();
    const source = controllable<number>();
    const events: Array<number | 'complete'> = [];

    source.observable[sampleTime](10).subscribe({
      next: (value) => events.push(value),
      complete: () => events.push('complete'),
    });
    source.subscriber.next(1);
    source.subscriber.complete();

    expect(events).toEqual(['complete']);
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
