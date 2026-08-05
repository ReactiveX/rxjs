import { beforeAll, describe, expect, expectTypeOf, it } from 'vitest';
import '@rxjs/observable-polyfill';

type FindSymbol = typeof import('./find.js').find;

let find: FindSymbol;
let platformFind: Observable<unknown>['find'];

beforeAll(async () => {
  platformFind = Observable.prototype.find;
  ({ find } = await import('./find.js'));
});

describe('find', () => {
  it('installs an exact unique Symbol without replacing the platform Promise consumer', () => {
    const source = Observable.from([1, 2, 3]);
    const otherKey = Symbol('find');

    expect(find.description).toBe('find');
    expect(Symbol.keyFor(find)).toBeUndefined();
    expect(source[find]).not.toBe(platformFind);
    expect(Observable.prototype.find).toBe(platformFind);
    expect((Observable.prototype as unknown as Record<symbol, unknown>)[otherKey]).toBeUndefined();
  });

  it('emits the first matching value and cancels synchronous source work before notifying downstream', () => {
    const produced: number[] = [];
    const observations: Array<number | 'complete'> = [];
    let activeAtNext = true;
    let sourceSubscriber: Subscriber<number> | undefined;
    const source = new Observable<number>((subscriber) => {
      sourceSubscriber = subscriber;
      for (const value of [1, 2, 3, 4]) {
        if (!subscriber.active) {
          break;
        }
        produced.push(value);
        subscriber.next(value);
      }
    });

    source[find]((value) => value === 2).subscribe({
      next: (value) => {
        activeAtNext = sourceSubscriber?.active ?? true;
        observations.push(value as number);
      },
      complete: () => observations.push('complete'),
    });

    expect(produced).toEqual([1, 2]);
    expect(observations).toEqual([2, 'complete']);
    expect(activeAtNext).toBe(false);
  });

  it('emits undefined when an empty or nonmatching source completes', () => {
    const emptyValues: Array<number | undefined> = [];
    const nonmatchingValues: Array<number | undefined> = [];

    Observable.from([] as number[])
      [find](() => true)
      .subscribe((value) => emptyValues.push(value));
    Observable.from([1, 2, 3])
      [find]((value) => value > 10)
      .subscribe((value) => nonmatchingValues.push(value));

    expect(emptyValues).toEqual([undefined]);
    expect(nonmatchingValues).toEqual([undefined]);
  });

  it('passes value, index, and the exact source', () => {
    const source = Observable.from([2, 4, 6]);
    const target = 4;
    const calls: Array<[number, number, Observable<number>]> = [];
    const values: Array<number | undefined> = [];

    source[find]((value, index, receivedSource) => {
      calls.push([value, index, receivedSource]);
      return value === target;
    }).subscribe((value) => values.push(value));

    expect(values).toEqual([4]);
    expect(calls).toEqual([
      [2, 0, source],
      [4, 1, source],
    ]);
  });

  it('preserves type-guard narrowing', () => {
    const source: Observable<number | string> = Observable.from([1, 'two']);
    const selected = source[find]((value): value is string => typeof value === 'string');

    expectTypeOf(selected).toEqualTypeOf<Observable<string | undefined>>();
  });

  it('forwards source and predicate errors and cancels immediately', () => {
    const sourceFailure = new Error('source failed');
    const predicateFailure = new Error('predicate failed');
    const sourceErrors: unknown[] = [];
    const predicateErrors: unknown[] = [];
    const produced: number[] = [];

    new Observable<number>((subscriber) => subscriber.error(sourceFailure))
      [find](() => true)
      .subscribe({
        error: (error) => sourceErrors.push(error),
      });
    new Observable<number>((subscriber) => {
      for (const value of [1, 2, 3]) {
        if (!subscriber.active) {
          break;
        }
        produced.push(value);
        subscriber.next(value);
      }
    })
      [find]((value) => {
        if (value === 2) {
          throw predicateFailure;
        }
        return false;
      })
      .subscribe({
        error: (error) => predicateErrors.push(error),
      });

    expect(sourceErrors).toEqual([sourceFailure]);
    expect(predicateErrors).toEqual([predicateFailure]);
    expect(produced).toEqual([1, 2]);
  });

  it('propagates last-observer cancellation and restarts after ref count reaches zero', () => {
    const subscribers: Subscriber<number>[] = [];
    let teardowns = 0;
    const source = new Observable<number>((subscriber) => {
      subscribers.push(subscriber);
      subscriber.addTeardown(() => teardowns++);
    });
    const selected = source[find]((value) => value > 0);
    const firstController = new AbortController();
    const secondController = new AbortController();

    selected.subscribe(() => {}, { signal: firstController.signal });
    selected.subscribe(() => {}, { signal: secondController.signal });

    expect(subscribers).toHaveLength(1);
    firstController.abort();
    expect(subscribers[0]?.active).toBe(true);
    expect(teardowns).toBe(0);

    secondController.abort();
    expect(subscribers[0]?.active).toBe(false);
    expect(teardowns).toBe(1);

    selected.subscribe(() => {});
    expect(subscribers).toHaveLength(2);
  });
});
