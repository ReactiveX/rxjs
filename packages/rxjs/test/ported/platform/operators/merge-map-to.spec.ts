// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/mergeMapTo-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { map } from 'rxjs/map';
import { mergeMap } from 'rxjs/merge-map';
describe('mergeMapTo (platform)', () => {
  it('should map-and-flatten each item to an Observable', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const x = observable('    x-x-x|            ');
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
      expectObservable(result).toBe([
        { frame: 2, notification: { kind: 'N', value: 'x' } },
        { frame: 4, notification: { kind: 'N', value: 'x' } },
        { frame: 6, notification: { kind: 'N', value: 'x' } },
        { frame: 8, notification: { kind: 'N', value: 'x' } },
        { frame: 10, notification: { kind: 'N', value: 'x' } },
        { frame: 12, notification: { kind: 'N', value: 'x' } },
        { frame: 12, notification: { kind: 'N', value: 'x' } },
        { frame: 19, notification: { kind: 'C' } },
      ]);
      expectSubscriptions(x.subscriptions).toBe(['--^----!', '--------^----!']);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should mergeMapTo many regular interval inners', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const x = observable('  ----1---2---3---(4|)                        ');
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
      expectObservable(result).toBe([
        { frame: 4, notification: { kind: 'N', value: '1' } },
        { frame: 4, notification: { kind: 'N', value: '1' } },
        { frame: 8, notification: { kind: 'N', value: '2' } },
        { frame: 8, notification: { kind: 'N', value: '2' } },
        { frame: 12, notification: { kind: 'N', value: '3' } },
        { frame: 12, notification: { kind: 'N', value: '3' } },
        { frame: 16, notification: { kind: 'N', value: '4' } },
        { frame: 16, notification: { kind: 'N', value: '4' } },
        { frame: 16, notification: { kind: 'N', value: '4' } },
        { frame: 28, notification: { kind: 'N', value: '1' } },
        { frame: 32, notification: { kind: 'N', value: '2' } },
        { frame: 36, notification: { kind: 'N', value: '3' } },
        { frame: 40, notification: { kind: 'N', value: '4' } },
        { frame: 40, notification: { kind: 'C' } },
      ]);
      expectSubscriptions(x.subscriptions).toBe(['^---------------!', '------------------------^---------------!']);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should mergeMapTo many outer values to many inner values', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const x = observable('   ----i---j---k---l---|                        ');
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
      expectObservable(e1[mergeMap](() => x)).toBe([
        { frame: 5, notification: { kind: 'N', value: 'i' } },
        { frame: 9, notification: { kind: 'N', value: 'j' } },
        { frame: 9, notification: { kind: 'N', value: 'j' } },
        { frame: 13, notification: { kind: 'N', value: 'k' } },
        { frame: 13, notification: { kind: 'N', value: 'k' } },
        { frame: 17, notification: { kind: 'N', value: 'l' } },
        { frame: 17, notification: { kind: 'N', value: 'l' } },
        { frame: 17, notification: { kind: 'N', value: 'l' } },
        { frame: 29, notification: { kind: 'N', value: 'i' } },
        { frame: 33, notification: { kind: 'N', value: 'j' } },
        { frame: 37, notification: { kind: 'N', value: 'k' } },
        { frame: 41, notification: { kind: 'N', value: 'l' } },
        { frame: 45, notification: { kind: 'C' } },
      ]);
      expectSubscriptions(x.subscriptions).toBe(['-^-------------------!', '-------------------------^-------------------!']);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should mergeMapTo many outer to many inner, complete late', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const x = observable('   ----i---j---k---l---|                            ');
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
      expectObservable(e1[mergeMap](() => x)).toBe([
        { frame: 5, notification: { kind: 'N', value: 'i' } },
        { frame: 9, notification: { kind: 'N', value: 'j' } },
        { frame: 9, notification: { kind: 'N', value: 'j' } },
        { frame: 13, notification: { kind: 'N', value: 'k' } },
        { frame: 13, notification: { kind: 'N', value: 'k' } },
        { frame: 17, notification: { kind: 'N', value: 'l' } },
        { frame: 17, notification: { kind: 'N', value: 'l' } },
        { frame: 17, notification: { kind: 'N', value: 'l' } },
        { frame: 29, notification: { kind: 'N', value: 'i' } },
        { frame: 33, notification: { kind: 'N', value: 'j' } },
        { frame: 37, notification: { kind: 'N', value: 'k' } },
        { frame: 41, notification: { kind: 'N', value: 'l' } },
        { frame: 49, notification: { kind: 'C' } },
      ]);
      expectSubscriptions(x.subscriptions).toBe(['-^-------------------!', '-------------------------^-------------------!']);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should mergeMapTo many outer to many inner, outer never completes', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const x = observable('   ----i---j---k---l---|                                  ');
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
      expectObservable(result, unsub).toBe([
        { frame: 5, notification: { kind: 'N', value: 'i' } },
        { frame: 9, notification: { kind: 'N', value: 'j' } },
        { frame: 9, notification: { kind: 'N', value: 'j' } },
        { frame: 13, notification: { kind: 'N', value: 'k' } },
        { frame: 13, notification: { kind: 'N', value: 'k' } },
        { frame: 17, notification: { kind: 'N', value: 'l' } },
        { frame: 17, notification: { kind: 'N', value: 'l' } },
        { frame: 17, notification: { kind: 'N', value: 'l' } },
        { frame: 29, notification: { kind: 'N', value: 'i' } },
        { frame: 33, notification: { kind: 'N', value: 'j' } },
        { frame: 33, notification: { kind: 'N', value: 'j' } },
        { frame: 37, notification: { kind: 'N', value: 'k' } },
        { frame: 37, notification: { kind: 'N', value: 'k' } },
        { frame: 41, notification: { kind: 'N', value: 'l' } },
        { frame: 41, notification: { kind: 'N', value: 'l' } },
        { frame: 53, notification: { kind: 'N', value: 'i' } },
      ]);
      expectSubscriptions(x.subscriptions).toBe([
        '-^-------------------!',
        '-------------------------^-------------------!',
        '-------------------------------------------------^-----!',
      ]);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not break unsubscription chains when result is unsubscribed explicitly', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const x = observable('   ----i---j---k---l---|                                  ');
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
      expectObservable(result, unsub).toBe([
        { frame: 5, notification: { kind: 'N', value: 'i' } },
        { frame: 9, notification: { kind: 'N', value: 'j' } },
        { frame: 9, notification: { kind: 'N', value: 'j' } },
        { frame: 13, notification: { kind: 'N', value: 'k' } },
        { frame: 13, notification: { kind: 'N', value: 'k' } },
        { frame: 17, notification: { kind: 'N', value: 'l' } },
        { frame: 17, notification: { kind: 'N', value: 'l' } },
        { frame: 17, notification: { kind: 'N', value: 'l' } },
        { frame: 29, notification: { kind: 'N', value: 'i' } },
        { frame: 33, notification: { kind: 'N', value: 'j' } },
        { frame: 33, notification: { kind: 'N', value: 'j' } },
        { frame: 37, notification: { kind: 'N', value: 'k' } },
        { frame: 37, notification: { kind: 'N', value: 'k' } },
        { frame: 41, notification: { kind: 'N', value: 'l' } },
        { frame: 41, notification: { kind: 'N', value: 'l' } },
        { frame: 53, notification: { kind: 'N', value: 'i' } },
      ]);
      expectSubscriptions(x.subscriptions).toBe([
        '-^-------------------!',
        '-------------------------^-------------------!',
        '-------------------------------------------------^-----!',
      ]);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should mergeMapTo many outer to many inner, inner never completes', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const x = observable('   ----i---j---k---l-                        ');
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
      ).toBe([
        { frame: 5, notification: { kind: 'N', value: 'i' } },
        { frame: 9, notification: { kind: 'N', value: 'j' } },
        { frame: 9, notification: { kind: 'N', value: 'j' } },
        { frame: 13, notification: { kind: 'N', value: 'k' } },
        { frame: 13, notification: { kind: 'N', value: 'k' } },
        { frame: 17, notification: { kind: 'N', value: 'l' } },
        { frame: 17, notification: { kind: 'N', value: 'l' } },
        { frame: 17, notification: { kind: 'N', value: 'l' } },
      ]);
      expectSubscriptions(x.subscriptions).toBe(['-^-----------------------------------------------------!']);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should mergeMapTo many outer to many inner, and inner throws', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const x = observable('   ----i---j---k---l-------#        ');
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
      expectObservable(e1[mergeMap](() => x)).toBe([
        { frame: 5, notification: { kind: 'N', value: 'i' } },
        { frame: 9, notification: { kind: 'N', value: 'j' } },
        { frame: 9, notification: { kind: 'N', value: 'j' } },
        { frame: 13, notification: { kind: 'N', value: 'k' } },
        { frame: 13, notification: { kind: 'N', value: 'k' } },
        { frame: 17, notification: { kind: 'N', value: 'l' } },
        { frame: 17, notification: { kind: 'N', value: 'l' } },
        { frame: 17, notification: { kind: 'N', value: 'l' } },
        { frame: 25, notification: { kind: 'E', error: 'error' } },
      ]);
      expectSubscriptions(x.subscriptions).toBe(['-^-----------------------!']);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should mergeMapTo many outer to many inner, and outer throws', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const x = observable('   ----i---j---k---l---|            ');
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
      expectObservable(e1[mergeMap](() => x)).toBe([
        { frame: 5, notification: { kind: 'N', value: 'i' } },
        { frame: 9, notification: { kind: 'N', value: 'j' } },
        { frame: 9, notification: { kind: 'N', value: 'j' } },
        { frame: 13, notification: { kind: 'N', value: 'k' } },
        { frame: 13, notification: { kind: 'N', value: 'k' } },
        { frame: 17, notification: { kind: 'N', value: 'l' } },
        { frame: 17, notification: { kind: 'N', value: 'l' } },
        { frame: 17, notification: { kind: 'N', value: 'l' } },
        { frame: 29, notification: { kind: 'N', value: 'i' } },
        { frame: 33, notification: { kind: 'E', error: 'error' } },
      ]);
      expectSubscriptions(x.subscriptions).toBe(['-^-------------------!', '-------------------------^-------!']);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should mergeMapTo many outer to many inner, both inner and outer throw', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const x = observable('   ----i---j---k---l---#            ');
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
      expectObservable(e1[mergeMap](() => x)).toBe([
        { frame: 5, notification: { kind: 'N', value: 'i' } },
        { frame: 9, notification: { kind: 'N', value: 'j' } },
        { frame: 9, notification: { kind: 'N', value: 'j' } },
        { frame: 13, notification: { kind: 'N', value: 'k' } },
        { frame: 13, notification: { kind: 'N', value: 'k' } },
        { frame: 17, notification: { kind: 'N', value: 'l' } },
        { frame: 17, notification: { kind: 'N', value: 'l' } },
        { frame: 17, notification: { kind: 'N', value: 'l' } },
        { frame: 21, notification: { kind: 'E', error: 'error' } },
      ]);
      expectSubscriptions(x.subscriptions).toBe(['-^-------------------!']);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should mergeMapTo many cold Observable, with parameter concurrency=1, without resultSelector', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const x = observable('   ----i---j---k---l---|                                        ');
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
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const x = observable('   ----i---j---k---l---|                    ');
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
      expectObservable(result).toBe([
        { frame: 5, notification: { kind: 'N', value: 'i' } },
        { frame: 9, notification: { kind: 'N', value: 'j' } },
        { frame: 9, notification: { kind: 'N', value: 'j' } },
        { frame: 13, notification: { kind: 'N', value: 'k' } },
        { frame: 13, notification: { kind: 'N', value: 'k' } },
        { frame: 17, notification: { kind: 'N', value: 'l' } },
        { frame: 17, notification: { kind: 'N', value: 'l' } },
        { frame: 25, notification: { kind: 'N', value: 'i' } },
        { frame: 29, notification: { kind: 'N', value: 'j' } },
        { frame: 33, notification: { kind: 'N', value: 'k' } },
        { frame: 37, notification: { kind: 'N', value: 'l' } },
        { frame: 41, notification: { kind: 'C' } },
      ]);
      expectSubscriptions(x.subscriptions).toBe(['-^-------------------!', '---------------------^-------------------!']);
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
