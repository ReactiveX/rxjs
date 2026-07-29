import { describe, expect, it } from 'vitest';
import '@rxjs/observable-polyfill';
import { repeat } from './repeat.js';

describe('repeat', () => {
  it('uses count as the exact total number of source activations', () => {
    let sourceActivations = 0;
    const results: Array<number | 'complete'> = [];
    const source = new Observable<number>((subscriber) => {
      subscriber.next(++sourceActivations);
      subscriber.complete();
    });

    source[repeat]({ count: 3 }).subscribe({
      next: (value) => results.push(value),
      complete: () => results.push('complete'),
    });

    expect(sourceActivations).toBe(3);
    expect(results).toEqual([1, 2, 3, 'complete']);
  });

  it.each([0, -1])('completes without activating the source for a count of %i', (count) => {
    let sourceActivations = 0;
    let completed = false;
    const source = new Observable<void>(() => {
      sourceActivations++;
    });

    source[repeat]({ count }).subscribe({
      complete: () => {
        completed = true;
      },
    });

    expect(sourceActivations).toBe(0);
    expect(completed).toBe(true);
  });

  it('shares each repeated source activation across current observers', () => {
    let sourceActivations = 0;
    let sourceSubscriber: Subscriber<number> | undefined;
    const source = new Observable<number>((subscriber) => {
      sourceActivations++;
      sourceSubscriber = subscriber;
    });
    const repeated = source[repeat]({ count: 2 });
    const firstResults: Array<number | 'complete'> = [];
    const secondResults: Array<number | 'complete'> = [];

    repeated.subscribe({
      next: (value) => firstResults.push(value),
      complete: () => firstResults.push('complete'),
    });
    repeated.subscribe({
      next: (value) => secondResults.push(value),
      complete: () => secondResults.push('complete'),
    });

    sourceSubscriber?.next(1);
    sourceSubscriber?.complete();
    sourceSubscriber?.next(2);
    sourceSubscriber?.complete();

    expect(sourceActivations).toBe(2);
    expect(firstResults).toEqual([1, 2, 'complete']);
    expect(secondResults).toEqual([1, 2, 'complete']);
  });
});
