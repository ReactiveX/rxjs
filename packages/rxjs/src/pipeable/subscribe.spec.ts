import { describe, expect, expectTypeOf, it } from 'vitest';
import { rx } from '../rx.js';
import { subscribe, type Subscription } from './subscribe.js';

describe('pipeable subscribe', () => {
  it('returns a live AbortSignal-backed cancellation handle', () => {
    let sourceSubscriber: Subscriber<number> | undefined;
    let teardowns = 0;
    const values: number[] = [];
    const source = new Observable<number>((subscriber) => {
      sourceSubscriber = subscriber;
      subscriber.addTeardown(() => teardowns++);
    });

    const subscription = subscribe<number>((value) => values.push(value))(source);
    expectTypeOf(subscription).toEqualTypeOf<Subscription>();
    expect(subscription.closed).toBe(false);

    sourceSubscriber?.next(1);
    subscription.unsubscribe();
    sourceSubscriber?.next(2);

    expect(values).toEqual([1]);
    expect(subscription.closed).toBe(true);
    expect(teardowns).toBe(1);
  });

  it('is already closed when a synchronous source completes', () => {
    const notifications: Array<number | 'complete'> = [];
    const subscription = rx(
      [1, 2],
      subscribe({
        next: (value) => notifications.push(value),
        complete: () => notifications.push('complete'),
      })
    );

    expectTypeOf(subscription).toEqualTypeOf<Subscription>();
    expect(notifications).toEqual([1, 2, 'complete']);
    expect(subscription.closed).toBe(true);
  });

  it('closes on source error after notifying the observer', () => {
    const failure = new Error('failed');
    const errors: unknown[] = [];
    const source = new Observable<number>((subscriber) => subscriber.error(failure));

    const subscription = subscribe<number>({ error: (error) => errors.push(error) })(source);

    expect(errors).toEqual([failure]);
    expect(subscription.closed).toBe(true);
  });

  it('cancels one observer without cancelling a shared source for another', () => {
    let sourceSubscriber: Subscriber<number> | undefined;
    let teardowns = 0;
    const source = new Observable<number>((subscriber) => {
      sourceSubscriber = subscriber;
      subscriber.addTeardown(() => teardowns++);
    });
    const firstValues: number[] = [];
    const secondValues: number[] = [];
    const first = subscribe<number>((value) => firstValues.push(value))(source);
    const second = subscribe<number>((value) => secondValues.push(value))(source);

    first.unsubscribe();
    sourceSubscriber?.next(1);

    expect(first.closed).toBe(true);
    expect(second.closed).toBe(false);
    expect(firstValues).toEqual([]);
    expect(secondValues).toEqual([1]);
    expect(teardowns).toBe(0);

    second.unsubscribe();
    expect(teardowns).toBe(1);
  });
});
