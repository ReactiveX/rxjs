import { describe, expect, it } from 'vitest';
import '@rxjs/observable-polyfill';
import { switchMap } from './switch-map.js';

describe('switchMap', () => {
  it('does not invoke a superseded projection after teardown reenters the source', () => {
    const outer = controllable<number>();
    const first = controllable<number>();
    const latest = controllable<number>();
    const failure = new Error('superseded projection');
    const calls: Array<readonly [number, number]> = [];
    const events: Array<number | 'complete' | Error> = [];

    outer.observable[switchMap]((value, index) => {
      calls.push([value, index]);
      if (value === 2) {
        throw failure;
      }
      return value === 1 ? first.observable : latest.observable;
    }).subscribe({
      next: (value) => events.push(value),
      error: (error) => events.push(error),
      complete: () => events.push('complete'),
    });
    outer.subscriber.next(1);
    first.subscriber.addTeardown(() => outer.subscriber.next(3));
    outer.subscriber.next(2);

    expect(calls).toEqual([
      [1, 0],
      [3, 1],
    ]);
    expect(latest.subscriber.active).toBe(true);

    latest.subscriber.next(30);
    outer.subscriber.complete();
    latest.subscriber.complete();
    expect(events).toEqual([30, 'complete']);
  });

  it('does not project a replacement after the preceding teardown cancels the result', () => {
    const outer = controllable<number>();
    const first = controllable<number>();
    const controller = new AbortController();
    const calls: number[] = [];

    outer.observable[switchMap]((value) => {
      calls.push(value);
      return first.observable;
    }).subscribe(null, { signal: controller.signal });
    outer.subscriber.next(1);
    first.subscriber.addTeardown(() => controller.abort());
    outer.subscriber.next(2);

    expect(calls).toEqual([1]);
    expect(outer.subscriber.active).toBe(false);
    expect(first.subscriber.active).toBe(false);
  });

  it('waits for the replacement when the preceding inner teardown completes the source', () => {
    const outer = controllable<Observable<number>>();
    const first = controllable<number>();
    const second = controllable<number>();
    const events: Array<number | 'complete'> = [];

    outer.observable[switchMap]((inner) => inner).subscribe({
      next: (value) => events.push(value),
      complete: () => events.push('complete'),
    });
    outer.subscriber.next(first.observable);
    first.subscriber.addTeardown(() => outer.subscriber.complete());
    outer.subscriber.next(second.observable);

    expect(events).toEqual([]);
    expect(first.teardowns).toBe(1);
    expect(second.subscriptions).toBe(1);

    second.subscriber.next(2);
    second.subscriber.complete();
    expect(events).toEqual([2, 'complete']);
  });

  it.each([1, 2])('keeps the latest %i inners when teardown reenters the source', (concurrent) => {
    const outer = controllable<number>();
    const inners = Array.from({ length: concurrent + 2 }, () => controllable<number>());
    const events: Array<number | 'complete'> = [];

    outer.observable[switchMap]((value) => inners[value]!.observable, { concurrent }).subscribe({
      next: (value) => events.push(value),
      complete: () => events.push('complete'),
    });
    for (let i = 0; i < concurrent; i++) {
      outer.subscriber.next(i);
    }
    inners[0]!.subscriber.addTeardown(() => outer.subscriber.next(concurrent + 1));
    outer.subscriber.next(concurrent);
    outer.subscriber.complete();

    expect(inners.map((inner) => inner.subscriptions > 0 && inner.subscriber.active)).toEqual(
      Array.from({ length: concurrent + 2 }, (_, index) => index >= 2)
    );
    for (let i = 0; i < inners.length; i++) {
      if (inners[i]!.subscriptions > 0) {
        inners[i]!.subscriber.next(i);
        inners[i]!.subscriber.complete();
      }
    }
    expect(events).toEqual([...Array.from({ length: concurrent }, (_, index) => index + 2), 'complete']);
  });

  it('cancels the preceding inner and waits for the active inner after outer completion', () => {
    const outer = controllable<Observable<string>>();
    const first = controllable<string>();
    const second = controllable<string>();
    const results: string[] = [];

    outer.observable[switchMap]((inner) => inner).subscribe({
      next: (value) => results.push(value),
      complete: () => results.push('complete'),
    });
    outer.subscriber.next(first.observable);
    first.subscriber.next('first');
    outer.subscriber.next(second.observable);

    expect(first.subscriber.active).toBe(false);
    expect(first.teardowns).toBe(1);

    first.subscriber.next('ignored');
    second.subscriber.next('second');
    outer.subscriber.complete();
    expect(results).toEqual(['first', 'second']);

    second.subscriber.complete();
    expect(results).toEqual(['first', 'second', 'complete']);
  });

  it('forwards mapper and input-conversion failures', () => {
    const mapperFailure = new Error('mapper failure');
    const conversionFailure = new Error('conversion failure');
    const errors: unknown[] = [];

    fromValues(1)
      [switchMap](() => {
        throw mapperFailure;
      })
      .subscribe({ error: (error) => errors.push(error) });

    fromValues(1)
      [switchMap](
        () =>
          Object.defineProperty({}, Symbol.iterator, {
            get: () => {
              throw conversionFailure;
            },
          }) as Iterable<never>
      )
      .subscribe({ error: (error) => errors.push(error) });

    expect(errors).toEqual([mapperFailure, conversionFailure]);
  });

  it('shares outer and projection work across concurrent observers', () => {
    const outer = controllable<number>();
    const inner = controllable<string>();
    let projections = 0;
    const switched = outer.observable[switchMap](() => {
      projections++;
      return inner.observable;
    });
    const first: string[] = [];
    const second: string[] = [];

    switched.subscribe((value) => first.push(value));
    switched.subscribe((value) => second.push(value));
    outer.subscriber.next(1);
    inner.subscriber.next('shared');

    expect(outer.subscriptions).toBe(1);
    expect(inner.subscriptions).toBe(1);
    expect(projections).toBe(1);
    expect(first).toEqual(['shared']);
    expect(second).toEqual(['shared']);
  });
});

function controllable<T>(): {
  observable: Observable<T>;
  subscriber: Subscriber<T>;
  subscriptions: number;
  teardowns: number;
} {
  let subscriber: Subscriber<T> | undefined;
  let subscriptions = 0;
  let teardowns = 0;
  const observable = new Observable<T>((nextSubscriber) => {
    subscriptions++;
    subscriber = nextSubscriber;
    nextSubscriber.addTeardown(() => teardowns++);
  });
  return {
    observable,
    get subscriber() {
      if (!subscriber) {
        throw new Error('The controllable Observable is not active');
      }
      return subscriber;
    },
    get subscriptions() {
      return subscriptions;
    },
    get teardowns() {
      return teardowns;
    },
  };
}

function fromValues<T>(...values: T[]): Observable<T> {
  return new Observable<T>((subscriber) => {
    for (const value of values) {
      subscriber.next(value);
    }
    subscriber.complete();
  });
}
