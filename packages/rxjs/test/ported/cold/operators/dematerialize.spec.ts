// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/dematerialize-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { ColdObservable } from 'rxjs/cold-observable';
import { dematerialize } from 'rxjs/dematerialize';
import { map } from 'rxjs/map';
import { materialize } from 'rxjs/materialize';
import { mergeMap } from 'rxjs/merge-map';
import { Notification } from 'rxjs/notification';
describe('dematerialize (cold)', () => {
  it('should dematerialize an Observable', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const values = {
        a: '{x}',
        b: '{y}',
        c: '{z}',
        d: '|',
      };
      const e1 = hot('  --a--b--c--d-|', values);
      const e1subs = '  ^----------!  ';
      const expected = '--x--y--z--|  ';
      const result = e1[map]((x) => {
        if (x === '|') {
          return Notification.createComplete();
        } else {
          return Notification.createNext(x.replace('{', '').replace('}', ''));
        }
      })[dematerialize]();
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should dematerialize a happy stream', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const values = {
        a: Notification.createNext('w'),
        b: Notification.createNext('x'),
        c: Notification.createNext('y'),
        d: Notification.createComplete(),
      };
      const e1 = hot('  --a--b--c--d--|', values);
      const e1subs = '  ^----------!   ';
      const expected = '--w--x--y--|   ';
      expectObservable(e1[dematerialize]()).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should dematerialize a sad stream', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const values = {
        a: Notification.createNext('w'),
        b: Notification.createNext('x'),
        c: Notification.createNext('y'),
        d: Notification.createError('error'),
      };
      const e1 = hot('  --a--b--c--d--|', values);
      const e1subs = '  ^----------!   ';
      const expected = '--w--x--y--#   ';
      expectObservable(e1[dematerialize]()).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should dematerialize stream does not completes', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('------');
      const e1subs = '^-----!';
      const expected = '                           -';
      expectObservable(e1[dematerialize](), '^-----!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should dematerialize stream never completes', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('-');
      const e1subs = '^!';
      const expected = '                            -';
      expectObservable(e1[dematerialize](), '^!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should dematerialize stream does not emit', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('----|');
      const e1subs = '                             ^---!';
      const expected = '                           ----|';
      expectObservable(e1[dematerialize]()).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should dematerialize empty stream', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('|   ');
      const e1subs = '                              (^!)';
      const expected = '                            |   ';
      expectObservable(e1[dematerialize]()).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should dematerialize stream throws', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const error = 'error';
      const e1 = hot('  (x|)', { x: Notification.createError(error) });
      const e1subs = '  (^!)';
      const expected = '#   ';
      expectObservable(e1[dematerialize]()).toBe(expected, null, error);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should allow unsubscribing early and explicitly', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const values = {
        a: Notification.createNext('w'),
        b: Notification.createNext('x'),
      };
      const e1 = hot('  --a--b--c--d--|', values);
      const e1subs = '  ^------!       ';
      const expected = '--w--x--       ';
      const unsub = '   -------!       ';
      const result = e1[dematerialize]();
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not break unsubscription chains when unsubscribed explicitly', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const values = {
        a: Notification.createNext('w'),
        b: Notification.createNext('x'),
      };
      const e1 = hot('  --a--b--c--d--|', values);
      const e1subs = '  ^------!       ';
      const expected = '--w--x--       ';
      const unsub = '   -------!       ';
      const result = e1[mergeMap]((x) => ColdObservable.from([x]))
        [dematerialize]()
        [mergeMap]((x) => ColdObservable.from([x]));
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should dematerialize and completes when stream completes with complete notification', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ----(a|)', { a: Notification.createComplete() });
      const e1subs = '  ^---!   ';
      const expected = '----|   ';
      expectObservable(e1[dematerialize]()).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should dematerialize and completes when stream emits complete notification', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ----a--|', { a: Notification.createComplete() });
      const e1subs = '  ^---!   ';
      const expected = '----|   ';
      expectObservable(e1[dematerialize]()).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should work with materialize', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ----a--b---c---d---e----f--|');
      const e1subs = '  ^--------------------------!';
      const expected = '----a--b---c---d---e----f--|';
      const result = e1[materialize]()[dematerialize]();
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
});
