import { beforeAll, describe, expect, expectTypeOf, it } from 'vitest';
import '@rxjs/observable-polyfill';

type NotificationModule = typeof import('./notification.js');

let Notification: NotificationModule['Notification'];
let NotificationKind: NotificationModule['NotificationKind'];
let COMPLETE_NOTIFICATION: NotificationModule['COMPLETE_NOTIFICATION'];
let nextNotification: NotificationModule['nextNotification'];
let errorNotification: NotificationModule['errorNotification'];
let observeNotification: NotificationModule['observeNotification'];

beforeAll(async () => {
  ({ Notification, NotificationKind, COMPLETE_NOTIFICATION, nextNotification, errorNotification, observeNotification } =
    await import('./notification.js'));
});

describe('Notification', () => {
  it('creates next, error, and shared complete class notifications', () => {
    const next = Notification.createNext('value');
    const error = Notification.createError('failure');
    const firstComplete = Notification.createComplete();
    const secondComplete = Notification.createComplete();

    expect(next).toMatchObject({ kind: 'N', value: 'value', error: undefined, hasValue: true });
    expect(error).toMatchObject({ kind: 'E', value: undefined, error: 'failure', hasValue: false });
    expect(firstComplete).toMatchObject({ kind: 'C', value: undefined, error: undefined, hasValue: false });
    expect(firstComplete).toBe(secondComplete);
    expect(Notification.createNext('value')).not.toBe(next);
    expect(Notification.createError('failure')).not.toBe(error);
    expect(NotificationKind).toEqual({ NEXT: 'N', ERROR: 'E', COMPLETE: 'C' });
  });

  it('dispatches through observe, do, and accept without requiring every handler', () => {
    const events: unknown[] = [];

    Notification.createNext(1).observe({ next: (value) => events.push(['observe', value]) });
    Notification.createError('failure').do(
      () => {},
      (error) => events.push(['do', error])
    );
    Notification.createComplete().accept({ complete: () => events.push(['accept']) });
    Notification.createError('ignored').observe({});

    expect(events).toEqual([
      ['observe', 1],
      ['do', 'failure'],
      ['accept'],
    ]);
  });

  it('converts each notification kind to an Observable', () => {
    const nextEvents: unknown[] = [];
    const errorEvents: unknown[] = [];
    const completeEvents: unknown[] = [];

    Notification.createNext(1)
      .toObservable()
      .subscribe({
        next: (value) => nextEvents.push(value),
        complete: () => nextEvents.push('complete'),
      });
    Notification.createError('failure')
      .toObservable()
      .subscribe({ error: (error) => errorEvents.push(error) });
    Notification.createComplete()
      .toObservable()
      .subscribe({ complete: () => completeEvents.push('complete') });

    expect(nextEvents).toEqual([1, 'complete']);
    expect(errorEvents).toEqual(['failure']);
    expect(completeEvents).toEqual(['complete']);
  });

  it('rejects an unknown kind in toObservable', () => {
    const invalid = new Notification('unknown' as 'N');
    expect(() => invalid.toObservable()).toThrow('Unexpected notification kind unknown');
  });

  it('exports lightweight notification factories and validates observed shapes', () => {
    const next = nextNotification(1);
    const error = errorNotification('failure');
    const events: unknown[] = [];

    observeNotification(next, { next: (value) => events.push(value) });
    observeNotification(error, { error: (value) => events.push(value) });
    observeNotification(COMPLETE_NOTIFICATION, { complete: () => events.push('complete') });

    expect(next).toEqual({ kind: 'N', value: 1 });
    expect(error).toEqual({ kind: 'E', error: 'failure' });
    expect(COMPLETE_NOTIFICATION).toEqual({ kind: 'C' });
    expect(Object.isFrozen(COMPLETE_NOTIFICATION)).toBe(true);
    expect(events).toEqual([1, 'failure', 'complete']);
    expect(() => observeNotification({} as never, {})).toThrow('Invalid notification');
    expectTypeOf(next).toEqualTypeOf<{ readonly kind: 'N'; readonly value: number }>();
  });
});
