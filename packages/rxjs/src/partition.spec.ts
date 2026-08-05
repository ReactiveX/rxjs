import { beforeAll, describe, expect, expectTypeOf, it } from 'vitest';
import '@rxjs/observable-polyfill';
import './create.js';

type PartitionSymbol = typeof import('./partition.js').partition;

let partition: PartitionSymbol;
let hadStringMethod: boolean;

beforeAll(async () => {
  hadStringMethod = 'partition' in Observable;
  ({ partition } = await import('./partition.js'));
});

describe('partition', () => {
  it('installs only an exact static Symbol-keyed creation function', () => {
    expect(hadStringMethod).toBe(false);
    expect('partition' in Observable).toBe(false);
    expect('partition' in Observable.prototype).toBe(false);
    expect(partition.description).toBe('partition');
    expect(Symbol.keyFor(partition)).toBeUndefined();
    expect(partition in Observable.prototype).toBe(false);
  });

  it('splits an ObservableValue and gives each branch an independent index', () => {
    const calls: Array<[string, number]> = [];
    const minimumLength = 2;
    const [matching, rejected] = Observable[partition](['a', 'bb', 'ccc'], (value, index) => {
      calls.push([value, index]);
      return value.length >= minimumLength;
    });
    const matchingEvents: Array<string | 'complete'> = [];
    const rejectedEvents: Array<string | 'complete'> = [];

    matching.subscribe({
      next: (value) => matchingEvents.push(value),
      complete: () => matchingEvents.push('complete'),
    });
    rejected.subscribe({
      next: (value) => rejectedEvents.push(value),
      complete: () => rejectedEvents.push('complete'),
    });

    expect(matchingEvents).toEqual(['bb', 'ccc', 'complete']);
    expect(rejectedEvents).toEqual(['a', 'complete']);
    expect(calls).toEqual([
      ['a', 0],
      ['bb', 1],
      ['ccc', 2],
      ['a', 0],
      ['bb', 1],
      ['ccc', 2],
    ]);
  });

  it('narrows type-guard branches and infers Promise inputs', () => {
    type Value = number | string;
    const source = Observable.from<Value>([1, 'one', 2]);
    const [numbers, strings] = Observable[partition](source, (value): value is number => typeof value === 'number');
    const [promisedMatches, promisedRejected] = Observable[partition](Promise.resolve(1), (value) => value > 0);

    expectTypeOf(numbers).toEqualTypeOf<Observable<number>>();
    expectTypeOf(strings).toEqualTypeOf<Observable<string>>();
    expectTypeOf(promisedMatches).toEqualTypeOf<Observable<number>>();
    expectTypeOf(promisedRejected).toEqualTypeOf<Observable<number>>();
  });

  it('throws an ObservableValue conversion error at creation time', () => {
    expect(() => Observable[partition](null as any, () => true)).toThrow(TypeError);
  });

  it('forwards source errors to both branches', () => {
    const failure = new Error('source failed');
    const source = new Observable<number>((subscriber) => {
      subscriber.next(1);
      subscriber.error(failure);
    });
    const [matching, rejected] = Observable[partition](source, (value) => value % 2 === 0);
    const matchingEvents: unknown[] = [];
    const rejectedEvents: unknown[] = [];

    matching.subscribe({
      next: (value) => matchingEvents.push(value),
      error: (error) => matchingEvents.push(error),
    });
    rejected.subscribe({
      next: (value) => rejectedEvents.push(value),
      error: (error) => rejectedEvents.push(error),
    });

    expect(matchingEvents).toEqual([failure]);
    expect(rejectedEvents).toEqual([1, failure]);
  });

  it('turns predicate failures into branch errors and cancels synchronous source work', () => {
    const firstFailure = new Error('matching predicate failed');
    const secondFailure = new Error('rejected predicate failed');
    const produced: number[][] = [];
    const source = new Observable<number>((subscriber) => {
      const run: number[] = [];
      produced.push(run);
      for (const value of [1, 2, 3]) {
        if (!subscriber.active) {
          break;
        }
        run.push(value);
        subscriber.next(value);
      }
    });
    const [matching, rejected] = Observable[partition](source, (value) => {
      if (value === 2) {
        throw produced.length === 1 ? firstFailure : secondFailure;
      }
      return true;
    });
    const errors: unknown[] = [];

    matching.subscribe({ error: (error) => errors.push(error) });
    rejected.subscribe({ error: (error) => errors.push(error) });

    expect(errors).toEqual([firstFailure, secondFailure]);
    expect(produced).toEqual([
      [1, 2],
      [1, 2],
    ]);
  });

  it('shares one upstream activation across active branches while branch state remains independent', () => {
    const sourceSubscribers: Subscriber<number>[] = [];
    let sourceTeardowns = 0;
    const predicateCalls: Array<[number, number]> = [];
    const source = new Observable<number>((subscriber) => {
      sourceSubscribers.push(subscriber);
      subscriber.addTeardown(() => sourceTeardowns++);
    });
    const [matching, rejected] = Observable[partition](source, (value, index) => {
      predicateCalls.push([value, index]);
      return value % 2 === 0;
    });
    const firstController = new AbortController();
    const secondController = new AbortController();
    const rejectedController = new AbortController();
    const firstValues: number[] = [];
    const secondValues: number[] = [];
    const rejectedValues: number[] = [];

    matching.subscribe((value) => firstValues.push(value), { signal: firstController.signal });
    matching.subscribe((value) => secondValues.push(value), { signal: secondController.signal });
    rejected.subscribe((value) => rejectedValues.push(value), { signal: rejectedController.signal });

    expect(sourceSubscribers).toHaveLength(1);
    sourceSubscribers[0]?.next(1);
    sourceSubscribers[0]?.next(2);

    expect(predicateCalls).toEqual([
      [1, 0],
      [1, 0],
      [2, 1],
      [2, 1],
    ]);
    expect(firstValues).toEqual([2]);
    expect(secondValues).toEqual([2]);
    expect(rejectedValues).toEqual([1]);

    firstController.abort();
    secondController.abort();
    expect(sourceSubscribers[0]?.active).toBe(true);
    expect(sourceTeardowns).toBe(0);

    rejectedController.abort();
    expect(sourceSubscribers[0]?.active).toBe(false);
    expect(sourceTeardowns).toBe(1);

    const restartedValues: number[] = [];
    rejected.subscribe((value) => restartedValues.push(value));
    expect(sourceSubscribers).toHaveLength(2);
    sourceSubscribers[1]?.next(3);
    expect(restartedValues).toEqual([3]);
    expect(predicateCalls.at(-1)).toEqual([3, 0]);
  });

  it('constructs both result branches through the static receiver', () => {
    class DerivedObservable<T> extends Observable<T> {}

    const DerivedCtor = DerivedObservable as unknown as ObservableCtor;
    const [matching, rejected] = DerivedCtor[partition]([1, 2], (value) => value % 2 === 0);

    expect(matching).toBeInstanceOf(DerivedObservable);
    expect(rejected).toBeInstanceOf(DerivedObservable);
  });
});
