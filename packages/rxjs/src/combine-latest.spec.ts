import { describe, expect, it } from 'vitest';
import '@rxjs/observable-polyfill';
import { combineLatest } from './combine-latest.js';

describe('combineLatest', () => {
  it('includes the instance receiver exactly once', () => {
    let receiverActivations = 0;
    let receiverSubscriptions = 0;
    const receiver = new Observable<number>((subscriber) => {
      receiverActivations++;
      subscriber.next(1);
      subscriber.complete();
    });
    const subscribe = receiver.subscribe.bind(receiver);
    receiver.subscribe = (...args) => {
      receiverSubscriptions++;
      subscribe(...args);
    };
    const values: number[][] = [];

    receiver[combineLatest]([Observable.from([2])]).subscribe((value) => values.push(value));

    expect(receiverActivations).toBe(1);
    expect(receiverSubscriptions).toBe(1);
    expect(values).toEqual([[1, 2]]);
    expect(values[0]).toHaveLength(2);
  });

  it('preserves static array and object source forms', () => {
    const arrayValues: number[][] = [];
    const objectValues: Array<{ left: number; right: string }> = [];

    Observable[combineLatest]([Observable.from([1]), Observable.from([2])]).subscribe((value) => arrayValues.push(value));
    Observable[combineLatest]({
      left: Observable.from([3]),
      right: Observable.from(['four']),
    }).subscribe((value) => objectValues.push(value));

    expect(arrayValues).toEqual([[1, 2]]);
    expect(objectValues).toEqual([{ left: 3, right: 'four' }]);
  });

  it('projects static array values with the RxJS result-selector overload', () => {
    const values: string[] = [];

    Observable[combineLatest]([Observable.from([1]), Observable.from([2])], (left, right) => `${left}:${right}`).subscribe((value) =>
      values.push(value)
    );

    expect(values).toEqual(['1:2']);
  });

  it('projects the instance receiver before the additional source values', () => {
    const values: string[] = [];

    Observable.from([1])
      [combineLatest]([Observable.from([2]), Observable.from([3])], (first, second, third) => `${first}:${second}:${third}`)
      .subscribe((value) => values.push(value));

    expect(values).toEqual(['1:2:3']);
  });

  it('forwards result-selector errors through the derived observable', () => {
    const expected = new Error('projection failed');
    const errors: unknown[] = [];

    Observable[combineLatest]([Observable.from([1]), Observable.from([2])], () => {
      throw expected;
    }).subscribe({
      error: (error) => errors.push(error),
    });

    expect(errors).toEqual([expected]);
  });

  it('cancels the receiver and additional sources with the result', () => {
    let receiverTeardowns = 0;
    let sourceTeardowns = 0;
    const receiver = new Observable<number>((subscriber) => {
      subscriber.addTeardown(() => {
        receiverTeardowns++;
      });
    });
    const source = new Observable<number>((subscriber) => {
      subscriber.addTeardown(() => {
        sourceTeardowns++;
      });
    });
    const controller = new AbortController();

    receiver[combineLatest]([source]).subscribe(() => {}, { signal: controller.signal });
    controller.abort();

    expect(receiverTeardowns).toBe(1);
    expect(sourceTeardowns).toBe(1);
  });

  it('shares one combined activation until the final observer aborts', () => {
    let receiverActivations = 0;
    let sourceActivations = 0;
    let receiverTeardowns = 0;
    let sourceTeardowns = 0;
    let receiverSubscriber: Subscriber<number> | undefined;
    let sourceSubscriber: Subscriber<number> | undefined;
    const receiver = new Observable<number>((subscriber) => {
      receiverActivations++;
      receiverSubscriber = subscriber;
      subscriber.addTeardown(() => {
        receiverTeardowns++;
      });
    });
    const source = new Observable<number>((subscriber) => {
      sourceActivations++;
      sourceSubscriber = subscriber;
      subscriber.addTeardown(() => {
        sourceTeardowns++;
      });
    });
    const result = receiver[combineLatest]([source]);
    const firstValues: number[][] = [];
    const secondValues: number[][] = [];
    const firstController = new AbortController();
    const secondController = new AbortController();

    result.subscribe((value) => firstValues.push(value), { signal: firstController.signal });
    result.subscribe((value) => secondValues.push(value), { signal: secondController.signal });

    expect(receiverActivations).toBe(1);
    expect(sourceActivations).toBe(1);

    receiverSubscriber?.next(1);
    sourceSubscriber?.next(2);
    expect(firstValues).toEqual([[1, 2]]);
    expect(secondValues).toEqual([[1, 2]]);

    firstController.abort();
    expect(receiverTeardowns).toBe(0);
    expect(sourceTeardowns).toBe(0);

    receiverSubscriber?.next(3);
    expect(firstValues).toEqual([[1, 2]]);
    expect(secondValues).toEqual([
      [1, 2],
      [3, 2],
    ]);

    secondController.abort();
    expect(receiverTeardowns).toBe(1);
    expect(sourceTeardowns).toBe(1);
  });
});
