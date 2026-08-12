// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/delay-spec.ts
import { describe, expect, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { concat } from 'rxjs/concat';
import { delay } from 'rxjs/delay';
import { mergeMap } from 'rxjs/merge-map';
describe('delay (platform)', () => {
  it('should delay by specified timeframe', async () => {
    await rxTest(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ---a--b--|');
      const e1subs = '  ^--------!';
      const t = time('     --|    ');
      //                      --|
      const expected = '-----a--b|';
      const result = e1[delay](t);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not delay at all if the delay number is negative', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ---a--b--|');
      const e1subs = '  ^--------!';
      const t = -1;
      const expected = '---a--b--|';
      const result = e1[delay](t);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should delay by absolute time period', async () => {
    await rxTest(({ hot, time, expectObservable, expectSubscriptions, now: virtualNow }) => {
      const e1 = hot('  --a--a---a----a----a------------b---b---b---b--|');
      const e1subs = '  ^----------------------------------------------!';
      const t = time('  --------------------|                           ');
      const expected = '--------------------(aaaaa)-----b---b---b---b--|';
      const absoluteDelay = new Date(virtualNow() + t);
      const result = e1[delay](absoluteDelay);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not delay at all if the absolute time is in the past', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions, now: virtualNow }) => {
      const e1 = hot('  --a--a---a----a----a------------b---b---b---b--|');
      const e1subs = '  ^----------------------------------------------!';
      const t = -10000;
      const expected = '--a--a---a----a----a------------b---b---b---b--|';
      const absoluteDelay = new Date(virtualNow() + t);
      const result = e1[delay](absoluteDelay);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should delay by absolute time period after source ends', async () => {
    await rxTest(({ hot, time, expectObservable, expectSubscriptions, now: virtualNow }) => {
      const e1 = hot('---^--a-----a---a-----a---|             ');
      const e1subs = '   ^----------------------!             ';
      const t = time('   ------------------------------|      ');
      const expected = ' ------------------------------(aaaa|)';
      const absoluteDelay = new Date(virtualNow() + t);
      const result = e1[delay](absoluteDelay);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should raise error when source raises error', async () => {
    await rxTest(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ---a---b---#');
      const e1subs = '  ^----------!';
      const t = time('     ---|     ');
      //                       ---|
      const expected = '------a---b#';
      const result = e1[delay](t);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should raise error when source raises error before absolute delay fires', async () => {
    await rxTest(({ hot, time, expectObservable, expectSubscriptions, now: virtualNow }) => {
      const e1 = hot('  --a--a---a-----#     ');
      const e1subs = '  ^--------------!     ';
      const t = time('  --------------------|');
      const expected = '---------------#     ';
      const absoluteDelay = new Date(virtualNow() + t);
      const result = e1[delay](absoluteDelay);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should raise error when source raises error after absolute delay fires', async () => {
    await rxTest(({ hot, time, expectObservable, expectSubscriptions, now: virtualNow }) => {
      const e1 = hot('---^---a--a---a---a--------b---b---b--#');
      const e1subs = '   ^----------------------------------!';
      const t = time('   -----------------|                  ');
      const expected = ' -----------------(aaaa)-b---b---b--#';
      const absoluteDelay = new Date(virtualNow() + t);
      const result = e1[delay](absoluteDelay);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should delay when source does not emit', async () => {
    await rxTest(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ----|');
      const e1subs = '  ^---!';
      const t = time('  ---| ');
      const expected = '----|';
      const result = e1[delay](t);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not delay when source is empty', async () => {
    await rxTest(({ observable, time, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' |   ');
      const e1subs = '  (^!)';
      const t = time('  ---|');
      const expected = '|   ';
      const result = e1[delay](t);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should delay complete when a value is scheduled', async () => {
    await rxTest(({ observable, time, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' -a-|    ');
      const e1subs = '  ^--!    ';
      const t = time('   ---|   ');
      const expected = '----(a|)';
      const result = e1[delay](t);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not complete when source does not complete', async () => {
    await rxTest(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ---a---b---------');
      const e1subs = '  ^---------------!';
      const t = time('     ---|          ');
      //                       ---|
      const expected = '------a---b------';
      const unsub = '   ----------------!';
      const result = e1[delay](t);
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not break unsubscription chains when result is unsubscribed explicitly', async () => {
    await rxTest(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ---a---b----');
      const e1subs = '  ^-------!   ';
      const t = time('     ---|     ');
      //                       ---|
      const expected = '------a--   ';
      const unsub = '   --------!   ';
      const result = e1[mergeMap]((x) => Observable.from([x]))
        [delay](t)
        [mergeMap]((x) => Observable.from([x]));
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not complete when source never completes', async () => {
    await rxTest(({ observable, time, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' -   ');
      const e1subs = '^!';
      const t = time('  ---|');
      const expected = '-   ';
      const result = e1[delay](t);
      expectObservable(result, '^!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should unsubscribe scheduled actions after execution', async () => {
    await rxTest(async ({ flush, now, schedule }) => {
      const sourceSignals = [];
      const cancelledEvents = [];
      const completedEvents = [];
      const source = new Observable((subscriber) => {
        sourceSignals.push(subscriber.signal);
        subscriber.next('a');
        subscriber.complete();
      });
      const cancellation = new AbortController();
      source[delay](2).subscribe(
        {
          next: (value) => cancelledEvents.push([now(), 'N', value]),
          complete: () => cancelledEvents.push([now(), 'C']),
        },
        { signal: cancellation.signal }
      );
      schedule(() => cancellation.abort(), 1);
      source[delay](2).subscribe({
        next: (value) => completedEvents.push([now(), 'N', value]),
        complete: () => completedEvents.push([now(), 'C']),
      });
      await flush();
      expect(cancelledEvents).toEqual([]);
      expect(completedEvents).toEqual([
        [2, 'N', 'a'],
        [2, 'C'],
      ]);
      expect(cancellation.signal.aborted).toBe(true);
      expect(sourceSignals.every((signal) => signal.aborted)).toBe(true);
    });
  });
  it('should be possible to delay complete by composition', async () => {
    await rxTest(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ---a--b---|  ');
      const e1subs = '  ^---------!  ';
      const t = time('     --|       ');
      //                      --|
      //                          --|
      const expected = '-----a--b---|';
      const result = Observable[concat]([
        e1[delay](t),
        Observable.from([undefined])
          [delay](t)
          [mergeMap](() => Observable.from([])),
      ]);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
});
