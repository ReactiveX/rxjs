import { beforeAll, describe, expect, expectTypeOf, it } from 'vitest';
import '@rxjs/observable-polyfill';

type ZipWithSymbol = typeof import('./zip-with.js').zipWith;

let zipWith: ZipWithSymbol;
let hadStringMethod: boolean;

beforeAll(async () => {
  hadStringMethod = 'zipWith' in Observable.prototype;
  ({ zipWith } = await import('./zip-with.js'));
});

describe('zipWith', () => {
  it('installs only an exact Symbol-keyed operator', () => {
    expect(hadStringMethod).toBe(false);
    expect('zipWith' in Observable.prototype).toBe(false);
    expect(zipWith.description).toBe('zipWith');
    expect(Symbol.keyFor(zipWith)).toBeUndefined();
  });

  it('emits source-first tuples from variadic ObservableInput values with exact types', () => {
    const source = Observable.from([1, 2, 3]);
    const result = source[zipWith](Observable.from(['a', 'b', 'c']), [true, false]);
    const events: Array<readonly [number, string, boolean] | 'complete'> = [];

    expectTypeOf(result).toEqualTypeOf<Observable<[number, string, boolean]>>();
    result.subscribe({
      next: (value) => events.push(value),
      complete: () => events.push('complete'),
    });

    expect(events).toEqual([
      [1, 'a', true],
      [2, 'b', false],
      'complete',
    ]);
  });

  it('wraps each source value in a one-element tuple when no other input is supplied', () => {
    const result = Observable.from([1, 2])[zipWith]();
    const events: Array<readonly [number] | 'complete'> = [];

    expectTypeOf(result).toEqualTypeOf<Observable<[number]>>();
    result.subscribe({
      next: (value) => events.push(value),
      complete: () => events.push('complete'),
    });

    expect(events).toEqual([[1], [2], 'complete']);
  });

  it('activates the receiver first and stops before acquiring later inputs after synchronous completion', () => {
    const activations: string[] = [];
    let iteratorAcquisitions = 0;
    const source = new Observable<never>((subscriber) => {
      activations.push('source');
      subscriber.complete();
    });
    const laterIterable = {
      [Symbol.iterator]() {
        iteratorAcquisitions++;
        return [1][Symbol.iterator]();
      },
    };
    const events: string[] = [];

    source[zipWith](laterIterable).subscribe({
      next: () => events.push('next'),
      complete: () => events.push('complete'),
    });

    expect(activations).toEqual(['source']);
    expect(iteratorAcquisitions).toBe(0);
    expect(events).toEqual(['complete']);
  });

  it('cancels an already active receiver when a later input completes empty', () => {
    const source = controllable<number>();
    const events: string[] = [];

    source.observable[zipWith]([]).subscribe({
      next: () => events.push('next'),
      complete: () => events.push('complete'),
    });

    expect(events).toEqual(['complete']);
    expect(source.subscriber.active).toBe(false);
    expect(source.teardowns).toBe(1);
  });

  it('completes and cancels siblings after the final tuple drains the shortest input', () => {
    const source = controllable<number>();
    const other = controllable<string>();
    const events: Array<readonly [number, string] | 'complete'> = [];

    source.observable[zipWith](other.observable).subscribe({
      next: (value) => events.push(value),
      complete: () => events.push('complete'),
    });
    source.subscriber.next(1);
    source.subscriber.complete();
    other.subscriber.next('a');

    expect(events).toEqual([[1, 'a'], 'complete']);
    expect(other.subscriber.active).toBe(false);
    expect(other.teardowns).toBe(1);
  });

  it('forwards an input error and synchronously cancels every sibling', () => {
    const source = controllable<number>();
    const firstOther = controllable<string>();
    const secondOther = controllable<boolean>();
    const failure = new Error('zipWith input failed');
    const errors: unknown[] = [];

    source.observable[zipWith](firstOther.observable, secondOther.observable).subscribe({
      error: (error) => errors.push(error),
    });
    firstOther.subscriber.error(failure);

    expect(errors).toEqual([failure]);
    expect(source.subscriber.active).toBe(false);
    expect(firstOther.subscriber.active).toBe(false);
    expect(secondOther.subscriber.active).toBe(false);
    expect(source.teardowns).toBe(1);
    expect(firstOther.teardowns).toBe(1);
    expect(secondOther.teardowns).toBe(1);
  });

  it('shares one zipped activation, ref-counts observers, and restarts after cancellation', () => {
    const sources: Subscriber<number>[] = [];
    const others: Subscriber<string>[] = [];
    let sourceTeardowns = 0;
    let otherTeardowns = 0;
    const source = new Observable<number>((subscriber) => {
      sources.push(subscriber);
      subscriber.addTeardown(() => sourceTeardowns++);
    });
    const other = new Observable<string>((subscriber) => {
      others.push(subscriber);
      subscriber.addTeardown(() => otherTeardowns++);
    });
    const result = source[zipWith](other);
    const firstController = new AbortController();
    const secondController = new AbortController();
    const firstEvents: Array<readonly [number, string]> = [];
    const secondEvents: Array<readonly [number, string]> = [];

    result.subscribe((value) => firstEvents.push(value), { signal: firstController.signal });
    result.subscribe((value) => secondEvents.push(value), { signal: secondController.signal });

    expect(sources).toHaveLength(1);
    expect(others).toHaveLength(1);
    sources[0]?.next(1);
    others[0]?.next('a');
    expect(firstEvents).toEqual([[1, 'a']]);
    expect(secondEvents).toEqual([[1, 'a']]);

    firstController.abort();
    expect(sources[0]?.active).toBe(true);
    expect(others[0]?.active).toBe(true);

    secondController.abort();
    expect(sources[0]?.active).toBe(false);
    expect(others[0]?.active).toBe(false);
    expect(sourceTeardowns).toBe(1);
    expect(otherTeardowns).toBe(1);

    const restartedEvents: Array<readonly [number, string]> = [];
    result.subscribe((value) => restartedEvents.push(value));
    expect(sources).toHaveLength(2);
    expect(others).toHaveLength(2);
    sources[1]?.next(2);
    others[1]?.next('b');

    expect(restartedEvents).toEqual([[2, 'b']]);
  });
});

function controllable<T>(): {
  readonly observable: Observable<T>;
  readonly subscriber: Subscriber<T>;
  readonly teardowns: number;
} {
  let sourceSubscriber: Subscriber<T> | undefined;
  let teardowns = 0;
  const observable = new Observable<T>((subscriber) => {
    sourceSubscriber = subscriber;
    subscriber.addTeardown(() => {
      teardowns++;
    });
  });

  return {
    observable,
    get subscriber() {
      if (!sourceSubscriber) {
        throw new Error('The controllable source is not active.');
      }
      return sourceSubscriber;
    },
    get teardowns() {
      return teardowns;
    },
  };
}
