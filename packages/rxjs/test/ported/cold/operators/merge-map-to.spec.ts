// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/mergeMapTo-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { map } from 'rxjs/map';
import { mergeMap } from 'rxjs/merge-map';
describe('mergeMapTo (cold)', () => {
  it('should map-and-flatten each item to an Observable', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const x = cold('    x-x-x|            ');
      //                        x-x-x|
      //                           x-x-x|
      // prettier-ignore
      const xsubs = [
                '               --^----!            ',
                '               --------^----!      ',
                '               -----------^----!   ',
            ];
      const e1 = hot('  --1-----3--5-------|');
      const e1subs = '  ^------------------!';
      const expected = '--x-x-x-x-xxxx-x---|';
      const result = e1[mergeMap](() => x);
      expectObservable(result).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should mergeMapTo many regular interval inners', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const x = cold('  ----1---2---3---(4|)                        ');
      //                    ----1---2---3---(4|)
      //                                ----1---2---3---(4|)
      //                                        ----1---2---3---(4|)
      const xsubs = [
        '               ^---------------!                           ',
        '               ----^---------------!                       ',
        '               ----------------^---------------!           ',
        '               ------------------------^---------------!   ',
      ];
      const e1 = hot('  a---b-----------c-------d-------|           ');
      const e1subs = '  ^-------------------------------!           ';
      const expected = '----1---(21)(32)(43)(41)2---(31)(42)3---(4|)';
      const result = e1[mergeMap](() => x);
      expectObservable(result).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should mergeMapTo many outer values to many inner values', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const x = cold('   ----i---j---k---l---|                        ');
      //                         ----i---j---k---l---|
      //                                 ----i---j---k---l---|
      //                                         ----i---j---k---l---|
      const xsubs = [
        '               -^-------------------!                        ',
        '               ---------^-------------------!                ',
        '               -----------------^-------------------!        ',
        '               -------------------------^-------------------!',
      ];
      const e1 = hot('  -a-------b-------c-------d-------|            ');
      const e1subs = '  ^--------------------------------!            ';
      const expected = '-----i---j---(ki)(lj)(ki)(lj)(ki)(lj)k---l---|';
      expectObservable(e1[mergeMap](() => x)).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should mergeMapTo many outer to many inner, complete late', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const x = cold('   ----i---j---k---l---|                            ');
      //                         ----i---j---k---l---|
      //                                 ----i---j---k---l---|
      //                                         ----i---j---k---l---|
      const xsubs = [
        '               -^-------------------!                            ',
        '               ---------^-------------------!                    ',
        '               -----------------^-------------------!            ',
        '               -------------------------^-------------------!    ',
      ];
      const e1 = hot('  -a-------b-------c-------d-----------------------|');
      const e1subs = '  ^------------------------------------------------!';
      const expected = '-----i---j---(ki)(lj)(ki)(lj)(ki)(lj)k---l-------|';
      expectObservable(e1[mergeMap](() => x)).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should mergeMapTo many outer to many inner, outer never completes', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const x = cold('   ----i---j---k---l---|                                  ');
      //                         ----i---j---k---l---|
      //                                 ----i---j---k---l---|
      //                                         ----i---j---k---l---|
      //                                                 ----i---j---k---l---|
      //                                                                 ----i--
      const xsubs = [
        '               -^-------------------!                                  ',
        '               ---------^-------------------!                          ',
        '               -----------------^-------------------!                  ',
        '               -------------------------^-------------------!          ',
        '               ---------------------------------^-------------------!  ',
        '               -------------------------------------------------^-----!',
      ];
      const e1 = hot('  -a-------b-------c-------d-------e---------------f------');
      const e1subs = '  ^------------------------------------------------------!';
      const expected = '-----i---j---(ki)(lj)(ki)(lj)(ki)(lj)(ki)(lj)k---l---i-';
      const unsub = '   -------------------------------------------------------!';
      const result = e1[mergeMap](() => x);
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not break unsubscription chains when result is unsubscribed explicitly', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const x = cold('   ----i---j---k---l---|                                  ');
      //                         ----i---j---k---l---|
      //                                 ----i---j---k---l---|
      //                                         ----i---j---k---l---|
      //                                                 ----i---j---k---l---|
      //                                                                 ----i--
      const xsubs = [
        '               -^-------------------!                                  ',
        '               ---------^-------------------!                          ',
        '               -----------------^-------------------!                  ',
        '               -------------------------^-------------------!          ',
        '               ---------------------------------^-------------------!  ',
        '               -------------------------------------------------^-----!',
      ];
      const e1 = hot('  -a-------b-------c-------d-------e---------------f------');
      const e1subs = '  ^------------------------------------------------------!';
      const expected = '-----i---j---(ki)(lj)(ki)(lj)(ki)(lj)(ki)(lj)k---l---i-';
      const unsub = '   -------------------------------------------------------!';
      const result = e1[map]((x) => x)
        [mergeMap](() => x)
        [map]((x) => x);
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should mergeMapTo many outer to many inner, inner never completes', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const x = cold('   ----i---j---k---l-                        ');
      //                         ----i---j---k---l-
      //                                 ----i---j---k---l-
      //                                         ----i---j---k---l-
      const xsubs = [
        '-^-----------------------------------------------------!',
        '---------^---------------------------------------------!',
        '-----------------^-------------------------------------!',
        '-------------------------^-----------------------------!',
      ];
      const e1 = hot('  -a-------b-------c-------d-------|         ');
      const e1subs = '  ^--------------------------------!         ';
      const expected = '-----i---j---(ki)(lj)(ki)(lj)(ki)(lj)k---l-';
      expectObservable(
        e1[mergeMap](() => x),
        '^------------------------------------------------------!'
      ).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should mergeMapTo many outer to many inner, and inner throws', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const x = cold('   ----i---j---k---l-------#        ');
      //                         ----i---j---k---l-------#
      //                                 ----i---j---k---l
      const xsubs = [
        '               -^-----------------------!        ',
        '               ---------^---------------!        ',
        '               -----------------^-------!        ',
        '               -------------------------(^!)     ',
      ];
      const e1 = hot('  -a-------b-------c-------d-------|');
      const e1subs = '  ^------------------------!        ';
      const expected = '-----i---j---(ki)(lj)(ki)#        ';
      expectObservable(e1[mergeMap](() => x)).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should mergeMapTo many outer to many inner, and outer throws', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const x = cold('   ----i---j---k---l---|            ');
      //                         ----i---j---k---l---|
      //                                 ----i---j---k---l
      //                                         ----i---j
      const xsubs = [
        '               -^-------------------!            ',
        '               ---------^-------------------!    ',
        '               -----------------^---------------!',
        '               -------------------------^-------!',
      ];
      const e1 = hot('  -a-------b-------c-------d-------#');
      const e1subs = '  ^--------------------------------!';
      const expected = '-----i---j---(ki)(lj)(ki)(lj)(ki)#';
      expectObservable(e1[mergeMap](() => x)).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should mergeMapTo many outer to many inner, both inner and outer throw', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const x = cold('   ----i---j---k---l---#            ');
      //                         ----i---j---k
      //                                 ----i
      const xsubs = [
        '               -^-------------------!            ',
        '               ---------^-----------!            ',
        '               -----------------^---!            ',
      ];
      const e1 = hot('  -a-------b-------c-------d-------#');
      const e1subs = '  ^--------------------!            ';
      const expected = '-----i---j---(ki)(lj)#            ';
      expectObservable(e1[mergeMap](() => x)).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should mergeMapTo many cold Observable, with parameter concurrency=1, without resultSelector', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const x = cold('   ----i---j---k---l---|                                        ');
      //                                     ----i---j---k---l---|
      //                                                         ----i---j---k---l---|
      const xsubs = [
        '               -^-------------------!                                        ',
        '               ---------------------^-------------------!                    ',
        '               -----------------------------------------^-------------------!',
      ];
      const e1 = hot('  -a-------b-------c---|                                        ');
      const e1subs = '  ^--------------------!                                        ';
      const expected = '-----i---j---k---l-------i---j---k---l-------i---j---k---l---|';
      const result = e1[mergeMap](() => x, { concurrent: 1 });
      expectObservable(result).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should mergeMapTo to many cold Observable, with parameter concurrency=2, without resultSelector', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const x = cold('   ----i---j---k---l---|                    ');
      //                         ----i---j---k---l---|
      //                                     ----i---j---k---l---|
      const xsubs = [
        '               -^-------------------!                    ',
        '               ---------^-------------------!            ',
        '               ---------------------^-------------------!',
      ];
      const e1 = hot('  -a-------b-------c---|                    ');
      const e1subs = '  ^--------------------!                    ';
      const expected = '-----i---j---(ki)(lj)k---(li)j---k---l---|';
      const result = e1[mergeMap](() => x, { concurrent: 2 });
      expectObservable(result).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should mergeMapTo many outer to arrays', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  2-----4--------3--------2-------|');
      const e1subs = '  ^-------------------------------!';
      const expected = '(0123)(0123)---(0123)---(0123)--|';
      const result = e1[mergeMap](() => ['0', '1', '2', '3']);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should mergeMapTo many outer to inner arrays, and outer throws', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  2-----4--------3--------2-------#');
      const e1subs = '  ^-------------------------------!';
      const expected = '(0123)(0123)---(0123)---(0123)--#';
      const result = e1[mergeMap](() => ['0', '1', '2', '3']);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should mergeMapTo many outer to inner arrays, outer gets unsubscribed', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  2-----4--------3--------2-------|');
      const e1subs = '  ^------------!                   ';
      const expected = '(0123)(0123)--                   ';
      const unsub = '   -------------!                   ';
      const result = e1[mergeMap](() => ['0', '1', '2', '3']);
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
});
