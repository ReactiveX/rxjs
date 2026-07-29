import { describe, expect, it } from 'vitest';
import '@rxjs/observable-polyfill';
import { concat } from './concat.js';

describe('concat', () => {
  it('subscribes to an instance receiver once before later sources', () => {
    const activations: string[] = [];
    const source = new Observable<number>((subscriber) => {
      activations.push('source');
      subscriber.next(1);
      subscriber.complete();
    });
    const later = new Observable<number>((subscriber) => {
      activations.push('later');
      subscriber.next(2);
      subscriber.complete();
    });
    const values: number[] = [];

    source[concat]([later]).subscribe((value) => values.push(value));

    expect(activations).toEqual(['source', 'later']);
    expect(values).toEqual([1, 2]);
  });

  it('does not subscribe to later sources after an error', () => {
    let laterActivations = 0;
    const sourceError = new Error('source failed');
    const source = new Observable<number>((subscriber) => subscriber.error(sourceError));
    const later = new Observable<number>(() => {
      laterActivations++;
    });
    let receivedError: unknown;

    source[concat]([later]).subscribe({
      error: (error) => {
        receivedError = error;
      },
    });

    expect(receivedError).toBe(sourceError);
    expect(laterActivations).toBe(0);
  });

  it('preserves shared ref-counting and cancels the active source', () => {
    let activations = 0;
    let teardowns = 0;
    const source = new Observable<number>((subscriber) => {
      activations++;
      subscriber.addTeardown(() => {
        teardowns++;
      });
    });
    const result = source[concat]([[2]]);
    const firstController = new AbortController();
    const secondController = new AbortController();

    result.subscribe(() => {}, { signal: firstController.signal });
    result.subscribe(() => {}, { signal: secondController.signal });

    expect(activations).toBe(1);

    firstController.abort();
    expect(teardowns).toBe(0);

    secondController.abort();
    expect(teardowns).toBe(1);
  });
});
