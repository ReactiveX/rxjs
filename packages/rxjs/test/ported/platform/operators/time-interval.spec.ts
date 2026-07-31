// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/timeInterval-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { map } from 'rxjs/map';
import { mergeMap } from 'rxjs/merge-map';
import { timeInterval, TimeInterval } from 'rxjs/time-interval';
describe('timeInterval (platform)', () => {
  it('should record the time interval between source elements', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions, now: virtualNow }) => {
      const e1 = hot('--a--^b-c-----d--e--|');
      const e1subs = '     ^--------------!';
      const expected = '   -w-x-----y--z--|';
      const expectedValue = { w: 1, x: 2, y: 6, z: 3 };
      const result = e1[timeInterval]({ now: virtualNow })[map]((x) => x.interval);
      expectObservable(result).toBe(expected, expectedValue);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should record interval if source emit elements', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions, now: virtualNow }) => {
      const e1 = hot('--a--^b--c----d---e--|');
      const e1subs = '     ^---------------!';
      const expected = '   -w--x----y---z--|';
      const expectedValue = {
        w: new TimeInterval('b', 1),
        x: new TimeInterval('c', 3),
        y: new TimeInterval('d', 5),
        z: new TimeInterval('e', 4),
      };
      expectObservable(e1[timeInterval]({ now: virtualNow })).toBe(expected, expectedValue);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should completes without record interval if source does not emits', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions, now: virtualNow }) => {
      const e1 = hot('  ---------|');
      const e1subs = '  ^--------!';
      const expected = '---------|';
      expectObservable(e1[timeInterval]({ now: virtualNow })).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should complete immediately if source is empty', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions, now: virtualNow }) => {
      const e1 = observable(' |   ');
      const e1subs = '  (^!)';
      const expected = '|   ';
      expectObservable(e1[timeInterval]({ now: virtualNow })).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should record interval then does not completes if source emits but not completes', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions, now: virtualNow }) => {
      const e1 = hot('  -a--b--');
      const e1subs = '^------!';
      const expected = '-y--z--';
      const expectedValue = {
        y: new TimeInterval('a', 1),
        z: new TimeInterval('b', 3),
      };
      expectObservable(e1[timeInterval]({ now: virtualNow }), '^------!').toBe(expected, expectedValue);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should allow unsubscribing explicitly and early', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions, now: virtualNow }) => {
      const e1 = hot('  -a--b-----c---d---|');
      const unsub = '   -------!           ';
      const e1subs = '  ^------!           ';
      const expected = '-y--z---           ';
      const expectedValue = {
        y: new TimeInterval('a', 1),
        z: new TimeInterval('b', 3),
      };
      const result = e1[timeInterval]({ now: virtualNow });
      expectObservable(result, unsub).toBe(expected, expectedValue);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not break unsubscription chains when result is unsubscribed explicitly', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions, now: virtualNow }) => {
      const e1 = hot('  -a--b-----c---d---|');
      const e1subs = '  ^------!           ';
      const expected = '-y--z---           ';
      const unsub = '   -------!           ';
      const expectedValue = {
        y: new TimeInterval('a', 1),
        z: new TimeInterval('b', 3),
      };
      const result = e1[mergeMap]((x) => Observable.from([x]))
        [timeInterval]({ now: virtualNow })
        [mergeMap]((x) => Observable.from([x]));
      expectObservable(result, unsub).toBe(expected, expectedValue);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not completes if source never completes', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions, now: virtualNow }) => {
      const e1 = observable(' -');
      const e1subs = '^!';
      const expected = '-';
      expectObservable(e1[timeInterval]({ now: virtualNow }), '^!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('raise error if source raises error', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions, now: virtualNow }) => {
      const e1 = hot('  ---#');
      const e1subs = '  ^--!';
      const expected = '---#';
      expectObservable(e1[timeInterval]({ now: virtualNow })).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should record interval then raise error if source raises error after emit', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions, now: virtualNow }) => {
      const e1 = hot('  -a--b--#');
      const e1subs = '  ^------!';
      const expected = '-y--z--#';
      const expectedValue = {
        y: new TimeInterval('a', 1),
        z: new TimeInterval('b', 3),
      };
      expectObservable(e1[timeInterval]({ now: virtualNow })).toBe(expected, expectedValue);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should raise error if source immediately throws', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions, now: virtualNow }) => {
      const e1 = observable(' #   ');
      const e1subs = '  (^!)';
      const expected = '#   ';
      expectObservable(e1[timeInterval]({ now: virtualNow })).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
});
