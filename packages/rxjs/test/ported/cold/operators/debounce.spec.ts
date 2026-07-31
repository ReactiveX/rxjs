// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/debounce-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { ColdObservable } from 'rxjs/cold-observable';
import { debounce } from 'rxjs/debounce';
import { EMPTY } from 'rxjs/empty';
import { mergeMap } from 'rxjs/merge-map';
import { NEVER } from 'rxjs/never';
import { timer } from 'rxjs/timer';
describe('debounce (cold)', () => {
  it('should debounce values by a specified cold Observable', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -a----bc----d-ef----|');
      const e1subs = '  ^-------------------!';
      const e2 = cold('  ---x                ');
      //                       ---x
      //                               ---x
      const e2subs = [
        '               -^--!                ',
        '               ------^!             ',
        '               -------^--!          ',
        '               ------------^-!      ',
        '               --------------^!     ',
        '               ---------------^--!  ',
      ];
      const expected = '----a-----c-------f-|';
      const result = e1[debounce](() => e2);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should delay all element by selector observable', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--d---------|');
      const e1subs = '  ^--------------------!';
      const expected = '----a--b--c--d-------|';
      expectObservable(e1[debounce](() => ColdObservable[timer](2))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should debounce by selector observable', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--bc--d----|');
      const e1subs = '  ^-------------!';
      const expected = '----a---c--d--|';
      expectObservable(e1[debounce](() => ColdObservable[timer](2))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should support a scalar selector observable', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--bc--d----|');
      const e1subs = '  ^-------------!';
      const expected = '--a--bc--d----|';
      expectObservable(e1[debounce](() => ColdObservable.from([0]))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should complete when source does not emit', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -----|');
      const e1subs = '  ^----!';
      const expected = '-----|';
      expectObservable(e1[debounce](() => ColdObservable[timer](2))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should complete when source is empty', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' |');
      const e1subs = '  (^!)';
      const expected = '|';
      expectObservable(e1[debounce](() => ColdObservable[timer](2))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should raise error when source does not emit and raises error', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -----#');
      const e1subs = '  ^----!';
      const expected = '-----#';
      expectObservable(e1[debounce](() => ColdObservable[timer](2))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should raise error when source throws', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' #');
      const e1subs = '  (^!)';
      const expected = '#';
      expectObservable(e1[debounce](() => ColdObservable[timer](2))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should allow unsubscribing early and explicitly', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--bc--d----|');
      const e1subs = '  ^------!       ';
      const expected = '----a---       ';
      const unsub = '   -------!       ';
      const result = e1[debounce](() => ColdObservable[timer](2));
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not break unsubscription chains when unsubscribed explicitly', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--bc--d----|');
      const e1subs = '  ^------!       ';
      const expected = '----a---       ';
      const unsub = '   -------!       ';
      const result = e1[mergeMap]((x) => ColdObservable.from([x]))
        [debounce](() => ColdObservable[timer](2))
        [mergeMap]((x) => ColdObservable.from([x]));
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should debounce and does not complete when source does not completes', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--bc--d---');
      const e1subs = '^------------!';
      const expected = '----a---c--d-';
      expectObservable(
        e1[debounce](() => ColdObservable[timer](2)),
        '^------------!'
      ).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not complete when source does not complete', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -');
      const e1subs = '^!';
      const expected = '-';
      expectObservable(
        e1[debounce](() => ColdObservable[timer](2)),
        '^!'
      ).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not completes when source never completes', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' -');
      const e1subs = '^!';
      const expected = '-';
      expectObservable(
        e1[debounce](() => ColdObservable[timer](2)),
        '^!'
      ).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should delay all element until source raises error', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--d---------#');
      const e1subs = '  ^--------------------!';
      const expected = '----a--b--c--d-------#';
      expectObservable(e1[debounce](() => ColdObservable[timer](2))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should debounce all elements while source emits by selector observable', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ---a---b---c---d---e|');
      const e1subs = '  ^-------------------!';
      const expected = '--------------------(e|)';
      expectObservable(e1[debounce](() => ColdObservable[timer](4))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should debounce all element while source emits by selector observable until raises error', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--d-#');
      const e1subs = '  ^------------!';
      const expected = '-------------#';
      expectObservable(e1[debounce](() => ColdObservable[timer](5))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should delay element by same selector observable emits multiple', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('       ----a--b--c----d-----e-------|');
      const e1subs = '       ^----------------------------!';
      const expected = '     ------a--b--c----d-----e-----|';
      const selector = cold('--x-y-');
      const selectorSubs = [
        '                    ----^-!                      ',
        '                    -------^-!                   ',
        '                    ----------^-!                ',
        '                    ---------------^-!           ',
        '                    ---------------------^-!     ',
      ];
      expectObservable(e1[debounce](() => selector)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(selector.subscriptions).toBe(selectorSubs);
    });
  });
  it('should debounce by selector observable emits multiple', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ----a--b--c----d-----e-------|');
      const e1subs = '  ^----------------------------!';
      const expected = '------a-----c----------e-----|';
      const selector = [
        cold('              --x-y-                    '),
        cold('                 ----x-y-               '),
        cold('                    --x-y-              '),
        cold('                         ------x-y-     '),
        cold('                               --x-y-   '),
      ];
      const selectorSubs = [
        '               ----^-!                       ',
        '               -------^--!                   ',
        '               ----------^-!                 ',
        '               ---------------^-----!        ',
        '               ---------------------^-!      ',
      ];
      expectObservable(e1[debounce](() => selector.shift())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      for (let i = 0; i < selectorSubs.length; i++) {
        expectSubscriptions(selector[i].subscriptions).toBe(selectorSubs[i]);
      }
    });
  });
  it('should debounce by selector observable until source completes', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ----a--b--c----d----e|    ');
      const e1subs = '  ^--------------------!    ';
      const expected = '------a-----c--------(e|) ';
      const selector = [
        cold('              --x-y-                '),
        cold('                 ----x-y-           '),
        cold('                    --x-y-          '),
        cold('                         ------x-y- '),
        cold('                              --x-y-'),
      ];
      const selectorSubs = [
        '               ----^-!                   ',
        '               -------^--!               ',
        '               ----------^-!             ',
        '               ---------------^----!     ',
        '               --------------------^!    ',
      ];
      expectObservable(e1[debounce](() => selector.shift())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      for (let i = 0; i < selectorSubs.length; i++) {
        expectSubscriptions(selector[i].subscriptions).toBe(selectorSubs[i]);
      }
    });
  });
  it('should raise error when selector observable raises error', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --------a--------b--------c---------|');
      const e1subs = '  ^----------------------------!       ';
      const expected = '---------a---------b---------#       ';
      const selector = [
        cold('                  -x-y-                        '),
        cold('                           --x-y-              '),
        cold('                                    ---#       '),
      ];
      const selectorSubs = [
        '               --------^!                           ',
        '               -----------------^-!                 ',
        '               --------------------------^--!       ',
      ];
      expectObservable(e1[debounce](() => selector.shift())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      for (let i = 0; i < selectorSubs.length; i++) {
        expectSubscriptions(selector[i].subscriptions).toBe(selectorSubs[i]);
      }
    });
  });
  it('should raise error when source raises error with selector observable', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --------a--------b--------c---------d#      ');
      const e1subs = '  ^------------------------------------!      ';
      const expected = '---------a---------b---------c-------#      ';
      const selector = [
        cold('                  -x-y-                               '),
        cold('                           --x-y-                     '),
        cold('                                    ---x-y-           '),
        cold('                                              ----x-y-'),
      ];
      const selectorSubs = [
        '               --------^!                                  ',
        '               -----------------^-!                        ',
        '               --------------------------^--!              ',
        '               ------------------------------------^!      ',
      ];
      expectObservable(e1[debounce](() => selector.shift())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      for (let i = 0; i < selectorSubs.length; i++) {
        expectSubscriptions(selector[i].subscriptions).toBe(selectorSubs[i]);
      }
    });
  });
  it('should raise error when selector function throws', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --------a--------b--------c---------|');
      const e1subs = '  ^-------------------------!          ';
      const expected = '---------a---------b------#          ';
      // prettier-ignore
      const selector = [
                cold('                  -x-y-                        '),
                cold('                           --x-y-              '),
            ];
      // prettier-ignore
      const selectorSubs = [
                '               --------^!                           ',
                '               -----------------^-!                 ',
            ];
      function selectorFunction(x) {
        if (x !== 'c') {
          return selector.shift();
        } else {
          throw 'error';
        }
      }
      expectObservable(e1[debounce](selectorFunction)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      for (let i = 0; i < selectorSubs.length; i++) {
        expectSubscriptions(selector[i].subscriptions).toBe(selectorSubs[i]);
      }
    });
  });
  it('should ignore all values except last, when given an empty selector Observable', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --------a-x-yz---bxy---z--c--x--y--z|   ');
      const e1subs = '  ^-----------------------------------!   ';
      const expected = '------------------------------------(z|)';
      function selectorFunction(x) {
        return EMPTY;
      }
      expectObservable(e1[debounce](selectorFunction)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should ignore all values except last, when given a never selector Observable', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --------a-x-yz---bxy---z--c--x--y--z|  ');
      const e1subs = '  ^-----------------------------------!  ';
      const expected = '------------------------------------(z|)';
      function selectorFunction() {
        return NEVER;
      }
      expectObservable(e1[debounce](selectorFunction)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not delay by selector observable completes when it does not emits', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --------a--------b--------c---------|   ');
      const e1subs = '  ^-----------------------------------!   ';
      const expected = '------------------------------------(c|)';
      const selector = [
        cold('                  -|                              '),
        cold('                           --|                    '),
        cold('                                    ---|          '),
      ];
      const selectorSubs = [
        '               --------^!                              ',
        '               -----------------^-!                    ',
        '               --------------------------^--!          ',
      ];
      expectObservable(e1[debounce](() => selector.shift())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      for (let i = 0; i < selectorSubs.length; i++) {
        expectSubscriptions(selector[i].subscriptions).toBe(selectorSubs[i]);
      }
    });
  });
  it('should not debounce by selector observable completes when it does not emits', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ----a--b-c---------de-------------|   ');
      const e1subs = '  ^---------------------------------!   ';
      const expected = '----------------------------------(e|)';
      const selector = [
        cold('              -|                                '),
        cold('                 --|                            '),
        cold('                   ---|                         '),
        cold('                             ----|              '),
        cold('                              -----|            '),
      ];
      const selectorSubs = [
        '               ----^!                                ',
        '               -------^-!                            ',
        '               ---------^--!                         ',
        '               -------------------^!                 ',
        '               --------------------^----!            ',
      ];
      expectObservable(e1[debounce](() => selector.shift())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      for (let i = 0; i < selectorSubs.length; i++) {
        expectSubscriptions(selector[i].subscriptions).toBe(selectorSubs[i]);
      }
    });
  });
});
