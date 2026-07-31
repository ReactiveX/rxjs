// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/delayWhen-spec.ts
import { describe, expect, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { delayWhen } from 'rxjs/delay-when';
import { EMPTY } from 'rxjs/empty';
import { tap } from 'rxjs/tap';
describe('delayWhen (platform)', () => {
  it('should delay by duration selector', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ---a---b---c--|      ');
      const expected = '-----a------c----(b|)';
      const subs = '    ^-------------!      ';
      const selector = [
        observable('             --x--|            '),
        observable('                 ----------(x|)'),
        observable('                     -x--|     '),
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
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('     --a--b--| ');
      const expected = '   ---a--b-| ';
      const subs = '       ^-------! ';
      const selector = observable('-x--|   ');
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
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('      --a--# ');
      const expected = '    ---a-# ';
      const subs = '        ^----! ';
      const selector = observable(' -x--|');
      const selectorSubs = '--^!   ';
      const result = e1[delayWhen]((x) => selector);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
      expectSubscriptions(selector.subscriptions).toBe(selectorSubs);
    });
  });
  it('should raise error if selector raises error', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('      --a--b--|');
      const expected = '    ---#     ';
      const subs = '        ^--!     ';
      const selector = observable(' -#     ');
      const selectorSubs = '--^!     ';
      const result = e1[delayWhen]((x) => selector);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
      expectSubscriptions(selector.subscriptions).toBe(selectorSubs);
    });
  });
  it('should delay by selector and completes after value emits', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('     --a--b--|       ');
      const expected = '   ---------a--(b|)';
      const subs = '       ^-------!       ';
      const selector = observable('-------x--|   ');
      //                        -------x--|
      // prettier-ignore
      const selectorSubs = [
                '                  --^------!      ',
                '                  -----^------!   '
            ];
      const result = e1[delayWhen]((x) => selector);
      expectObservable(result).toBe([
        { frame: 9, notification: { kind: 'N', value: 'a' } },
        { frame: 9, notification: { kind: 'N', value: 'b' } },
        { frame: 9, notification: { kind: 'C' } },
      ]);
      expectSubscriptions(e1.subscriptions).toBe(subs);
      expectSubscriptions(selector.subscriptions).toBe(['--^------!']);
    });
  });
  it('should delay, but not emit if the selector never emits a notification', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('     --a--b--|   ');
      const expected = '   -----------|';
      const subs = '       ^-------!   ';
      const selector = observable('------|   ');
      //                        ------|
      // prettier-ignore
      const selectorSubs = [
                '                  --^-----!   ',
                '                  -----^-----!'
            ];
      const result = e1[delayWhen]((x) => selector);
      expectObservable(result).toBe([{ frame: 8, notification: { kind: 'C' } }]);
      expectSubscriptions(e1.subscriptions).toBe(subs);
      expectSubscriptions(selector.subscriptions).toBe(['--^-----!']);
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
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('     --a--b--|');
      const expected = '   -        ';
      const subs = '       ^-------!';
      const selector = observable('-      ');
      //                        -
      // prettier-ignore
      const selectorSubs = [
                "--^------!",
                "-----^---!"
            ];
      const result = e1[delayWhen]((x) => selector);
      expectObservable(result, '^--------!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
      expectSubscriptions(selector.subscriptions).toBe(['--^------!']);
    });
  });
  it('should delay by first value from selector', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('     --a--b--|       ');
      const expected = '   ------a--(b|)   ';
      const subs = '       ^-------!       ';
      const selector = observable('----x--y--|   ');
      //                        ----x--y--|
      // prettier-ignore
      const selectorSubs = [
                '                  --^---!         ',
                '                  -----^---!      ',
            ];
      const result = e1[delayWhen]((x) => selector);
      expectObservable(result).toBe([
        { frame: 6, notification: { kind: 'N', value: 'a' } },
        { frame: 6, notification: { kind: 'N', value: 'b' } },
        { frame: 8, notification: { kind: 'C' } },
      ]);
      expectSubscriptions(e1.subscriptions).toBe(subs);
      expectSubscriptions(selector.subscriptions).toBe(['--^---!']);
    });
  });
  it('should delay by selector that does not completes', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('     --a--b--|          ');
      const expected = '   ------a--(b|)      ';
      const subs = '       ^-------!          ';
      const selector = observable('----x-----y---   ');
      //                        ----x-----y---
      // prettier-ignore
      const selectorSubs = [
                '                  --^---!            ',
                '                  -----^---!         '
            ];
      const result = e1[delayWhen]((x) => selector);
      expectObservable(result).toBe([
        { frame: 6, notification: { kind: 'N', value: 'a' } },
        { frame: 6, notification: { kind: 'N', value: 'b' } },
        { frame: 8, notification: { kind: 'C' } },
      ]);
      expectSubscriptions(e1.subscriptions).toBe(subs);
      expectSubscriptions(selector.subscriptions).toBe(['--^---!']);
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
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('       -----a---b---| ');
      const expected = '     -------a---b-| ';
      const subs = '         ---^---------! ';
      const selector = observable('     --x--|    ');
      //                              --x--|
      // prettier-ignore
      const selectorSubs = [
                '                      -----^-!     ',
                '                      ---------^-! '
            ];
      const subDelay = observable('---x--|        ');
      const subDelaySub = '  ^--!           ';
      const result = e1[delayWhen]((x) => selector, subDelay);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
      expectSubscriptions(selector.subscriptions).toBe(selectorSubs);
      expectSubscriptions(subDelay.subscriptions).toBe(subDelaySub);
    });
  });
  it('should start subscription when subscription delay completes without emit value', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('       -----a---b---| ');
      const expected = '     -------a---b-| ';
      const subs = '         ---^---------! ';
      const selector = observable('     --x--|    ');
      //                              --x--|
      // prettier-ignore
      const selectorSubs = [
                '                    -----^-!       ',
                '                    ---------^-!   '
            ];
      const subDelay = observable('---|           ');
      const subDelaySub = '  ^--!           ';
      const result = e1[delayWhen]((x) => selector, subDelay);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
      expectSubscriptions(selector.subscriptions).toBe(selectorSubs);
      expectSubscriptions(subDelay.subscriptions).toBe(subDelaySub);
    });
  });
  it('should raise error when subscription delay raises error', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('       -----a---b---|');
      const expected = '     ---#          ';
      const selector = observable('     --x--|   ');
      const subDelay = observable('---#          ');
      const subDelaySub = '  ^--!          ';
      const result = e1[delayWhen]((x) => selector, subDelay);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe([]);
      expectSubscriptions(selector.subscriptions).toBe([]);
      expectSubscriptions(subDelay.subscriptions).toBe(subDelaySub);
    });
  });
  it('should call predicate with indices starting at 0', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('       --a--b--c--|');
      const e1subs = '       ^----------!';
      const expected = '     --a--b--c--|';
      const selector = observable('  (x|)');
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
