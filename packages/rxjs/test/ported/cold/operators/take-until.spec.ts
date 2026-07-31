// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/takeUntil-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { ColdObservable } from 'rxjs/cold-observable';
import { EMPTY } from 'rxjs/empty';
import { mergeMap } from 'rxjs/merge-map';
import { takeUntil } from 'rxjs/take-until';
describe('takeUntil (cold)', () => {
  it('should take values until notifier emits', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--d--e--f--g--|');
      const e1subs = '  ^------------!          ';
      const e2 = hot('  -------------z--|       ');
      const e2subs = '  ^------------!          ';
      const expected = '--a--b--c--d-|          ';
      expectObservable(e1[takeUntil](e2)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should take values and raises error when notifier raises error', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--d--e--f--g--|');
      const e1subs = '  ^------------!          ';
      const e2 = hot('  -------------#          ');
      const e2subs = '  ^------------!          ';
      const expected = '--a--b--c--d-#          ';
      expectObservable(e1[takeUntil](e2)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should take all values when notifier is empty', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--d--e--f--g--|');
      const e1subs = '  ^----------------------!';
      const e2 = hot('  -------------|          ');
      const e2subs = '  ^------------!          ';
      const expected = '--a--b--c--d--e--f--g--|';
      expectObservable(e1[takeUntil](e2)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should take all values when notifier does not complete', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--d--e--f--g--|');
      const e1subs = '  ^----------------------!';
      const e2 = hot('  -                       ');
      const e2subs = '  ^----------------------!';
      const expected = '--a--b--c--d--e--f--g--|';
      expectObservable(e1[takeUntil](e2)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should complete without subscribing to the source when notifier synchronously emits', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ----a--|');
      const e2 = ColdObservable.from([1, 2, 3]);
      const expected = '(|)     ';
      expectObservable(e1[takeUntil](e2)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe([]);
    });
  });
  it('should subscribe to the source when notifier synchronously completes without emitting', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ----a--|');
      const e1subs = '  ^------!';
      const e2 = EMPTY;
      const expected = '----a--|';
      expectObservable(e1[takeUntil](e2)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should allow unsubscribing explicitly and early', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--d--e--f--g--|');
      const e1subs = '  ^------!                ';
      const e2 = hot('  -------------z--|       ');
      const e2subs = '  ^------!                ';
      const unsub = '   -------!                ';
      const expected = '--a--b--                ';
      expectObservable(e1[takeUntil](e2), unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should complete when notifier emits if source observable does not complete', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -        ');
      const e1subs = '  ^-!      ';
      const e2 = hot('  --a--b--|');
      const e2subs = '  ^-!      ';
      const expected = '--|      ';
      expectObservable(e1[takeUntil](e2)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should raise error when notifier raises error if source observable does not complete', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -  ');
      const e1subs = '  ^-!';
      const e2 = hot('  --#');
      const e2subs = '  ^-!';
      const expected = '--#';
      expectObservable(e1[takeUntil](e2)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should not complete when notifier is empty if source observable does not complete', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -  ');
      const e1subs = '^--!';
      const e2 = hot('  --|');
      const e2subs = '  ^-!';
      const expected = '---';
      expectObservable(e1[takeUntil](e2), '^--!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should not complete when source and notifier do not complete', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -');
      const e1subs = '^!';
      const e2 = hot('  -');
      const e2subs = '^!';
      const expected = '-';
      expectObservable(e1[takeUntil](e2), '^!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should complete when notifier emits before source observable emits', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ----a--|');
      const e1subs = '  ^-!     ';
      const e2 = hot('  --x     ');
      const e2subs = '  ^-!     ';
      const expected = '--|     ';
      expectObservable(e1[takeUntil](e2)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should raise error if source raises error before notifier emits', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--d--#     ');
      const e1subs = '  ^-------------!     ';
      const e2 = hot('  ----------------a--|');
      const e2subs = '  ^-------------!     ';
      const expected = '--a--b--c--d--#     ';
      expectObservable(e1[takeUntil](e2)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should raise error immediately if source throws', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' #   ');
      const e1subs = '  (^!)';
      const e2 = hot('  --x ');
      const e2subs = '  (^!)';
      const expected = '#   ';
      expectObservable(e1[takeUntil](e2)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should dispose source observable if notifier emits before source emits', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ---a---|');
      const e1subs = '  ^-!     ';
      const e2 = hot('  --x-|   ');
      const e2subs = '  ^-!     ';
      const expected = '--|     ';
      expectObservable(e1[takeUntil](e2)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should dispose notifier if source observable completes', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--|     ');
      const e1subs = '  ^----!     ';
      const e2 = hot('  -------x--|');
      const e2subs = '  ^----!     ';
      const expected = '--a--|     ';
      expectObservable(e1[takeUntil](e2)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should not break unsubscription chain when unsubscribed explicitly', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--d--e--f--g--|');
      const e1subs = '  ^------!                ';
      const e2 = hot('  -------------z--|       ');
      const e2subs = '  ^------!                ';
      const unsub = '   -------!                ';
      const expected = '--a--b--                ';
      const result = e1[mergeMap]((x) => ColdObservable.from([x]))
        [takeUntil](e2)
        [mergeMap]((x) => ColdObservable.from([x]));
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
});
