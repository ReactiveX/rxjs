import { beforeAll, describe, expect, expectTypeOf, it } from 'vitest';
import '@rxjs/observable-polyfill';
import './create.js';

type GenerateSymbol = typeof import('./generate.js').generate;

let generate: GenerateSymbol;
let hadStringMethod: boolean;

beforeAll(async () => {
  hadStringMethod = 'generate' in Observable;
  ({ generate } = await import('./generate.js'));
});

describe('generate', () => {
  it('installs only an exact static Symbol-keyed factory', () => {
    expect(hadStringMethod).toBe(false);
    expect('generate' in Observable).toBe(false);
    expect('generate' in Observable.prototype).toBe(false);
    expect(generate.description).toBe('generate');
    expect(Symbol.keyFor(generate)).toBeUndefined();
    expect(Symbol('generate')).not.toBe(generate);
  });

  it('supports the positional state, condition, and iterate form', () => {
    const values: number[] = [];
    const result = Observable[generate](
      0,
      (state) => state < 4,
      (state) => state + 1
    );

    expectTypeOf(result).toEqualTypeOf<Observable<number>>();
    result.subscribe((value) => values.push(value));

    expect(values).toEqual([0, 1, 2, 3]);
  });

  it('supports positional and options-object result selectors', () => {
    const positional: string[] = [];
    const configured: string[] = [];
    const positionalResult = Observable[generate](
      1,
      (state) => state <= 3,
      (state) => state + 1,
      (state) => `value:${state}`
    );
    const configuredResult = Observable[generate]({
      initialState: 1,
      condition: (state) => state <= 3,
      iterate: (state) => state + 1,
      resultSelector: (state) => `value:${state}`,
    });

    expectTypeOf(positionalResult).toEqualTypeOf<Observable<string>>();
    expectTypeOf(configuredResult).toEqualTypeOf<Observable<string>>();
    positionalResult.subscribe((value) => positional.push(value));
    configuredResult.subscribe((value) => configured.push(value));

    expect(positional).toEqual(['value:1', 'value:2', 'value:3']);
    expect(configured).toEqual(positional);
  });

  it('allows an omitted options condition and stops synchronous generation on cancellation', () => {
    const controller = new AbortController();
    const values: number[] = [];
    let iterateCalls = 0;

    Observable[generate]({
      initialState: 0,
      iterate: (state) => {
        iterateCalls++;
        return state + 1;
      },
    }).subscribe(
      (value) => {
        values.push(value);
        if (value === 2) {
          controller.abort();
        }
      },
      { signal: controller.signal }
    );

    expect(values).toEqual([0, 1, 2]);
    expect(iterateCalls).toBe(2);
  });

  it('routes condition, result-selector, and iterate failures to the error channel', () => {
    const conditionFailure = new Error('condition failed');
    const resultFailure = new Error('result failed');
    const iterateFailure = new Error('iterate failed');
    const errors: unknown[] = [];

    Observable[generate](
      0,
      () => {
        throw conditionFailure;
      },
      (state) => state + 1
    ).subscribe({ error: (error) => errors.push(error) });
    Observable[generate](
      0,
      () => true,
      (state) => state + 1,
      () => {
        throw resultFailure;
      }
    ).subscribe({ error: (error) => errors.push(error) });
    Observable[generate](
      0,
      () => true,
      () => {
        throw iterateFailure;
      }
    ).subscribe({ error: (error) => errors.push(error) });

    expect(errors).toEqual([conditionFailure, resultFailure, iterateFailure]);
  });

  it('does not iterate after the condition completes or downstream cancels', () => {
    let completedIterateCalls = 0;
    let cancelledIterateCalls = 0;
    const controller = new AbortController();

    Observable[generate](
      0,
      () => false,
      (state) => {
        completedIterateCalls++;
        return state;
      }
    ).subscribe();
    Observable[generate](
      0,
      () => true,
      (state) => {
        cancelledIterateCalls++;
        return state + 1;
      }
    ).subscribe(
      () => controller.abort(),
      { signal: controller.signal }
    );

    expect(completedIterateCalls).toBe(0);
    expect(cancelledIterateCalls).toBe(0);
  });

  it('rejects scheduler-shaped forms instead of silently treating schedulers as values', () => {
    const scheduler = { schedule() {} };

    expect(() =>
      Reflect.apply(Observable[generate], Observable, [
        {
          initialState: 0,
          iterate: (state: number) => state + 1,
          scheduler,
        },
      ])
    ).toThrowError('Scheduler-backed generate is not supported');
    expect(() =>
      Reflect.apply(Observable[generate], Observable, [
        0,
        (state: number) => state < 1,
        (state: number) => state + 1,
        (state: number) => state,
        scheduler,
      ])
    ).toThrowError('Scheduler-backed generate is not supported');
  });

  it('constructs through the active static receiver and restarts after completion', () => {
    class DerivedObservable<T> extends Observable<T> {}
    const DerivedCtor = DerivedObservable as unknown as ObservableCtor;
    const result = DerivedCtor[generate](
      0,
      (state) => state < 2,
      (state) => state + 1
    );
    const first: number[] = [];
    const second: number[] = [];

    result.subscribe((value) => first.push(value));
    result.subscribe((value) => second.push(value));

    expect(result).toBeInstanceOf(DerivedObservable);
    expect(first).toEqual([0, 1]);
    expect(second).toEqual([0, 1]);
  });
});
