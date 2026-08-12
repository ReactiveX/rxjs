// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/retry-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { ColdObservable } from 'rxjs/cold-observable';
import { EMPTY } from 'rxjs/empty';
import { mergeMap } from 'rxjs/merge-map';
import { retry } from 'rxjs/retry';
import { timer } from 'rxjs/timer';
describe('retry (cold)', () => {
  it('should handle a basic source that emits next then errors, count=3', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('--1-2-3-#');
      const subs = [
        '                  ^-------!                ',
        '                  --------^-------!        ',
        '                  ----------------^-------!',
      ];
      const expected = '   --1-2-3---1-2-3---1-2-3-#';
      const result = source[retry]({ count: 2, resetOnSuccess: false });
      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should handle an empty source', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('|  ');
      const subs = '      (^!)';
      const expected = '   |  ';
      const result = source[retry]({ resetOnSuccess: false });
      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should handle a never source', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('-');
      const subs = '^!';
      const expected = '   -';
      const result = source[retry]({ resetOnSuccess: false });
      expectObservable(result, '^!').toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should return a never observable given an async just-throw source and no count', async () => {
    await rxTest(({ cold, expectObservable }) => {
      const source = cold('-#                                    '); // important that it's not a sync error
      const unsub = '     -------------------------------------!';
      const expected = '  --------------------------------------';
      const result = source[retry]({ resetOnSuccess: false });
      expectObservable(result, unsub).toBe(expected);
    });
  });
  it('should handle a basic source that emits next then completes', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('--1--2--^--3--4--5---|');
      const subs = '              ^------------!';
      const expected = '          ---3--4--5---|';
      const result = source[retry]({ resetOnSuccess: false });
      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should handle a basic source that emits next but does not complete', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('--1--2--^--3--4--5---');
      const subs = '^------------!';
      const expected = '          ---3--4--5---';
      const result = source[retry]({ resetOnSuccess: false });
      expectObservable(result, '^------------!').toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should handle a basic source that emits next then errors, no count', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('--1-2-3-#                             ');
      //                           --1-2-3-#
      //                                   --1-2-3-#
      //                                           --1-2-3-#
      //                                                   --1-2-3-#
      const unsub = '      -------------------------------------!';
      const subs = [
        '                  ^-------!                             ',
        '                  --------^-------!                     ',
        '                  ----------------^-------!             ',
        '                  ------------------------^-------!     ',
        '                  --------------------------------^----!',
      ];
      const expected = '   --1-2-3---1-2-3---1-2-3---1-2-3---1-2-';
      const result = source[retry]({ resetOnSuccess: false });
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should handle a source which eventually throws, count=3, and result is unsubscribed early', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('--1-2-3-#     ');
      //                           --1-2-3-#
      const unsub = '      -------------!';
      // prettier-ignore
      const subs = [
                '                  ^-------!     ',
                '                  --------^----!',
            ];
      const expected = '   --1-2-3---1-2-';
      const result = source[retry]({ count: 3, resetOnSuccess: false });
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should not break unsubscription chain when unsubscribed explicitly', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('--1-2-3-#     ');
      //                           --1-2-3-#
      // prettier-ignore
      const subs = [
                '                  ^-------!     ',
                '                  --------^----!',
            ];
      const expected = '   --1-2-3---1-2-';
      const unsub = '      -------------!';
      const result = source[mergeMap]((x) => ColdObservable.from([x]))
        [retry]({ count: 100, resetOnSuccess: false })
        [mergeMap]((x) => ColdObservable.from([x]));
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should not alter the source when the number of retries is smaller than 1', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('--1-2-3-# ');
      const subs = ['      ^-------! '];
      const expected = '   --1-2-3-# ';
      const unsub = '      ---------!';
      const result = source[retry]({ count: 0, resetOnSuccess: false });
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should delay the retry by a specified amount of time', async () => {
    await rxTest(({ cold, time, expectSubscriptions, expectObservable }) => {
      const source = cold('---a---b---#');
      const t = time('                ----|');
      const subs = [
        //
        '                  ^----------!',
        '                  ---------------^----------!',
        '                  ------------------------------^----------!',
        '                  ---------------------------------------------^----!',
      ];
      const unsub = '      ^-------------------------------------------------!';
      const expected = '   ---a---b----------a---b----------a---b----------a--';
      const result = source[retry]({
        delay: t,
        resetOnSuccess: false,
      });
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should act like a normal retry if delay is set to 0', async () => {
    await rxTest(({ cold, expectSubscriptions, expectObservable }) => {
      const source = cold('---a---b---#');
      const subs = [
        //
        '                  ^----------!',
        '                  -----------^----------!',
        '                  ----------------------^----------!',
        '                  ---------------------------------^----!',
      ];
      const unsub = '      ^-------------------------------------!';
      const expected = '   ---a---b------a---b------a---b------a--';
      const result = source[retry]({
        delay: 0,
        resetOnSuccess: false,
      });
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should act like a normal retry if delay is less than 0', async () => {
    await rxTest(({ cold, expectSubscriptions, expectObservable }) => {
      const source = cold('---a---b---#');
      const subs = [
        //
        '                  ^----------!',
        '                  -----------^----------!',
        '                  ----------------------^----------!',
        '                  ---------------------------------^----!',
      ];
      const unsub = '      ^-------------------------------------!';
      const expected = '   ---a---b------a---b------a---b------a--';
      const result = source[retry]({
        delay: -100,
        resetOnSuccess: false,
      });
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should honor count as the max retries', async () => {
    await rxTest(({ cold, time, expectSubscriptions, expectObservable }) => {
      const source = cold('---a---b---#');
      const t = time('                ----|');
      const subs = [
        //
        '                  ^----------!',
        '                  ---------------^----------!',
        '                  ------------------------------^----------!',
      ];
      const expected = '   ---a---b----------a---b----------a---b---#';
      const result = source[retry]({
        count: 2,
        delay: t,
        resetOnSuccess: false,
      });
      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should delay the retry with a function that returns a notifier', async () => {
    await rxTest(({ cold, expectSubscriptions, expectObservable }) => {
      const source = cold('---a---b---#');
      const subs = [
        //
        '                  ^----------!',
        '                  ------------^----------!',
        '                  -------------------------^----------!',
        '                  ---------------------------------------^----!',
      ];
      const unsub = '      ^-------------------------------------------!';
      const expected = '   ---a---b-------a---b--------a---b---------a--';
      const result = source[retry]({
        delay: (_err, retryCount) => {
          // retryCount will be 1, 2, 3, etc.
          return ColdObservable[timer](retryCount);
        },
        resetOnSuccess: false,
      });
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should delay the retry with a function that returns a hot observable', async () => {
    await rxTest(({ cold, hot, expectSubscriptions, expectObservable }) => {
      const source = cold(' ---a---b---#');
      const notifier = hot('--------------x----------------x----------------x------');
      const subs = [
        //
        '                   ^----------!',
        '                   --------------^----------!',
        '                   -------------------------------^----------!',
      ];
      const notifierSubs = [
        //
        '                   -----------^--!',
        '                   -------------------------^-----!',
        '                   ------------------------------------------^-!',
      ];
      const unsub = '       ^-------------------------------------------!';
      const expected = '    ---a---b---------a---b------------a---b------';
      const result = source[retry]({
        delay: () => notifier,
        resetOnSuccess: false,
      });
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
      expectSubscriptions(notifier.subscriptions).toBe(notifierSubs);
    });
  });
  it('should complete if the notifier completes', async () => {
    await rxTest(({ cold, expectSubscriptions, expectObservable }) => {
      const source = cold('---a---b---#');
      const subs = [
        //
        '                  ^----------!',
        '                  ------------^----------!',
        '                  -------------------------^----------!',
        '                  ------------------------------------!',
      ];
      const expected = '   ---a---b-------a---b--------a---b---|';
      const result = source[retry]({
        delay: (_err, retryCount) => {
          return retryCount <= 2 ? ColdObservable[timer](retryCount) : EMPTY;
        },
        resetOnSuccess: false,
      });
      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should error if the notifier errors', async () => {
    await rxTest(({ cold, expectSubscriptions, expectObservable }) => {
      const source = cold('---a---b---#');
      const subs = [
        //
        '                  ^----------!',
        '                  ------------^----------!',
        '                  -------------------------^----------!',
        '                  ------------------------------------!',
      ];
      const expected = '   ---a---b-------a---b--------a---b---#';
      const result = source[retry]({
        delay: (_err, retryCount) => {
          return retryCount <= 2
            ? ColdObservable[timer](retryCount)
            : new ColdObservable((subscriber) => {
                subscriber.error(new Error('blah'));
              });
        },
        resetOnSuccess: false,
      });
      expectObservable(result).toBe(expected, undefined, new Error('blah'));
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should error if the delay function throws', async () => {
    await rxTest(({ cold, expectSubscriptions, expectObservable }) => {
      const source = cold('---a---b---#');
      const subs = [
        //
        '                  ^----------!',
        '                  ------------^----------!',
        '                  -------------------------^----------!',
        '                  ------------------------------------!',
      ];
      const expected = '   ---a---b-------a---b--------a---b---#';
      const result = source[retry]({
        delay: (_err, retryCount) => {
          if (retryCount <= 2) {
            return ColdObservable[timer](retryCount);
          } else {
            throw new Error('blah');
          }
        },
        resetOnSuccess: false,
      });
      expectObservable(result).toBe(expected, undefined, new Error('blah'));
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should be usable for exponential backoff', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('---a---#');
      const subs = [
        //
        '                  ^------!',
        '                  ---------^------!',
        '                  --------------------^------!',
        '                  -----------------------------------^------!',
      ];
      const expected = '   ---a--------a----------a--------------a---#';
      const result = source[retry]({
        count: 3,
        delay: (_err, retryCount) => ColdObservable[timer](2 ** retryCount),
        resetOnSuccess: false,
      });
      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
});
