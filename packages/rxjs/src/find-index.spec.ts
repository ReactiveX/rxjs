import { beforeAll, describe, expect, expectTypeOf, it } from 'vitest';
import '@rxjs/observable-polyfill';

type FindIndexSymbol = typeof import('./find-index.js').findIndex;

let findIndex: FindIndexSymbol;
let hadStringFindIndex: boolean;

beforeAll(async () => {
  hadStringFindIndex = 'findIndex' in Observable.prototype;
  ({ findIndex } = await import('./find-index.js'));
});

describe('findIndex', () => {
  it('installs only an exact unique Symbol-keyed operator', () => {
    const selected = Observable.from([1, 2, 3])[findIndex]((value) => value === 2);
    type HasStringNamedFindIndex = 'findIndex' extends keyof Observable<unknown> ? true : false;

    expectTypeOf(selected).toEqualTypeOf<Observable<number>>();
    expectTypeOf<HasStringNamedFindIndex>().toEqualTypeOf<false>();
    expect(hadStringFindIndex).toBe(false);
    expect('findIndex' in Observable.prototype).toBe(false);
    expect(findIndex.description).toBe('findIndex');
    expect(Symbol.keyFor(findIndex)).toBeUndefined();
    expect(Symbol('findIndex')).not.toBe(findIndex);
  });

  it('emits the index of the first matching value and cancels synchronous source work first', () => {
    const produced: number[] = [];
    const observations: Array<number | 'complete'> = [];
    let sourceSubscriber: Subscriber<number> | undefined;
    let activeAtNext = true;
    const source = new Observable<number>((subscriber) => {
      sourceSubscriber = subscriber;
      for (const value of [10, 20, 30, 40]) {
        if (!subscriber.active) {
          break;
        }
        produced.push(value);
        subscriber.next(value);
      }
    });

    source[findIndex]((value) => value === 30).subscribe({
      next: (value) => {
        activeAtNext = sourceSubscriber?.active ?? true;
        observations.push(value);
      },
      complete: () => observations.push('complete'),
    });

    expect(produced).toEqual([10, 20, 30]);
    expect(observations).toEqual([2, 'complete']);
    expect(activeAtNext).toBe(false);
  });

  it('emits -1 when an empty or nonmatching source completes', () => {
    const emptyValues: number[] = [];
    const nonmatchingValues: number[] = [];

    Observable.from([] as number[])
      [findIndex](() => true)
      .subscribe((value) => emptyValues.push(value));
    Observable.from([1, 2, 3])
      [findIndex]((value) => value > 10)
      .subscribe((value) => nonmatchingValues.push(value));

    expect(emptyValues).toEqual([-1]);
    expect(nonmatchingValues).toEqual([-1]);
  });

  it('passes value, index, and the exact source', () => {
    const source = Observable.from(['a', 'bb', 'ccc']);
    const length = 2;
    const calls: Array<[string, number, Observable<string>]> = [];
    const values: number[] = [];

    source[findIndex]((value, index, receivedSource) => {
      calls.push([value, index, receivedSource]);
      return value.length === length;
    }).subscribe((value) => values.push(value));

    expect(values).toEqual([1]);
    expect(calls).toEqual([
      ['a', 0, source],
      ['bb', 1, source],
    ]);
  });

  it('forwards source and predicate errors and stops synchronous production', () => {
    const sourceFailure = new Error('source failed');
    const predicateFailure = new Error('predicate failed');
    const sourceErrors: unknown[] = [];
    const predicateErrors: unknown[] = [];
    const produced: number[] = [];

    new Observable<number>((subscriber) => subscriber.error(sourceFailure))
      [findIndex](() => true)
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
      [findIndex]((value) => {
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
    const selected = source[findIndex]((value) => value > 0);
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
