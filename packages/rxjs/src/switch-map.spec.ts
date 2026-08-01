import { describe, expect, it } from 'vitest';
import '@rxjs/observable-polyfill';
import { switchMap } from './switch-map.js';

describe('switchMap', () => {
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
