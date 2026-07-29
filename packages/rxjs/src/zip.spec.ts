import { describe, expect, it } from 'vitest';
import '@rxjs/observable-polyfill';
import { zip } from './zip.js';

describe('zip', () => {
  it('completes when a completed source buffer is exhausted', () => {
    const values: number[][] = [];
    let completed = false;

    zip([Observable.from([1, 2]), Observable.from([3, 4, 5])]).subscribe({
      next: (value) => values.push(value),
      complete: () => {
        completed = true;
      },
    });

    expect(values).toEqual([
      [1, 3],
      [2, 4],
    ]);
    expect(completed).toBe(true);
  });

  it('completes without sources', () => {
    let completed = false;

    zip([]).subscribe({
      complete: () => {
        completed = true;
      },
    });

    expect(completed).toBe(true);
  });

  it('does not activate later synchronous sources after an empty input completes the result', () => {
    let laterActivations = 0;
    const later = new Observable<number>(() => {
      laterActivations++;
    });
    let completed = false;

    zip([[], later]).subscribe({
      complete: () => {
        completed = true;
      },
    });

    expect(completed).toBe(true);
    expect(laterActivations).toBe(0);
  });

  it('shares one input activation until the final observer aborts', () => {
    let leftActivations = 0;
    let rightActivations = 0;
    let leftTeardowns = 0;
    let rightTeardowns = 0;
    let leftSubscriber: Subscriber<number> | undefined;
    let rightSubscriber: Subscriber<number> | undefined;
    const left = new Observable<number>((subscriber) => {
      leftActivations++;
      leftSubscriber = subscriber;
      subscriber.addTeardown(() => {
        leftTeardowns++;
      });
    });
    const right = new Observable<number>((subscriber) => {
      rightActivations++;
      rightSubscriber = subscriber;
      subscriber.addTeardown(() => {
        rightTeardowns++;
      });
    });
    const result = zip([left, right]);
    const firstValues: number[][] = [];
    const secondValues: number[][] = [];
    const firstController = new AbortController();
    const secondController = new AbortController();

    result.subscribe((value) => firstValues.push(value), { signal: firstController.signal });
    result.subscribe((value) => secondValues.push(value), { signal: secondController.signal });

    expect(leftActivations).toBe(1);
    expect(rightActivations).toBe(1);

    leftSubscriber?.next(1);
    rightSubscriber?.next(2);
    expect(firstValues).toEqual([[1, 2]]);
    expect(secondValues).toEqual([[1, 2]]);

    firstController.abort();
    expect(leftTeardowns).toBe(0);
    expect(rightTeardowns).toBe(0);

    leftSubscriber?.next(3);
    rightSubscriber?.next(4);
    expect(firstValues).toEqual([[1, 2]]);
    expect(secondValues).toEqual([
      [1, 2],
      [3, 4],
    ]);

    secondController.abort();
    expect(leftTeardowns).toBe(1);
    expect(rightTeardowns).toBe(1);
  });
});
