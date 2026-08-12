// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/sample-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { mergeMap } from 'rxjs/merge-map';
import { sample } from 'rxjs/sample';
describe('sample (platform)', () => {
  it('should get samples when the notifier emits', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ---a----b---c----------d-----|   ');
      const e1subs = '  ^----------------------------!   ';
      const e2 = hot('  -----x----------x---x------x---| ');
      const e2subs = '  ^----------------------------!   ';
      const expected = '-----a----------c----------d-|   ';
      expectObservable(e1[sample](e2)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should sample nothing if source has not nexted at all', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('----a-^------------|');
      const e1subs = '      ^------------!';
      const e2 = hot('      -----x-------|');
      const e2subs = '      ^------------!';
      const expected = '    -------------|';
      expectObservable(e1[sample](e2)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should sample nothing if source has nexted after all notifications, but notifier does not complete', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ----a-^------b-----|');
      const e1subs = '        ^------------!';
      const e2 = hot('        -----x--------');
      const e2subs = '        ^------------!';
      const expected = '      -------------|';
      expectObservable(e1[sample](e2)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should not sample when the notifier completes', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ----a-^------b----------|');
      const e1subs = '        ^-----------------!';
      const e2 = hot('        -----x-----|       ');
      const e2subs = '        ^----------!       ';
      const expected = '      ------------------|';
      expectObservable(e1[sample](e2)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should not complete when the notifier completes, nor should it emit', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ----a----b----c----d----e----f----');
      const e1subs = '^---------------------------------!';
      const e2 = hot('  ------x-|                         ');
      const e2subs = '  ^-------!                         ';
      const expected = '------a---------------------------';
      expectObservable(e1[sample](e2), '^---------------------------------!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should complete only when the source completes, if notifier completes early', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ----a----b----c----d----e----f---|');
      const e1subs = '  ^--------------------------------!';
      const e2 = hot('  ------x-|                         ');
      const e2subs = '  ^-------!                         ';
      const expected = '------a--------------------------|';
      expectObservable(e1[sample](e2)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should allow unsubscribing explicitly and early', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ----a-^--b----c----d----e----f----|          ');
      const unsub = '         --------------!                        ';
      const e1subs = '        ^-------------!                        ';
      const e2 = hot('        -----x----------x----------x----------|');
      const e2subs = '        ^-------------!                        ';
      const expected = '      -----b---------                        ';
      expectObservable(e1[sample](e2), unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should not break unsubscription chains when result is unsubscribed explicitly', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ----a-^--b----c----d----e----f----|          ');
      const e1subs = '        ^-------------!                        ';
      const e2 = hot('        -----x----------x----------x----------|');
      const e2subs = '        ^-------------!                        ';
      const expected = '      -----b---------                        ';
      const unsub = '         --------------!                        ';
      const result = e1[mergeMap]((x) => Observable.from([x]))
        [sample](e2)
        [mergeMap]((x) => Observable.from([x]));
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should only sample when a new value arrives, even if it is the same value', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ----a----b----c----c----e----f----|  ');
      const e1subs = '  ^---------------------------------!  ';
      const e2 = hot('  ------x-x------xx-x---x----x--------|');
      const e2subs = '  ^---------------------------------!  ';
      const expected = '------a--------c------c----e------|  ';
      expectObservable(e1[sample](e2)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should raise error if source raises error', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ----a-^--b----c----d----#                    ');
      const e1subs = '        ^-----------------!                    ';
      const e2 = hot('        -----x----------x----------x----------|');
      const e2subs = '        ^-----------------!                    ';
      const expected = '      -----b----------d-#                    ';
      expectObservable(e1[sample](e2)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should completes if source does not emits', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  |              ');
      const e2 = hot('  ------x-------|');
      const expected = '|              ';
      const e1subs = '  (^!)           ';
      const e2subs = '  (^!)           ';
      expectObservable(e1[sample](e2)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should raise error if source throws immediately', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  #              ');
      const e2 = hot('  ------x-------|');
      const expected = '#              ';
      const e1subs = '  (^!)           ';
      const e2subs = '  (^!)           ';
      expectObservable(e1[sample](e2)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should raise error if notification raises error', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a-----|');
      const e2 = hot('  ----#    ');
      const expected = '----#    ';
      const e1subs = '  ^---!    ';
      const e2subs = '  ^---!    ';
      expectObservable(e1[sample](e2)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should not completes if source does not complete', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ---------------');
      const e1subs = '^--------------!';
      const e2 = hot('  ------x-------|');
      const e2subs = '  ^-------------!';
      const expected = '---------------';
      expectObservable(e1[sample](e2), '^--------------!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should sample only until source completes', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ----a----b----c----d-|              ');
      const e1subs = '  ^--------------------!              ';
      const e2 = hot('  -----------x----------x------------|');
      const e2subs = '  ^--------------------!              ';
      const expected = '-----------b---------|              ';
      expectObservable(e1[sample](e2)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should complete sampling if sample observable completes', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ----a----b----c----d-|');
      const e1subs = '  ^--------------------!';
      const e2 = hot('  |                     ');
      const e2subs = '  (^!)                  ';
      const expected = '---------------------|';
      expectObservable(e1[sample](e2)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
});
