import { beforeAll, describe, expect, expectTypeOf, it } from 'vitest';
import '@rxjs/observable-polyfill';

type StartWithSymbol = typeof import('./start-with.js').startWith;

let startWith: StartWithSymbol;
let hadStringMethod: boolean;

beforeAll(async () => {
  hadStringMethod = 'startWith' in Observable.prototype;
  ({ startWith } = await import('./start-with.js'));
});

describe('startWith', () => {
  it('installs only an exact unique Symbol and preserves prefix/source union types', () => {
    const result = Observable.from([1, 2])[startWith]('ready' as const, true as const);
    type HasStringNamedStartWith = 'startWith' extends keyof Observable<unknown> ? true : false;

    expectTypeOf(result).toEqualTypeOf<Observable<number | 'ready' | true>>();
    expectTypeOf<HasStringNamedStartWith>().toEqualTypeOf<false>();
    expect(hadStringMethod).toBe(false);
    expect('startWith' in Observable.prototype).toBe(false);
    expect(startWith.description).toBe('startWith');
    expect(Symbol.keyFor(startWith)).toBeUndefined();
    expect(Symbol('startWith')).not.toBe(startWith);
  });

  it('emits all prefix values synchronously before activating and forwarding the source', () => {
    const events: Array<string | number> = [];
    const source = new Observable<number>((subscriber) => {
      events.push('source');
      subscriber.next(1);
      subscriber.next(2);
      subscriber.complete();
    });

    source[startWith]('a', 'b').subscribe({
      next: (value) => events.push(value),
      complete: () => events.push('complete'),
    });

    expect(events).toEqual(['a', 'b', 'source', 1, 2, 'complete']);
  });

  it('does not activate the source when downstream cancels during the prefix', () => {
    const controller = new AbortController();
    const values: number[] = [];
    let sourceActivations = 0;
    const source = new Observable<number>(() => {
      sourceActivations++;
    });

    source[startWith](1, 2, 3).subscribe(
      (value) => {
        values.push(value);
        controller.abort();
      },
      { signal: controller.signal }
    );

    expect(values).toEqual([1]);
    expect(sourceActivations).toBe(0);
  });

  it('forwards source errors after the prefix and is an identity-shaped sequence for no prefix values', () => {
    const failure = new Error('source failed');
    const observations: unknown[] = [];
    const identityValues: number[] = [];

    new Observable<number>((subscriber) => subscriber.error(failure))[startWith](0).subscribe({
      next: (value) => observations.push(value),
      error: (error) => observations.push(error),
    });
    Observable.from([1, 2])[startWith]().subscribe((value) => identityValues.push(value));

    expect(observations).toEqual([0, failure]);
    expect(identityValues).toEqual([1, 2]);
  });

  it('shares one prefix/source activation, ref-counts cancellation, and restarts from the prefix', () => {
    const sourceSubscribers: Subscriber<number>[] = [];
    let sourceTeardowns = 0;
    const source = new Observable<number>((subscriber) => {
      sourceSubscribers.push(subscriber);
      subscriber.addTeardown(() => sourceTeardowns++);
    });
    const result = source[startWith](0);
    const firstController = new AbortController();
    const secondController = new AbortController();
    const firstValues: number[] = [];
    const secondValues: number[] = [];

    result.subscribe((value) => firstValues.push(value), { signal: firstController.signal });
    result.subscribe((value) => secondValues.push(value), { signal: secondController.signal });

    expect(sourceSubscribers).toHaveLength(1);
    expect(firstValues).toEqual([0]);
    expect(secondValues).toEqual([]);

    sourceSubscribers[0]?.next(1);
    expect(firstValues).toEqual([0, 1]);
    expect(secondValues).toEqual([1]);

    firstController.abort();
    expect(sourceSubscribers[0]?.active).toBe(true);
    secondController.abort();
    expect(sourceSubscribers[0]?.active).toBe(false);
    expect(sourceTeardowns).toBe(1);

    const restartedValues: number[] = [];
    result.subscribe((value) => restartedValues.push(value));
    expect(sourceSubscribers).toHaveLength(2);
    expect(restartedValues).toEqual([0]);
  });
});
