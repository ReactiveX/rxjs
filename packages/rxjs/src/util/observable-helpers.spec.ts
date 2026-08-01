import { describe, expect, it } from 'vitest';
import { create } from '../create.js';
import { createDerivedObservable, convertObservableValue, runWithErrorForwarding, subscribeToSource } from './observable-helpers.js';

describe('Observable kernel helpers', () => {
  it('creates derived values through a compatible receiver constructor', () => {
    class DerivedObservable<T> extends Observable<T> {}
    const source = new DerivedObservable<number>(() => {});
    const derived = createDerivedObservable({
      receiver: source,
      init: (subscriber) => subscriber.complete(),
    });

    expect(derived).toBeInstanceOf(DerivedObservable);
  });

  it('honors an explicit receiver construction protocol', () => {
    const constructions: Array<(subscriber: Subscriber<number>) => void> = [];
    const receiver = {
      [create]<T>(init: (subscriber: Subscriber<T>) => void): Observable<T> {
        constructions.push(init as (subscriber: Subscriber<number>) => void);
        return new Observable(init);
      },
    };

    const derived = createDerivedObservable<number>({ receiver, init: () => {} });

    expect(derived).toBeInstanceOf(Observable);
    expect(constructions).toHaveLength(1);
  });

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
      subscribeToSource({ source, subscriber, next: (value) => subscriber.next(value) });
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
      subscribeToSource({
        source: new Observable<number>((sourceSubscriber) => sourceSubscriber.error(failure)),
        subscriber,
        next: (value) => subscriber.next(value),
      });
    }).subscribe({
      error: (error) => results.push(error as Error),
      complete: () => results.push('complete'),
    });

    expect(results).toEqual([failure]);

    new Observable<number>((subscriber) => {
      subscribeToSource({
        source: new Observable<number>((sourceSubscriber) => sourceSubscriber.complete()),
        subscriber,
        next: (value) => subscriber.next(value),
      });
    }).subscribe({ complete: () => results.push('complete') });

    expect(results).toEqual([failure, 'complete']);
  });

  it('turns synchronous exceptions into stream errors', () => {
    const failure = new Error('callback failure');
    const errors: unknown[] = [];
    let result: ReturnType<typeof runWithErrorForwarding<number>> | undefined;
    const observable = new Observable<number>((subscriber) => {
      result = runWithErrorForwarding({
        subscriber,
        run: () => {
          throw failure;
        },
      });
    });

    observable.subscribe({ error: (error) => errors.push(error) });

    expect(result).toEqual({ ok: false });
    expect(errors).toEqual([failure]);
  });
});
