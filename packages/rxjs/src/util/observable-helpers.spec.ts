import { describe, expect, it } from 'vitest';
import { convertObservableValue, subscribeToSource } from './observable-helpers.js';

describe('Observable kernel helpers', () => {
  it('converts inputs with the active realm constructor rather than a derived receiver', () => {
    class DerivedObservable<T> extends Observable<T> {}
    const converted = convertObservableValue({ value: [1, 2, 3] });

    expect(converted).toBeInstanceOf(Observable);
    expect(converted).not.toBeInstanceOf(DerivedObservable);
  });

  it('forwards source notifications and owns cancellation through the destination signal', () => {
    let sourceSubscriber: Subscriber<number> | undefined;
    let sourceTeardowns = 0;
    const source = new Observable<number>((subscriber) => {
      sourceSubscriber = subscriber;
      subscriber.addTeardown(() => sourceTeardowns++);
    });
    const values: number[] = [];
    const controller = new AbortController();
    const derived = new Observable<number>((subscriber) => {
      subscribeToSource(source, subscriber);
    });

    derived.subscribe((value) => values.push(value), { signal: controller.signal });
    sourceSubscriber?.next(1);
    controller.abort();
    sourceSubscriber?.next(2);

    expect(values).toEqual([1]);
    expect(sourceSubscriber?.active).toBe(false);
    expect(sourceTeardowns).toBe(1);
  });

  it('forwards source errors and completion by default', () => {
    const failure = new Error('source failure');
    const results: Array<'complete' | Error> = [];

    new Observable<number>((subscriber) => {
      subscribeToSource(new Observable<number>((sourceSubscriber) => sourceSubscriber.error(failure)), subscriber);
    }).subscribe({
      error: (error) => results.push(error as Error),
      complete: () => results.push('complete'),
    });

    expect(results).toEqual([failure]);

    new Observable<number>((subscriber) => {
      subscribeToSource(new Observable<number>((sourceSubscriber) => sourceSubscriber.complete()), subscriber);
    }).subscribe({ complete: () => results.push('complete') });

    expect(results).toEqual([failure, 'complete']);
  });

  it('turns overridden notification callback exceptions into stream errors', () => {
    const failures = [new Error('next failure'), new Error('error failure'), new Error('complete failure')];
    const errors: unknown[] = [];

    const sources = [
      new Observable<number>((sourceSubscriber) => sourceSubscriber.next(1)),
      new Observable<number>((sourceSubscriber) => sourceSubscriber.error(new Error('source failure'))),
      new Observable<number>((sourceSubscriber) => sourceSubscriber.complete()),
    ];
    const overrides: Array<Partial<Observer<number>>> = [
      {
        next: () => {
          throw failures[0];
        },
      },
      {
        error: () => {
          throw failures[1];
        },
      },
      {
        complete: () => {
          throw failures[2];
        },
      },
    ];

    for (let index = 0; index < sources.length; index++) {
      new Observable<number>((subscriber) => subscribeToSource(sources[index]!, subscriber, overrides[index])).subscribe({
        error: (error) => errors.push(error),
      });
    }

    expect(errors).toEqual(failures);
  });

  it('turns synchronous subscription setup exceptions into stream errors', () => {
    const failure = new Error('setup failure');
    const errors: unknown[] = [];
    const source = {
      subscribe: () => {
        throw failure;
      },
    } as unknown as Observable<number>;

    new Observable<number>((subscriber) => subscribeToSource(source, subscriber)).subscribe({
      error: (error) => errors.push(error),
    });

    expect(errors).toEqual([failure]);
  });

  it('routes synchronous subscription setup exceptions through an error override', () => {
    const failure = new Error('setup failure');
    const errors: unknown[] = [];
    const source = {
      subscribe: () => {
        throw failure;
      },
    } as unknown as Observable<number>;

    new Observable<number>((subscriber) => subscribeToSource(source, subscriber, { error: (error) => errors.push(error) })).subscribe();

    expect(errors).toEqual([failure]);
  });

  it('joins an operator-local signal with the destination signal', () => {
    let sourceSubscriber: Subscriber<number> | undefined;
    const localController = new AbortController();
    const derived = new Observable<number>((subscriber) => {
      subscribeToSource(
        new Observable<number>((innerSubscriber) => {
          sourceSubscriber = innerSubscriber;
        }),
        subscriber,
        undefined,
        localController.signal
      );
    });

    derived.subscribe(() => {});
    expect(sourceSubscriber?.active).toBe(true);

    localController.abort();
    expect(sourceSubscriber?.active).toBe(false);
  });
});
