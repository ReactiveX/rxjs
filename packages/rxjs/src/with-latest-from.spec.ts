import { describe, expect, it } from 'vitest';
import '@rxjs/observable-polyfill';
import { withLatestFrom } from './with-latest-from.js';

describe('withLatestFrom', () => {
  it('subscribes to the other sources before the primary source', () => {
    const subscriptions: string[] = [];
    const other = new Observable<number>((subscriber) => {
      subscriptions.push('other');
      subscriber.next(1);
    });
    const source = new Observable<string>((subscriber) => {
      subscriptions.push('source');
      subscriber.next('a');
      subscriber.complete();
    });
    const results: Array<[string, number] | 'complete'> = [];

    source[withLatestFrom]([other]).subscribe({
      next: (value) => results.push(value),
      complete: () => results.push('complete'),
    });

    expect(subscriptions).toEqual(['other', 'source']);
    expect(results).toEqual([['a', 1], 'complete']);
  });

  it('completes when the primary source completes', () => {
    const other = new Observable<number>(() => {});
    const source = new Observable<string>((subscriber) => subscriber.complete());
    let completed = false;

    source[withLatestFrom]([other]).subscribe({
      complete: () => {
        completed = true;
      },
    });

    expect(completed).toBe(true);
  });

  it('supports projecting the primary value with the latest values', () => {
    const other = Observable.from([2]);
    const source = Observable.from([3]);
    const results: number[] = [];

    source[withLatestFrom]([other], (value, latest) => value * latest).subscribe((value) => results.push(value));

    expect(results).toEqual([6]);
  });

  it('preserves shared ref-counting across result subscribers', () => {
    let sourceActivations = 0;
    let otherActivations = 0;
    let sourceTeardowns = 0;
    let otherTeardowns = 0;
    const source = new Observable<number>((subscriber) => {
      sourceActivations++;
      subscriber.addTeardown(() => {
        sourceTeardowns++;
      });
    });
    const other = new Observable<number>((subscriber) => {
      otherActivations++;
      subscriber.addTeardown(() => {
        otherTeardowns++;
      });
    });
    const result = source[withLatestFrom]([other]);
    const firstController = new AbortController();
    const secondController = new AbortController();

    result.subscribe(() => {}, { signal: firstController.signal });
    result.subscribe(() => {}, { signal: secondController.signal });

    expect(sourceActivations).toBe(1);
    expect(otherActivations).toBe(1);

    firstController.abort();
    expect(sourceTeardowns).toBe(0);
    expect(otherTeardowns).toBe(0);

    secondController.abort();
    expect(sourceTeardowns).toBe(1);
    expect(otherTeardowns).toBe(1);
  });
});
