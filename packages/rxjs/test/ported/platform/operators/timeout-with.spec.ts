// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/timeoutWith-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { mergeMap } from 'rxjs/merge-map';
import { timeout } from 'rxjs/timeout';
describe('timeoutWith (platform)', () => {
  it('should timeout after a specified period then subscribe to the passed observable', async () => {
    await rxTest(({ observable, time, expectObservable, expectSubscriptions }) => {
      const source = observable('  -------a--b--|');
      const sourceSubs = '   ^----!        ';
      const t = time('       -----|');
      const switchTo = observable('     x-y-z-|  ');
      const switchToSubs = ' -----^-----!  ';
      const expected = '     -----x-y-z-|  ';
      const result = source[timeout]({ each: t, with: () => switchTo, meta: null });
      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      expectSubscriptions(switchTo.subscriptions).toBe(switchToSubs);
    });
  });
  it('should timeout at a specified date then subscribe to the passed observable', async () => {
    await rxTest(({ observable, time, expectObservable, expectSubscriptions }) => {
      const source = observable('  -');
      const sourceSubs = '   ^---------!           ';
      const t = time('       ----------|');
      const switchTo = observable('          --x--y--z--|');
      const switchToSubs = ' ----------^----------!';
      const expected = '     ------------x--y--z--|';
      // The the current frame is zero.
      const result = source[timeout]({ first: new Date(t), with: () => switchTo, meta: null });
      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      expectSubscriptions(switchTo.subscriptions).toBe(switchToSubs);
    });
  });
  it('should timeout after a specified period between emit then subscribe to the passed observable when source emits', async () => {
    await rxTest(({ hot, observable, time, expectObservable, expectSubscriptions }) => {
      const source = hot('  ---a---b------c---|');
      const t = time('             ----|       ');
      const sourceSubs = '  ^----------!       ';
      const switchTo = observable('          -x-y-|  ');
      const switchToSubs = '-----------^----!  ';
      const expected = '    ---a---b----x-y-|  ';
      const result = source[timeout]({ each: t, with: () => switchTo, meta: null });
      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      expectSubscriptions(switchTo.subscriptions).toBe(switchToSubs);
    });
  });
  it('should allow unsubscribing explicitly and early', async () => {
    await rxTest(({ hot, observable, time, expectObservable, expectSubscriptions }) => {
      const source = hot('  ---a---b-----c----|');
      const t = time('             ----|       ');
      const sourceSubs = '  ^----------!       ';
      const switchTo = observable('          -x---y| ');
      const switchToSubs = '-----------^--!    ';
      const expected = '    ---a---b----x--    ';
      const unsub = '       --------------!    ';
      const result = source[timeout]({ each: t, with: () => switchTo, meta: null });
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      expectSubscriptions(switchTo.subscriptions).toBe(switchToSubs);
    });
  });
  it('should not break unsubscription chain when unsubscribed explicitly', async () => {
    await rxTest(({ hot, observable, time, expectObservable, expectSubscriptions }) => {
      const source = hot('  ---a---b-----c----|');
      const t = time('      ----|              ');
      const sourceSubs = '  ^----------!       ';
      const switchTo = observable('          -x---y| ');
      const switchToSubs = '-----------^--!    ';
      const expected = '    ---a---b----x--    ';
      const unsub = '       --------------!    ';
      const result = source[mergeMap]((x) => Observable.from([x]))
        [timeout]({ each: t, with: () => switchTo, meta: null })
        [mergeMap]((x) => Observable.from([x]));
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      expectSubscriptions(switchTo.subscriptions).toBe(switchToSubs);
    });
  });
  it('should not subscribe to withObservable after explicit unsubscription', async () => {
    await rxTest(({ observable, time, expectObservable, expectSubscriptions }) => {
      const source = observable('---a------b------');
      const t = time('     -----|           ');
      const sourceSubs = ' ^----!           ';
      const switchTo = observable('   i---j---|   ');
      const expected = '   ---a--           ';
      const unsub = '      -----!           ';
      const result = source[mergeMap]((x) => Observable.from([x]))
        [timeout]({ each: t, with: () => switchTo, meta: null })
        [mergeMap]((x) => Observable.from([x]));
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      expectSubscriptions(switchTo.subscriptions).toBe([]);
    });
  });
  it('should timeout after a specified period then subscribe to the passed observable when source is empty', async () => {
    await rxTest(({ hot, observable, time, expectObservable, expectSubscriptions }) => {
      const source = hot('  -------------|      ');
      const t = time('      ----------|         ');
      const sourceSubs = '  ^---------!         ';
      const switchTo = observable('         ----x----|');
      const switchToSubs = '----------^--------!';
      const expected = '    --------------x----|';
      const result = source[timeout]({ each: t, with: () => switchTo, meta: null });
      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      expectSubscriptions(switchTo.subscriptions).toBe(switchToSubs);
    });
  });
  it('should timeout after a specified period between emit then never completes if other source does not complete', async () => {
    await rxTest(({ hot, observable, time, expectObservable, expectSubscriptions }) => {
      const source = hot('  --a--b--------c--d--|');
      const t = time('           ----|           ');
      const sourceSubs = '  ^--------!           ';
      const switchTo = observable('        ------------');
      const switchToSubs = '---------^-----------!';
      const expected = '    --a--b---------------';
      const result = source[timeout]({ each: t, with: () => switchTo, meta: null });
      expectObservable(result, '^--------------------!').toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      expectSubscriptions(switchTo.subscriptions).toBe(switchToSubs);
    });
  });
  it('should timeout after a specified period then subscribe to the passed observable when source raises error after timeout', async () => {
    await rxTest(({ hot, observable, time, expectObservable, expectSubscriptions }) => {
      const source = hot('  -------------#      ');
      const t = time('      ----------|         ');
      const sourceSubs = '  ^---------!         ';
      const switchTo = observable('         ----x----|');
      const switchToSubs = '----------^--------!';
      const expected = '    --------------x----|';
      const result = source[timeout]({ each: t, with: () => switchTo, meta: null });
      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      expectSubscriptions(switchTo.subscriptions).toBe(switchToSubs);
    });
  });
  it('should timeout after a specified period between emit then never completes if other source emits but not complete', async () => {
    await rxTest(({ hot, observable, time, expectObservable, expectSubscriptions }) => {
      const source = hot('  -------------|      ');
      const t = time('      -----------|        ');
      const sourceSubs = '  ^----------!        ';
      const switchTo = observable('          ----x----');
      const switchToSubs = '-----------^--------!';
      const expected = '    ---------------x----';
      const result = source[timeout]({ each: t, with: () => switchTo, meta: null });
      expectObservable(result, '^-------------------!').toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      expectSubscriptions(switchTo.subscriptions).toBe(switchToSubs);
    });
  });
  it('should not timeout if source completes within timeout period', async () => {
    await rxTest(({ hot, observable, time, expectObservable, expectSubscriptions }) => {
      const source = hot('  -----|        ');
      const t = time('      ----------|   ');
      const sourceSubs = '  ^----!        ';
      const switchTo = observable('    ----x----');
      const expected = '    -----|        ';
      const result = source[timeout]({ each: t, with: () => switchTo, meta: null });
      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      expectSubscriptions(switchTo.subscriptions).toBe([]);
    });
  });
  it('should not timeout if source raises error within timeout period', async () => {
    await rxTest(({ hot, observable, time, expectObservable, expectSubscriptions }) => {
      const source = hot('-----#              ');
      const t = time('    ----------|         ');
      const sourceSubs = '^----!              ';
      const switchTo = observable('       ----x----|');
      const expected = '  -----#              ';
      const result = source[timeout]({ each: t, with: () => switchTo, meta: null });
      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      expectSubscriptions(switchTo.subscriptions).toBe([]);
    });
  });
  it('should not timeout if source emits within timeout period', async () => {
    await rxTest(({ hot, observable, time, expectObservable, expectSubscriptions }) => {
      const source = hot('   --a--b--c--d--e--|');
      const t = time('       -----|            ');
      const sourceSubs = '   ^----------------!';
      const switchTo = observable('----x----|        ');
      const expected = '     --a--b--c--d--e--|';
      const result = source[timeout]({ each: t, with: () => switchTo, meta: null });
      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      expectSubscriptions(switchTo.subscriptions).toBe([]);
    });
  });
  it('should not timeout if source completes within specified Date', async () => {
    await rxTest(({ hot, observable, time, expectObservable, expectSubscriptions }) => {
      const source = hot('--a--b--c--d--e--|   ');
      const t = time('    --------------------|');
      const sourceSubs = '^----------------!   ';
      const switchTo = observable('--x--|            ');
      const expected = '  --a--b--c--d--e--|   ';
      // Start frame is zero.
      const result = source[timeout]({ first: new Date(t), with: () => switchTo, meta: null });
      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      expectSubscriptions(switchTo.subscriptions).toBe([]);
    });
  });
  it('should not timeout if source raises error within specified Date', async () => {
    await rxTest(({ hot, observable, time, expectObservable, expectSubscriptions }) => {
      const source = hot('---a---#           ');
      const t = time('       ----------|     ');
      const sourceSubs = '^------!           ';
      const switchTo = observable('          --x--|');
      const expected = '  ---a---#           ';
      // Start frame is zero.
      const result = source[timeout]({ first: new Date(t), with: () => switchTo, meta: null });
      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      expectSubscriptions(switchTo.subscriptions).toBe([]);
    });
  });
});
