// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/timeout-spec.ts
import { describe, expect, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { concat } from 'rxjs/concat';
import { mergeMap } from 'rxjs/merge-map';
import { NEVER } from 'rxjs/never';
import { timeout, TimeoutError } from 'rxjs/timeout';
describe('timeout (platform)', () => {
  it('should timeout after a specified timeout period', async () => {
    const defaultTimeoutError = new TimeoutError();
    await rxTest(({ observable, expectObservable, expectSubscriptions, time }) => {
      const e1 = observable(' -------a--b--|');
      const t = time('  -----|        ');
      const e1subs = '  ^----!        ';
      const expected = '-----#        ';
      const result = e1[timeout]({ each: t, meta: null });
      expectObservable(result).toBe(expected, null, defaultTimeoutError);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should emit and TimeoutError on timeout with appropriate due as number', async () => {
    const defaultTimeoutError = new TimeoutError();
    await rxTest(async ({ observable, time, flush: flushMarbles }) => {
      const e1 = observable('-------a--b--|');
      const t = time(' -----|');
      const result = e1[timeout]({ each: t, meta: null });
      let error;
      result.subscribe({
        next: () => {
          throw new Error('this should not next');
        },
        error: (err) => {
          error = err;
        },
        complete: () => {
          throw new Error('this should not complete');
        },
      });
      await flushMarbles();
      expect(error).toBeInstanceOf(TimeoutError);
      expect(error).toHaveProperty('name', 'TimeoutError');
      expect(error.info).toEqual({
        seen: 0,
        meta: null,
        lastValue: null,
      });
    });
  });
  it('should emit and TimeoutError on timeout with appropriate due as Date', async () => {
    const defaultTimeoutError = new TimeoutError();
    await rxTest(async ({ observable, time, flush: flushMarbles }) => {
      const e1 = observable('-------a--b--|');
      const t = time(' ----|');
      // 4ms from "now", considering "now" with the rxTestScheduler is currently frame 0.
      const dueDate = new Date(t);
      const result = e1[timeout]({ first: dueDate, meta: null });
      let error;
      result.subscribe({
        next: () => {
          throw new Error('this should not next');
        },
        error: (err) => {
          error = err;
        },
        complete: () => {
          throw new Error('this should not complete');
        },
      });
      await flushMarbles();
      expect(error).toBeInstanceOf(TimeoutError);
      expect(error).toHaveProperty('name', 'TimeoutError');
      expect(error.info).toEqual({
        seen: 0,
        meta: null,
        lastValue: null,
      });
    });
  });
  it('should not timeout if source completes within absolute timeout period', async () => {
    const defaultTimeoutError = new TimeoutError();
    await rxTest(({ hot, expectObservable, expectSubscriptions, time }) => {
      const e1 = hot('  --a--b--c--d--e--|');
      const t = time('  --------------------|');
      const e1subs = '  ^----------------!';
      const expected = '--a--b--c--d--e--|';
      // Start frame is zero.
      const timeoutValue = new Date(t);
      expectObservable(e1[timeout]({ first: timeoutValue, meta: null })).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not timeout if source emits within timeout period', async () => {
    const defaultTimeoutError = new TimeoutError();
    await rxTest(({ hot, expectObservable, expectSubscriptions, time }) => {
      const e1 = hot('  --a--b--c--d--e--|');
      const t = time('  -----|            ');
      const e1subs = '  ^----------------!';
      const expected = '--a--b--c--d--e--|';
      expectObservable(e1[timeout]({ each: t, meta: null })).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should allow unsubscribing explicitly and early', async () => {
    const defaultTimeoutError = new TimeoutError();
    await rxTest(({ hot, expectObservable, expectSubscriptions, time }) => {
      const e1 = hot('  --a--b--c---d--e--|');
      const t = time('  -----|             ');
      const unsub = '   ----------!        ';
      const e1subs = '  ^---------!        ';
      const expected = '--a--b--c--        ';
      const result = e1[timeout]({ each: t, meta: null });
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not break unsubscription chains when result is unsubscribed explicitly', async () => {
    const defaultTimeoutError = new TimeoutError();
    await rxTest(({ hot, expectObservable, expectSubscriptions, time }) => {
      const e1 = hot('  --a--b--c---d--e--|');
      const t = time('  -----|             ');
      const e1subs = '  ^---------!        ';
      const expected = '--a--b--c--        ';
      const unsub = '   ----------!        ';
      const result = e1[mergeMap]((x) => Observable.from([x]))
        [timeout]({ each: t, meta: null })
        [mergeMap]((x) => Observable.from([x]));
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should timeout after a specified timeout period between emit with default error while source emits', async () => {
    const defaultTimeoutError = new TimeoutError();
    await rxTest(({ hot, expectObservable, expectSubscriptions, time }) => {
      const e1 = hot('  ---a---b---c------d---e---|');
      const t = time('             -----|');
      const e1subs = '  ^---------------!          ';
      const expected = '---a---b---c----#          ';
      const result = e1[timeout]({ each: t, meta: null });
      expectObservable(result).toBe(expected, undefined, defaultTimeoutError);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should timeout at a specified Date', async () => {
    const defaultTimeoutError = new TimeoutError();
    await rxTest(({ observable, expectObservable, expectSubscriptions, time }) => {
      const e1 = observable(' -');
      const t = time('  ----------|');
      const e1subs = '  ^---------!';
      const expected = '----------#';
      // Start time is zero
      const result = e1[timeout]({ first: new Date(t), meta: null });
      expectObservable(result).toBe(expected, null, defaultTimeoutError);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should timeout after a specified timeout period', async () => {
    const defaultTimeoutError = new TimeoutError();
    await rxTest(({ observable, expectObservable, expectSubscriptions, time }) => {
      const e1 = observable(' -------a--b--|');
      const t = time('  -----|        ');
      const e1subs = '  ^----!        ';
      const expected = '-----#        ';
      const result = e1[timeout]({
        each: t,
      });
      expectObservable(result).toBe(expected, null, defaultTimeoutError);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should emit and TimeoutError on timeout with appropriate due as number', async () => {
    const defaultTimeoutError = new TimeoutError();
    await rxTest(async ({ observable, time, flush: flushMarbles }) => {
      const e1 = observable('-------a--b--|');
      const t = time(' -----|');
      const result = e1[timeout]({ each: t });
      let error;
      result.subscribe({
        next: () => {
          throw new Error('this should not next');
        },
        error: (err) => {
          error = err;
        },
        complete: () => {
          throw new Error('this should not complete');
        },
      });
      await flushMarbles();
      expect(error).toBeInstanceOf(TimeoutError);
      expect(error).toHaveProperty('name', 'TimeoutError');
      expect(error.info).toEqual({
        seen: 0,
        meta: null,
        lastValue: null,
      });
    });
  });
  it('should emit and TimeoutError on timeout with appropriate due as Date', async () => {
    const defaultTimeoutError = new TimeoutError();
    await rxTest(async ({ observable, time, flush: flushMarbles }) => {
      const e1 = observable('-------a--b--|');
      const t = time(' ----|');
      // 4ms from "now", considering "now" with the rxTestScheduler is currently frame 0.
      const dueDate = new Date(t);
      const result = e1[timeout]({ first: dueDate });
      let error;
      result.subscribe({
        next: () => {
          throw new Error('this should not next');
        },
        error: (err) => {
          error = err;
        },
        complete: () => {
          throw new Error('this should not complete');
        },
      });
      await flushMarbles();
      expect(error).toBeInstanceOf(TimeoutError);
      expect(error).toHaveProperty('name', 'TimeoutError');
      expect(error.info).toEqual({
        seen: 0,
        meta: null,
        lastValue: null,
      });
    });
  });
  it('should not timeout if source completes within absolute timeout period', async () => {
    const defaultTimeoutError = new TimeoutError();
    await rxTest(({ hot, expectObservable, expectSubscriptions, time }) => {
      const e1 = hot('  --a--b--c--d--e--|');
      const t = time('  --------------------|');
      const e1subs = '  ^----------------!';
      const expected = '--a--b--c--d--e--|';
      expectObservable(e1[timeout]({ first: new Date(t) })).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not timeout if source emits within timeout period', async () => {
    const defaultTimeoutError = new TimeoutError();
    await rxTest(({ hot, expectObservable, expectSubscriptions, time }) => {
      const e1 = hot('  --a--b--c--d--e--|');
      const t = time('  -----|            ');
      const e1subs = '  ^----------------!';
      const expected = '--a--b--c--d--e--|';
      expectObservable(e1[timeout]({ each: t })).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should allow unsubscribing explicitly and early', async () => {
    const defaultTimeoutError = new TimeoutError();
    await rxTest(({ hot, expectObservable, expectSubscriptions, time }) => {
      const e1 = hot('  --a--b--c---d--e--|');
      const t = time('  -----|             ');
      const unsub = '   ----------!        ';
      const e1subs = '  ^---------!        ';
      const expected = '--a--b--c--        ';
      const result = e1[timeout]({ each: t });
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not break unsubscription chains when result is unsubscribed explicitly', async () => {
    const defaultTimeoutError = new TimeoutError();
    await rxTest(({ hot, expectObservable, expectSubscriptions, time }) => {
      const e1 = hot('  --a--b--c---d--e--|');
      const t = time('  -----|             ');
      const e1subs = '  ^---------!        ';
      const expected = '--a--b--c--        ';
      const unsub = '   ----------!        ';
      const result = e1[mergeMap]((x) => Observable.from([x]))
        [timeout]({ each: t })
        [mergeMap]((x) => Observable.from([x]));
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should timeout after a specified timeout period between emit with default error while source emits', async () => {
    const defaultTimeoutError = new TimeoutError();
    await rxTest(({ hot, expectObservable, expectSubscriptions, time }) => {
      const e1 = hot('  ---a---b---c------d---e---|');
      const t = time('             -----|');
      const e1subs = '  ^---------------!          ';
      const expected = '---a---b---c----#          ';
      const result = e1[timeout]({ each: t });
      expectObservable(result).toBe(expected, undefined, defaultTimeoutError);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should timeout at a specified Date', async () => {
    const defaultTimeoutError = new TimeoutError();
    await rxTest(({ observable, expectObservable, expectSubscriptions, time }) => {
      const e1 = observable(' -');
      const t = time('  ----------|');
      const e1subs = '  ^---------!';
      const expected = '----------#';
      // Start time is zero
      const result = e1[timeout]({ first: new Date(t) });
      expectObservable(result).toBe(expected, null, defaultTimeoutError);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should timeout at a specified time for first value only', async () => {
    const defaultTimeoutError = new TimeoutError();
    await rxTest(({ observable, expectObservable, expectSubscriptions, time }) => {
      const e1 = observable(' -');
      const t = time('  ----------|');
      const e1subs = '  ^---------!';
      const expected = '----------#';
      // Start time is zero
      const result = e1[timeout]({ first: t });
      expectObservable(result).toBe(expected, undefined, defaultTimeoutError);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not timeout for long delays if only first is specified', async () => {
    const defaultTimeoutError = new TimeoutError();
    await rxTest(({ observable, expectObservable, expectSubscriptions, time }) => {
      const e1 = observable(' ---a-----------------------b---|');
      const t = time('     ----------|');
      const e1subs = '  ^------------------------------!';
      const expected = '---a-----------------------b---|';
      // Start time is zero
      const result = e1[timeout]({ first: t });
      expectObservable(result).toBe(expected, undefined, defaultTimeoutError);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not timeout for long delays if only first is specified as Date', async () => {
    const defaultTimeoutError = new TimeoutError();
    await rxTest(({ observable, expectObservable, expectSubscriptions, time }) => {
      const e1 = observable(' ---a-----------------------b---|');
      const t = time('  ----------|');
      const e1subs = '  ^------------------------------!';
      const expected = '---a-----------------------b---|';
      // Start time is zero
      const result = e1[timeout]({ first: new Date(t) });
      expectObservable(result).toBe(expected, undefined, defaultTimeoutError);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should timeout for long delays if first is specified as Date AND each is specified', async () => {
    const defaultTimeoutError = new TimeoutError();
    await rxTest(({ observable, expectObservable, expectSubscriptions, time }) => {
      const e1 = observable('   ---a-----------------------b---|');
      const first = time('-------------|');
      const each = time('    ------|');
      const e1subs = '    ^--------!';
      const expected = '  ---a-----#';
      // Start time is zero
      const result = e1[timeout]({ first: new Date(first), each });
      expectObservable(result).toBe(expected, undefined, defaultTimeoutError);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should timeout after a specified period then subscribe to the passed observable', async () => {
    const defaultTimeoutError = new TimeoutError();
    await rxTest(({ observable, time, expectObservable, expectSubscriptions }) => {
      const source = observable('  -------a--b--|');
      const sourceSubs = '   ^----!        ';
      const t = time('       -----|');
      const inner = observable('        x-y-z-|  ');
      const innerSubs = '    -----^-----!  ';
      const expected = '     -----x-y-z-|  ';
      const result = source[timeout]({
        each: t,
        with: () => inner,
      });
      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      expectSubscriptions(inner.subscriptions).toBe(innerSubs);
    });
  });
  it('should timeout at a specified date then subscribe to the passed observable', async () => {
    const defaultTimeoutError = new TimeoutError();
    await rxTest(({ observable, time, expectObservable, expectSubscriptions }) => {
      const source = observable('  -');
      const sourceSubs = '   ^---------!           ';
      const t = time('       ----------|');
      const inner = observable('             --x--y--z--|');
      const innerSubs = '    ----------^----------!';
      const expected = '     ------------x--y--z--|';
      // The current frame is zero.
      const result = source[timeout]({
        first: new Date(t),
        with: () => inner,
      });
      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      expectSubscriptions(inner.subscriptions).toBe(innerSubs);
    });
  });
  it('should timeout after a specified period between emit then subscribe to the passed observable when source emits', async () => {
    const defaultTimeoutError = new TimeoutError();
    await rxTest(({ hot, observable, time, expectObservable, expectSubscriptions }) => {
      const source = hot('  ---a---b------c---|');
      const t = time('             ----|       ');
      const sourceSubs = '  ^----------!       ';
      const inner = observable('             -x-y-|  ');
      const innerSubs = '   -----------^----!  ';
      const expected = '    ---a---b----x-y-|  ';
      const result = source[timeout]({
        each: t,
        with: () => inner,
      });
      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      expectSubscriptions(inner.subscriptions).toBe(innerSubs);
    });
  });
  it('should allow unsubscribing explicitly and early', async () => {
    const defaultTimeoutError = new TimeoutError();
    await rxTest(({ hot, observable, time, expectObservable, expectSubscriptions }) => {
      const source = hot('  ---a---b-----c----|');
      const t = time('             ----|       ');
      const sourceSubs = '  ^----------!       ';
      const inner = observable('             -x---y| ');
      const innerSubs = '   -----------^--!    ';
      const expected = '    ---a---b----x--    ';
      const unsub = '       --------------!    ';
      const result = source[timeout]({ each: t, with: () => inner });
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      expectSubscriptions(inner.subscriptions).toBe(innerSubs);
    });
  });
  it('should not break unsubscription chain when unsubscribed explicitly', async () => {
    const defaultTimeoutError = new TimeoutError();
    await rxTest(({ hot, observable, time, expectObservable, expectSubscriptions }) => {
      const source = hot('  ---a---b-----c----|');
      const t = time('      ----|              ');
      const sourceSubs = '  ^----------!       ';
      const inner = observable('             -x---y| ');
      const innerSubs = '   -----------^--!    ';
      const expected = '    ---a---b----x--    ';
      const unsub = '       --------------!    ';
      const result = source[mergeMap]((x) => Observable.from([x]))
        [timeout]({ each: t, with: () => inner })
        [mergeMap]((x) => Observable.from([x]));
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      expectSubscriptions(inner.subscriptions).toBe(innerSubs);
    });
  });
  it('should not subscribe to withObservable after explicit unsubscription', async () => {
    const defaultTimeoutError = new TimeoutError();
    await rxTest(({ observable, time, expectObservable, expectSubscriptions }) => {
      const source = observable('---a------b------');
      const t = time('     -----|           ');
      const sourceSubs = ' ^----!           ';
      const inner = observable('      i---j---|   ');
      const expected = '   ---a--           ';
      const unsub = '      -----!           ';
      const result = source[mergeMap]((x) => Observable.from([x]))
        [timeout]({ each: t, with: () => inner })
        [mergeMap]((x) => Observable.from([x]));
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      expectSubscriptions(inner.subscriptions).toBe([]);
    });
  });
  it('should timeout after a specified period then subscribe to the passed observable when source is empty', async () => {
    const defaultTimeoutError = new TimeoutError();
    await rxTest(({ hot, observable, time, expectObservable, expectSubscriptions }) => {
      const source = hot('  -------------|      ');
      const t = time('      ----------|         ');
      const sourceSubs = '  ^---------!         ';
      const inner = observable('            ----x----|');
      const innerSubs = '   ----------^--------!';
      const expected = '    --------------x----|';
      const result = source[timeout]({ each: t, with: () => inner });
      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      expectSubscriptions(inner.subscriptions).toBe(innerSubs);
    });
  });
  it('should timeout after a specified period between emit then never completes if other source does not complete', async () => {
    const defaultTimeoutError = new TimeoutError();
    await rxTest(({ hot, observable, time, expectObservable, expectSubscriptions }) => {
      const source = hot('  --a--b--------c--d--|');
      const t = time('           ----|           ');
      const sourceSubs = '  ^--------!           ';
      const inner = observable('           ------------');
      const innerSubs = '---------^-----------!';
      const expected = '    --a--b---------------';
      const result = source[timeout]({ each: t, with: () => inner });
      expectObservable(result, '^--------------------!').toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      expectSubscriptions(inner.subscriptions).toBe(innerSubs);
    });
  });
  it('should timeout after a specified period then subscribe to the passed observable when source raises error after timeout', async () => {
    const defaultTimeoutError = new TimeoutError();
    await rxTest(({ hot, observable, time, expectObservable, expectSubscriptions }) => {
      const source = hot('  -------------#      ');
      const t = time('      ----------|         ');
      const sourceSubs = '  ^---------!         ';
      const inner = observable('            ----x----|');
      const innerSubs = '   ----------^--------!';
      const expected = '    --------------x----|';
      const result = source[timeout]({ each: t, with: () => inner });
      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      expectSubscriptions(inner.subscriptions).toBe(innerSubs);
    });
  });
  it('should timeout after a specified period between emit then never completes if other source emits but not complete', async () => {
    const defaultTimeoutError = new TimeoutError();
    await rxTest(({ hot, observable, time, expectObservable, expectSubscriptions }) => {
      const source = hot('  -------------|      ');
      const t = time('      -----------|        ');
      const sourceSubs = '  ^----------!        ';
      const inner = observable('             ----x----');
      const innerSubs = '-----------^--------!';
      const expected = '    ---------------x----';
      const result = source[timeout]({ each: t, with: () => inner });
      expectObservable(result, '^-------------------!').toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      expectSubscriptions(inner.subscriptions).toBe(innerSubs);
    });
  });
  it('should not timeout if source completes within timeout period', async () => {
    const defaultTimeoutError = new TimeoutError();
    await rxTest(({ hot, observable, time, expectObservable, expectSubscriptions }) => {
      const source = hot('  -----|        ');
      const t = time('      ----------|   ');
      const sourceSubs = '  ^----!        ';
      const inner = observable('            ----x----');
      const expected = '    -----|        ';
      const result = source[timeout]({ each: t, with: () => inner });
      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      expectSubscriptions(inner.subscriptions).toBe([]);
    });
  });
  it('should not timeout if source raises error within timeout period', async () => {
    const defaultTimeoutError = new TimeoutError();
    await rxTest(({ hot, observable, time, expectObservable, expectSubscriptions }) => {
      const source = hot('-----#              ');
      const t = time('    ----------|         ');
      const sourceSubs = '^----!              ';
      const inner = observable('       ----x----|');
      const expected = '  -----#              ';
      const result = source[timeout]({ each: t, with: () => inner });
      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      expectSubscriptions(inner.subscriptions).toBe([]);
    });
  });
  it('should not timeout if source emits within timeout period', async () => {
    const defaultTimeoutError = new TimeoutError();
    await rxTest(({ hot, observable, time, expectObservable, expectSubscriptions }) => {
      const source = hot('   --a--b--c--d--e--|');
      const t = time('       -----|            ');
      const sourceSubs = '   ^----------------!';
      const inner = observable('        ----x----|   ');
      const expected = '     --a--b--c--d--e--|';
      const result = source[timeout]({ each: t, with: () => inner });
      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      expectSubscriptions(inner.subscriptions).toBe([]);
    });
  });
  it('should not timeout if source completes within specified Date', async () => {
    const defaultTimeoutError = new TimeoutError();
    await rxTest(({ hot, observable, time, expectObservable, expectSubscriptions }) => {
      const source = hot('--a--b--c--d--e--|   ');
      const t = time('    --------------------|');
      const sourceSubs = '^----------------!   ';
      const inner = observable('--x--|            ');
      const expected = '  --a--b--c--d--e--|   ';
      // Start frame is zero.
      const result = source[timeout]({ first: new Date(t), with: () => inner });
      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      expectSubscriptions(inner.subscriptions).toBe([]);
    });
  });
  it('should not timeout if source raises error within specified Date', async () => {
    const defaultTimeoutError = new TimeoutError();
    await rxTest(({ hot, observable, time, expectObservable, expectSubscriptions }) => {
      const source = hot('---a---#           ');
      const t = time('       ----------|     ');
      const sourceSubs = '^------!           ';
      const inner = observable('             --x--|');
      const expected = '  ---a---#           ';
      // Start frame is zero.
      const result = source[timeout]({ first: new Date(t), with: () => inner });
      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      expectSubscriptions(inner.subscriptions).toBe([]);
    });
  });
  it('should not timeout if source emits synchronously when subscribed', async () => {
    const defaultTimeoutError = new TimeoutError();
    await rxTest(({ expectObservable, time }) => {
      const source = Observable.from(['a'])[concat]([NEVER]);
      const t = time('  ---|');
      const expected = 'a---';
      expectObservable(source[timeout]({ first: new Date(t) }), '^---!').toBe(expected);
    });
  });
});
