// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/materialize-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { map } from 'rxjs/map';
import { materialize } from 'rxjs/materialize';
import { mergeMap } from 'rxjs/merge-map';
import { Notification } from 'rxjs/notification';
describe('materialize (platform)', () => {
  it('should materialize an Observable', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --x--y--z--|   ');
      const e1subs = '  ^----------!   ';
      const expected = '--a--b--c--(d|)';
      const values = { a: '{x}', b: '{y}', c: '{z}', d: '|' };
      const result = e1[materialize]()[map]((x) => {
        if (x.kind === 'C') {
          return '|';
        } else {
          return '{' + x.value + '}';
        }
      });
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should materialize a happy stream', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--|   ');
      const e1subs = '  ^----------!   ';
      const expected = '--w--x--y--(z|)';
      const expectedValue = {
        w: Notification.createNext('a'),
        x: Notification.createNext('b'),
        y: Notification.createNext('c'),
        z: Notification.createComplete(),
      };
      expectObservable(e1[materialize]()).toBe(expected, expectedValue);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should materialize a sad stream', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--#   ');
      const e1subs = '  ^----------!   ';
      const expected = '--w--x--y--(z|)';
      const expectedValue = {
        w: Notification.createNext('a'),
        x: Notification.createNext('b'),
        y: Notification.createNext('c'),
        z: Notification.createError('error'),
      };
      expectObservable(e1[materialize]()).toBe(expected, expectedValue);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should allow unsubscribing explicitly and early', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--|');
      const e1subs = '  ^-----!     ';
      const expected = '--w--x-     ';
      const unsub = '   ------!     ';
      const expectedValue = {
        w: Notification.createNext('a'),
        x: Notification.createNext('b'),
      };
      expectObservable(e1[materialize](), unsub).toBe(expected, expectedValue);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not break unsubscription chains when result is unsubscribed explicitly', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--|');
      const e1subs = '  ^-----!     ';
      const expected = '--w--x-     ';
      const unsub = '   ------!     ';
      const expectedValue = {
        w: Notification.createNext('a'),
        x: Notification.createNext('b'),
      };
      const result = e1[mergeMap]((x) => Observable.from([x]))
        [materialize]()
        [mergeMap]((x) => Observable.from([x]));
      expectObservable(result, unsub).toBe(expected, expectedValue);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should materialize stream that does not complete', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -');
      const e1subs = '^!';
      const expected = '-';
      expectObservable(e1[materialize](), '^!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should materialize stream that does not emit', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ----|   ');
      const e1subs = '  ^---!   ';
      const expected = '----(x|)';
      expectObservable(e1[materialize]()).toBe(expected, { x: Notification.createComplete() });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should materialize empty stream', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' |   ');
      const e1subs = '  (^!)';
      const expected = '(x|)';
      expectObservable(e1[materialize]()).toBe(expected, { x: Notification.createComplete() });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should materialize stream that throws', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' #   ');
      const e1subs = '  (^!)';
      const expected = '(x|)';
      expectObservable(e1[materialize]()).toBe(expected, { x: Notification.createError('error') });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
});
