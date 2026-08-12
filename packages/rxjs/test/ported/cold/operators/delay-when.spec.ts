// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/delayWhen-spec.ts
import { describe, expect, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { delayWhen } from 'rxjs/delay-when';
import { EMPTY } from 'rxjs/empty';
import { tap } from 'rxjs/tap';
describe('delayWhen (cold)', () => {
  it('should delay by duration selector', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ---a---b---c--|      ');
      const expected = '-----a------c----(b|)';
      const subs = '    ^-------------!      ';
      const selector = [
        cold('             --x--|            '),
        cold('                 ----------(x|)'),
        cold('                     -x--|     '),
      ];
      const selectorSubs = [
        '               ---^-!               ',
        '               -------^---------!   ',
        '               -----------^!        ',
      ];
      let idx = 0;
      function durationSelector(x) {
        return selector[idx++];
      }
      const result = e1[delayWhen](durationSelector);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
      expectSubscriptions(selector[0].subscriptions).toBe(selectorSubs[0]);
      expectSubscriptions(selector[1].subscriptions).toBe(selectorSubs[1]);
      expectSubscriptions(selector[2].subscriptions).toBe(selectorSubs[2]);
    });
  });
  it('should delay by selector', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('     --a--b--| ');
      const expected = '   ---a--b-| ';
      const subs = '       ^-------! ';
      const selector = cold('-x--|   ');
      //                        -x--|
      // prettier-ignore
      const selectorSubs = [
                '                  --^!      ',
                '                  -----^!   ',
            ];
      const result = e1[delayWhen]((x) => selector);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
      expectSubscriptions(selector.subscriptions).toBe(selectorSubs);
    });
  });
  it('should raise error if source raises error', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('      --a--# ');
      const expected = '    ---a-# ';
      const subs = '        ^----! ';
      const selector = cold(' -x--|');
      const selectorSubs = '--^!   ';
      const result = e1[delayWhen]((x) => selector);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
      expectSubscriptions(selector.subscriptions).toBe(selectorSubs);
    });
  });
  it('should raise error if selector raises error', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('      --a--b--|');
      const expected = '    ---#     ';
      const subs = '        ^--!     ';
      const selector = cold(' -#     ');
      const selectorSubs = '--^!     ';
      const result = e1[delayWhen]((x) => selector);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
      expectSubscriptions(selector.subscriptions).toBe(selectorSubs);
    });
  });
  it('should delay by selector and completes after value emits', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('     --a--b--|       ');
      const expected = '   ---------a--(b|)';
      const subs = '       ^-------!       ';
      const selector = cold('-------x--|   ');
      //                        -------x--|
      // prettier-ignore
      const selectorSubs = [
                '                  --^------!      ',
                '                  -----^------!   '
            ];
      const result = e1[delayWhen]((x) => selector);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
      expectSubscriptions(selector.subscriptions).toBe(selectorSubs);
    });
  });
  it('should delay, but not emit if the selector never emits a notification', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('     --a--b--|   ');
      const expected = '   -----------|';
      const subs = '       ^-------!   ';
      const selector = cold('------|   ');
      //                        ------|
      // prettier-ignore
      const selectorSubs = [
                '                  --^-----!   ',
                '                  -----^-----!'
            ];
      const result = e1[delayWhen]((x) => selector);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
      expectSubscriptions(selector.subscriptions).toBe(selectorSubs);
    });
  });
  it('should not emit for async source and sync empty selector', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  a--|');
      const expected = '---|';
      const subs = '    ^--!';
      const result = e1[delayWhen]((x) => EMPTY);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });
  it('should not emit if selector never emits', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('     --a--b--|');
      const expected = '   -        ';
      const subs = '       ^-------!';
      const selector = cold('-      ');
      //                        -
      // prettier-ignore
      const selectorSubs = [
                "--^------!",
                "-----^---!"
            ];
      const result = e1[delayWhen]((x) => selector);
      expectObservable(result, '^--------!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
      expectSubscriptions(selector.subscriptions).toBe(selectorSubs);
    });
  });
  it('should delay by first value from selector', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('     --a--b--|       ');
      const expected = '   ------a--(b|)   ';
      const subs = '       ^-------!       ';
      const selector = cold('----x--y--|   ');
      //                        ----x--y--|
      // prettier-ignore
      const selectorSubs = [
                '                  --^---!         ',
                '                  -----^---!      ',
            ];
      const result = e1[delayWhen]((x) => selector);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
      expectSubscriptions(selector.subscriptions).toBe(selectorSubs);
    });
  });
  it('should delay by selector that does not completes', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('     --a--b--|          ');
      const expected = '   ------a--(b|)      ';
      const subs = '       ^-------!          ';
      const selector = cold('----x-----y---   ');
      //                        ----x-----y---
      // prettier-ignore
      const selectorSubs = [
                '                  --^---!            ',
                '                  -----^---!         '
            ];
      const result = e1[delayWhen]((x) => selector);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
      expectSubscriptions(selector.subscriptions).toBe(selectorSubs);
    });
  });
  it('should raise error if selector throws', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--|');
      const e1subs = '  ^-!      ';
      const expected = '--#      ';
      const err = new Error('error');
      const result = e1[delayWhen]((x) => {
        throw err;
      });
      expectObservable(result).toBe(expected, null, err);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should start subscription when subscription delay emits', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('       -----a---b---| ');
      const expected = '     -------a---b-| ';
      const subs = '         ---^---------! ';
      const selector = cold('     --x--|    ');
      //                              --x--|
      // prettier-ignore
      const selectorSubs = [
                '                      -----^-!     ',
                '                      ---------^-! '
            ];
      const subDelay = cold('---x--|        ');
      const subDelaySub = '  ^--!           ';
      const result = e1[delayWhen]((x) => selector, subDelay);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
      expectSubscriptions(selector.subscriptions).toBe(selectorSubs);
      expectSubscriptions(subDelay.subscriptions).toBe(subDelaySub);
    });
  });
  it('should start subscription when subscription delay completes without emit value', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('       -----a---b---| ');
      const expected = '     -------a---b-| ';
      const subs = '         ---^---------! ';
      const selector = cold('     --x--|    ');
      //                              --x--|
      // prettier-ignore
      const selectorSubs = [
                '                    -----^-!       ',
                '                    ---------^-!   '
            ];
      const subDelay = cold('---|           ');
      const subDelaySub = '  ^--!           ';
      const result = e1[delayWhen]((x) => selector, subDelay);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
      expectSubscriptions(selector.subscriptions).toBe(selectorSubs);
      expectSubscriptions(subDelay.subscriptions).toBe(subDelaySub);
    });
  });
  it('should raise error when subscription delay raises error', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('       -----a---b---|');
      const expected = '     ---#          ';
      const selector = cold('     --x--|   ');
      const subDelay = cold('---#          ');
      const subDelaySub = '  ^--!          ';
      const result = e1[delayWhen]((x) => selector, subDelay);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe([]);
      expectSubscriptions(selector.subscriptions).toBe([]);
      expectSubscriptions(subDelay.subscriptions).toBe(subDelaySub);
    });
  });
  it('should call predicate with indices starting at 0', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('       --a--b--c--|');
      const e1subs = '       ^----------!';
      const expected = '     --a--b--c--|';
      const selector = cold('  (x|)');
      //                          (x|)
      //                             (x|)
      let indices = [];
      const predicate = (value, index) => {
        indices.push(index);
        return selector;
      };
      const result = e1[delayWhen](predicate);
      expectObservable(
        result[tap]({
          complete: () => {
            expect(indices).toEqual([0, 1, 2]);
          },
        })
      ).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
});
