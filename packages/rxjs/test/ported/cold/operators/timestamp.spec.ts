// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/timestamp-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { ColdObservable } from 'rxjs/cold-observable';
import { map } from 'rxjs/map';
import { mergeMap } from 'rxjs/merge-map';
import { timestamp } from 'rxjs/timestamp';
describe('timestamp (cold)', () => {
  it('should record the time stamp per each source elements', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions, now: virtualNow }) => {
      const e1 = hot('  -b-c-----d--e--|');
      const e1subs = '  ^--------------!';
      const expected = '-w-x-----y--z--|';
      const expectedValue = { w: 1, x: 3, y: 9, z: 12 };
      const result = e1[timestamp]({ now: virtualNow })[map]((x) => x.timestamp);
      expectObservable(result).toBe(expected, expectedValue);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should record stamp if source emit elements', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions, now: virtualNow }) => {
      const e1 = hot('--a--^b--c----d---e--|');
      const e1subs = '     ^---------------!';
      const expected = '   -w--x----y---z--|';
      const expectedValue = {
        w: { value: 'b', timestamp: 1 },
        x: { value: 'c', timestamp: 4 },
        y: { value: 'd', timestamp: 9 },
        z: { value: 'e', timestamp: 13 },
      };
      expectObservable(e1[timestamp]({ now: virtualNow })).toBe(expected, expectedValue);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should completes without record stamp if source does not emits', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions, now: virtualNow }) => {
      const e1 = hot('  ---------|');
      const e1subs = '  ^--------!';
      const expected = '---------|';
      expectObservable(e1[timestamp]({ now: virtualNow })).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should complete immediately if source is empty', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions, now: virtualNow }) => {
      const e1 = cold(' |   ');
      const e1subs = '  (^!)';
      const expected = '|   ';
      expectObservable(e1[timestamp]({ now: virtualNow })).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should record stamp then does not completes if source emits but not completes', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions, now: virtualNow }) => {
      const e1 = hot('  -a--b--');
      const e1subs = '^------!';
      const expected = '-y--z--';
      const expectedValue = {
        y: { value: 'a', timestamp: 1 },
        z: { value: 'b', timestamp: 4 },
      };
      expectObservable(e1[timestamp]({ now: virtualNow }), '^------!').toBe(expected, expectedValue);
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
        y: { value: 'a', timestamp: 1 },
        z: { value: 'b', timestamp: 4 },
      };
      const result = e1[timestamp]({ now: virtualNow });
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
        y: { value: 'a', timestamp: 1 },
        z: { value: 'b', timestamp: 4 },
      };
      const result = e1[mergeMap]((x) => ColdObservable.from([x]))
        [timestamp]({ now: virtualNow })
        [mergeMap]((x) => ColdObservable.from([x]));
      expectObservable(result, unsub).toBe(expected, expectedValue);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not completes if source never completes', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions, now: virtualNow }) => {
      const e1 = cold(' -');
      const e1subs = '^!';
      const expected = '-';
      expectObservable(e1[timestamp]({ now: virtualNow }), '^!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('raise error if source raises error', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions, now: virtualNow }) => {
      const e1 = hot('  ---#');
      const e1subs = '  ^--!';
      const expected = '---#';
      expectObservable(e1[timestamp]({ now: virtualNow })).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should record stamp then raise error if source raises error after emit', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions, now: virtualNow }) => {
      const e1 = hot('  -a--b--#');
      const e1subs = '  ^------!';
      const expected = '-y--z--#';
      const expectedValue = {
        y: { value: 'a', timestamp: 1 },
        z: { value: 'b', timestamp: 4 },
      };
      expectObservable(e1[timestamp]({ now: virtualNow })).toBe(expected, expectedValue);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should raise error if source immediately throws', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions, now: virtualNow }) => {
      const e1 = cold(' #   ');
      const e1subs = '  (^!)';
      const expected = '#   ';
      expectObservable(e1[timestamp]({ now: virtualNow })).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
});
