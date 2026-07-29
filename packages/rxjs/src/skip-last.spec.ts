import { describe, expect, it } from 'vitest';
import '@rxjs/observable-polyfill';
import { skipLast } from './skip-last.js';

describe('skipLast', () => {
  it.each([0, -1])('passes values and completion through for a count of %i', (amount) => {
    const results: Array<number | 'complete'> = [];
    const source = new Observable<number>((subscriber) => {
      subscriber.next(1);
      subscriber.next(2);
      subscriber.complete();
    });

    source[skipLast](amount).subscribe({
      next: (value) => results.push(value),
      complete: () => results.push('complete'),
    });

    expect(results).toEqual([1, 2, 'complete']);
  });

  it('passes errors through for nonpositive counts', () => {
    const sourceError = new Error('source failure');
    let receivedError: unknown;
    const source = new Observable<number>((subscriber) => {
      subscriber.next(1);
      subscriber.error(sourceError);
    });

    source[skipLast](0).subscribe({
      error: (error) => {
        receivedError = error;
      },
    });

    expect(receivedError).toBe(sourceError);
  });

  it('preserves shared ref-counting and cancellation for nonpositive counts', () => {
    let activations = 0;
    let teardowns = 0;
    const source = new Observable<number>((subscriber) => {
      activations++;
      subscriber.addTeardown(() => {
        teardowns++;
      });
    });
    const skipped = source[skipLast](-1);
    const firstController = new AbortController();
    const secondController = new AbortController();

    skipped.subscribe(() => {}, { signal: firstController.signal });
    skipped.subscribe(() => {}, { signal: secondController.signal });

    expect(activations).toBe(1);

    firstController.abort();
    expect(teardowns).toBe(0);

    secondController.abort();
    expect(teardowns).toBe(1);
  });
});
