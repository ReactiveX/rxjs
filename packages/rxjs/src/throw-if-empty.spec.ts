import { beforeAll, describe, expect, expectTypeOf, it } from 'vitest';
import '@rxjs/observable-polyfill';

type ThrowIfEmptySymbol = typeof import('./throw-if-empty.js').throwIfEmpty;
type EmptyErrorConstructor = typeof import('./empty-error.js').EmptyError;

let throwIfEmpty: ThrowIfEmptySymbol;
let EmptyError: EmptyErrorConstructor;
let hadStringMethod: boolean;

beforeAll(async () => {
  hadStringMethod = 'throwIfEmpty' in Observable.prototype;
  ({ throwIfEmpty } = await import('./throw-if-empty.js'));
  ({ EmptyError } = await import('./empty-error.js'));
});

describe('throwIfEmpty', () => {
  it('installs only an exact unique Symbol-keyed operator and preserves the source type', () => {
    const result = Observable.from([1])[throwIfEmpty]();
    type HasStringNamedThrowIfEmpty = 'throwIfEmpty' extends keyof Observable<unknown> ? true : false;

    expectTypeOf(result).toEqualTypeOf<Observable<number>>();
    expectTypeOf<HasStringNamedThrowIfEmpty>().toEqualTypeOf<false>();
    expect(hadStringMethod).toBe(false);
    expect('throwIfEmpty' in Observable.prototype).toBe(false);
    expect(throwIfEmpty.description).toBe('throwIfEmpty');
    expect(Symbol.keyFor(throwIfEmpty)).toBeUndefined();
    expect(Symbol('throwIfEmpty')).not.toBe(throwIfEmpty);
  });

  it('forwards every source value and successful completion without calling the factory', () => {
    const observations: Array<number | 'complete'> = [];
    let factoryCalls = 0;

    Observable.from([1, 2, 3])
      [throwIfEmpty](() => {
        factoryCalls++;
        return new Error('unused');
      })
      .subscribe({
        next: (value) => observations.push(value),
        complete: () => observations.push('complete'),
      });

    expect(observations).toEqual([1, 2, 3, 'complete']);
    expect(factoryCalls).toBe(0);
  });

  it('errors with a fresh EmptyError when an empty source completes', () => {
    const firstErrors: unknown[] = [];
    const secondErrors: unknown[] = [];
    const result = Observable.from([] as number[])[throwIfEmpty]();

    result.subscribe({ error: (error) => firstErrors.push(error) });
    result.subscribe({ error: (error) => secondErrors.push(error) });

    expect(firstErrors[0]).toBeInstanceOf(EmptyError);
    expect(secondErrors[0]).toBeInstanceOf(EmptyError);
    expect(firstErrors[0]).not.toBe(secondErrors[0]);
  });

  it('uses the custom factory result and converts a thrown factory failure into a stream error', () => {
    const customFailure = { reason: 'empty' };
    const factoryFailure = new Error('factory failed');
    const customErrors: unknown[] = [];
    const thrownErrors: unknown[] = [];

    Observable.from([] as number[])
      [throwIfEmpty](() => customFailure)
      .subscribe({ error: (error) => customErrors.push(error) });
    Observable.from([] as number[])
      [throwIfEmpty](() => {
        throw factoryFailure;
      })
      .subscribe({ error: (error) => thrownErrors.push(error) });

    expect(customErrors).toEqual([customFailure]);
    expect(thrownErrors).toEqual([factoryFailure]);
  });

  it('forwards source errors without calling the factory', () => {
    const sourceFailure = new Error('source failed');
    const errors: unknown[] = [];
    let factoryCalls = 0;

    new Observable<never>((subscriber) => subscriber.error(sourceFailure))
      [throwIfEmpty](() => {
        factoryCalls++;
        return new Error('unused');
      })
      .subscribe({ error: (error) => errors.push(error) });

    expect(errors).toEqual([sourceFailure]);
    expect(factoryCalls).toBe(0);
  });

  it('propagates last-observer cancellation and restarts with fresh empty state', () => {
    const subscribers: Subscriber<number>[] = [];
    let teardowns = 0;
    const source = new Observable<number>((subscriber) => {
      subscribers.push(subscriber);
      subscriber.addTeardown(() => teardowns++);
    });
    const result = source[throwIfEmpty]();
    const firstController = new AbortController();
    const secondController = new AbortController();

    result.subscribe(() => {}, { signal: firstController.signal });
    result.subscribe(() => {}, { signal: secondController.signal });

    expect(subscribers).toHaveLength(1);
    subscribers[0]?.next(1);
    firstController.abort();
    expect(subscribers[0]?.active).toBe(true);
    expect(teardowns).toBe(0);

    secondController.abort();
    expect(subscribers[0]?.active).toBe(false);
    expect(teardowns).toBe(1);

    const errors: unknown[] = [];
    result.subscribe({ error: (error) => errors.push(error) });
    expect(subscribers).toHaveLength(2);
    subscribers[1]?.complete();
    expect(errors[0]).toBeInstanceOf(EmptyError);
  });
});
