import { beforeAll, describe, expect, expectTypeOf, it } from 'vitest';
import '@rxjs/observable-polyfill';
import type { Notification, ObservableNotification } from './notification.js';

type MaterializeSymbol = typeof import('./materialize.js').materialize;
type DematerializeSymbol = typeof import('./dematerialize.js').dematerialize;

let materialize: MaterializeSymbol;
let dematerialize: DematerializeSymbol;

beforeAll(async () => {
  ({ materialize } = await import('./materialize.js'));
  ({ dematerialize } = await import('./dematerialize.js'));
});

describe('materialize and dematerialize', () => {
  it('install exact unique Symbols without string-named methods', () => {
    expect(materialize.description).toBe('materialize');
    expect(dematerialize.description).toBe('dematerialize');
    expect(Symbol.keyFor(materialize)).toBeUndefined();
    expect(Symbol.keyFor(dematerialize)).toBeUndefined();
    expect('materialize' in Observable.prototype).toBe(false);
    expect('dematerialize' in Observable.prototype).toBe(false);
  });

  it('materializes next and completion notifications before completing', () => {
    const events: Array<Notification<number> | 'complete'> = [];
    const source = new Observable<number>((subscriber) => {
      subscriber.next(1);
      subscriber.next(2);
      subscriber.complete();
    });
    const result = source[materialize]();

    expectTypeOf(result).toEqualTypeOf<Observable<Notification<number> & ObservableNotification<number>>>();
    result.subscribe({
      next: (notification) => events.push(notification),
      complete: () => events.push('complete'),
    });

    expect(events.map(toShape)).toEqual([
      { kind: 'N', value: 1, hasValue: true },
      { kind: 'N', value: 2, hasValue: true },
      { kind: 'C', hasValue: false },
      'complete',
    ]);
  });

  it('materializes an error as a next notification and then completes', () => {
    const failure = new Error('failed');
    const events: unknown[] = [];
    const source = new Observable<number>((subscriber) => subscriber.error(failure));

    source[materialize]().subscribe({
      next: (notification) => events.push(toShape(notification)),
      error: (error) => events.push(['unexpected error', error]),
      complete: () => events.push('complete'),
    });

    expect(events).toEqual([{ kind: 'E', error: failure, hasValue: false }, 'complete']);
  });

  it('dematerializes notification shapes and cancels upstream on terminal notifications', () => {
    const produced: string[] = [];
    const events: unknown[] = [];
    const source = new Observable<ObservableNotification<number>>((subscriber) => {
      for (const notification of [
        { kind: 'N' as const, value: 1 },
        { kind: 'C' as const },
        { kind: 'N' as const, value: 2 },
      ]) {
        if (!subscriber.active) {
          break;
        }
        produced.push(notification.kind);
        subscriber.next(notification);
      }
    });
    const result = source[dematerialize]();

    expectTypeOf(result).toEqualTypeOf<Observable<number>>();
    result.subscribe({
      next: (value) => events.push(value),
      complete: () => events.push('complete'),
    });

    expect(events).toEqual([1, 'complete']);
    expect(produced).toEqual(['N', 'C']);
  });

  it('forwards error notifications and invalid notification shapes', () => {
    const failure = new Error('notification failed');
    const errors: unknown[] = [];
    Observable.from<ObservableNotification<never>>([{ kind: 'E', error: failure }])
      [dematerialize]()
      .subscribe({ error: (error) => errors.push(error) });

    Observable.from([{} as ObservableNotification<never>])
      [dematerialize]()
      .subscribe({ error: (error) => errors.push(error) });

    expect(errors[0]).toBe(failure);
    expect(errors[1]).toBeInstanceOf(TypeError);
  });

  it('round-trips values and terminal state with shared cancellation and restart', () => {
    let activations = 0;
    let sourceSubscriber: Subscriber<number> | undefined;
    const source = new Observable<number>((subscriber) => {
      activations++;
      sourceSubscriber = subscriber;
    });
    const result = source[materialize]()[dematerialize]();
    const firstController = new AbortController();
    const secondController = new AbortController();
    const first: number[] = [];
    const second: number[] = [];

    result.subscribe((value) => first.push(value), { signal: firstController.signal });
    result.subscribe((value) => second.push(value), { signal: secondController.signal });
    expect(activations).toBe(1);

    sourceSubscriber!.next(1);
    firstController.abort();
    sourceSubscriber!.next(2);
    secondController.abort();

    result.subscribe(() => {});
    expect(activations).toBe(2);
    expect(first).toEqual([1]);
    expect(second).toEqual([1, 2]);
  });
});

function toShape(value: Notification<unknown> | 'complete'): unknown {
  if (value === 'complete') {
    return value;
  }
  return value.kind === 'N'
    ? { kind: value.kind, value: value.value, hasValue: value.hasValue }
    : value.kind === 'E'
      ? { kind: value.kind, error: value.error, hasValue: value.hasValue }
      : { kind: value.kind, hasValue: value.hasValue };
}
