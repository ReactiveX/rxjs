// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/mergeMap-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { delay } from 'rxjs/delay';
import { map } from 'rxjs/map';
import { mergeMap } from 'rxjs/merge-map';
describe('mergeMap (platform)', () => {
  it('should map-and-flatten each item to an Observable', async () => {
    function arrayRepeat(value, times) {
      const results = [];
      for (let i = 0; i < times; i++) {
        results.push(value);
      }
      return results;
    }
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const values = { x: 10, y: 30, z: 50 };
      const x = observable('    x-x-x|             ', values);
      //                        y-y-y|
      //                           z-z-z|
      const xsubs = [
        '               --^----!             ',
        '               --------^----!       ',
        '               -----------^----!    ',
      ];
      const e1 = hot('  --1-----3--5--------|');
      const e1subs = '  ^-------------------!';
      const expected = '--x-x-x-y-yzyz-z----|';
      const result = e1[mergeMap]((value) => x[map]((i) => i * +value));
      expectObservable(result).toBe(
        [
          { frame: 2, notification: { kind: 'N', value: 10 } },
          { frame: 4, notification: { kind: 'N', value: 10 } },
          { frame: 6, notification: { kind: 'N', value: 10 } },
          { frame: 8, notification: { kind: 'N', value: 30 } },
          { frame: 10, notification: { kind: 'N', value: 30 } },
          { frame: 12, notification: { kind: 'N', value: 30 } },
          { frame: 12, notification: { kind: 'N', value: 50 } },
          { frame: 20, notification: { kind: 'C' } },
        ],
        values
      );
      expectSubscriptions(x.subscriptions).toBe(['--^----!', '--------^----!']);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should mergeMap many regular interval inners', async () => {
    function arrayRepeat(value, times) {
      const results = [];
      for (let i = 0; i < times; i++) {
        results.push(value);
      }
      return results;
    }
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const a = observable('  ----a---a---a---(a|)                    ');
      const asubs = '   ^---------------!                       ';
      const b = observable('      ----b---b---(b|)                    ');
      const bsubs = '   ----^-----------!                       ';
      const c = observable('                  ----c---c---c---c---(c|)');
      const csubs = '   ----------------^-------------------!   ';
      const d = observable('                          ----(d|)        ');
      const dsubs = '   ------------------------^---!           ';
      const e1 = hot('  a---b-----------c-------d-------|       ');
      const e1subs = '  ^-------------------------------!       ';
      const expected = '----a---(ab)(ab)(ab)c---c---(cd)c---(c|)';
      const observableLookup = { a: a, b: b, c: c, d: d };
      const source = e1[mergeMap]((value) => observableLookup[value]);
      expectObservable(source).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
      expectSubscriptions(c.subscriptions).toBe(csubs);
      expectSubscriptions(d.subscriptions).toBe(dsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should mergeMap many outer values to many inner values', async () => {
    function arrayRepeat(value, times) {
      const results = [];
      for (let i = 0; i < times; i++) {
        results.push(value);
      }
      return results;
    }
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
      const result = e1[mergeMap](() => x);
      expectObservable(result).toBe([
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
  it('should mergeMap many outer to many inner, complete late', async () => {
    function arrayRepeat(value, times) {
      const results = [];
      for (let i = 0; i < times; i++) {
        results.push(value);
      }
      return results;
    }
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
      const result = e1[mergeMap](() => x);
      expectObservable(result).toBe([
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
  it('should mergeMap many outer to many inner, outer never completes', async () => {
    function arrayRepeat(value, times) {
      const results = [];
      for (let i = 0; i < times; i++) {
        results.push(value);
      }
      return results;
    }
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
      const expected = '-----i---j---(ki)(lj)(ki)(lj)(ki)(lj)(ki)(lj)k---l---i--';
      const unsub = '   -------------------------------------------------------!';
      const source = e1[mergeMap](() => x);
      expectObservable(source, unsub).toBe([
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
    function arrayRepeat(value, times) {
      const results = [];
      for (let i = 0; i < times; i++) {
        results.push(value);
      }
      return results;
    }
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
      const expected = '-----i---j---(ki)(lj)(ki)(lj)(ki)(lj)(ki)(lj)k---l---i--';
      const unsub = '   -------------------------------------------------------!';
      const source = e1[map]((x) => x)
        [mergeMap](() => x)
        [map]((x) => x);
      expectObservable(source, unsub).toBe([
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
  it('should not break unsubscription chains with interop inners when result is unsubscribed explicitly', async () => {
    const asInteropObservable = (source) =>
      new Proxy(source, {
        get(target, key) {
          if (key === 'subscribe') {
            return (...args) => Reflect.apply(target.subscribe, target, args);
          }
          return Reflect.get(target, key, target);
        },
        getPrototypeOf(target) {
          const prototype = Reflect.getPrototypeOf(target);
          return { ...prototype, subscribe: (...args) => Reflect.apply(target.subscribe, target, args) };
        },
      });
    function arrayRepeat(value, times) {
      const results = [];
      for (let i = 0; i < times; i++) {
        results.push(value);
      }
      return results;
    }
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const x = observable('           --a--b--c--d--e--|           ');
      const xsubs = '   ---------^-----------!                ';
      const y = observable('                     ---f---g---h---i--|');
      const ysubs = '   -------------------^-!                ';
      const e1 = hot('  ---------x---------y---------|        ');
      const e1subs = '  ^--------------------!                ';
      const expected = '-----------a--b--c--d-                ';
      const unsub = '   ---------------------!                ';
      const observableLookup = { x: x, y: y };
      // This test manipulates the observable to make it look like an interop
      // observable - an observable from a foreign library. Interop subscribers
      // are treated differently: they are wrapped in a safe subscriber. This
      // test ensures that unsubscriptions are chained all the way to the
      // interop subscriber.
      const result = e1[mergeMap]((x) => Observable.from([x]))
        [mergeMap]((value) => asInteropObservable(observableLookup[value]))
        [mergeMap]((x) => Observable.from([x]));
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should mergeMap many outer to many inner, inner never completes', async () => {
    function arrayRepeat(value, times) {
      const results = [];
      for (let i = 0; i < times; i++) {
        results.push(value);
      }
      return results;
    }
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const x = observable('   ----i---j---k---l-------------------------');
      //                         ----i---j---k---l-----------------
      //                                 ----i---j---k---l---------
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
      const result = e1[mergeMap](() => x);
      expectObservable(result, '^------------------------------------------------------!').toBe([
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
  it('should mergeMap many outer to many inner, and inner throws', async () => {
    function arrayRepeat(value, times) {
      const results = [];
      for (let i = 0; i < times; i++) {
        results.push(value);
      }
      return results;
    }
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const x = observable('   ----i---j---k---l-------#   ');
      //                         ----i---j---k---l
      //                                 ----i---j
      //                                         -
      const xsubs = [
        '               -^-----------------------!   ',
        '               ---------^---------------!   ',
        '               -----------------^-------!   ',
        '               -------------------------(^!)',
      ];
      const e1 = hot('  -a-------b-------c-------d   ');
      const e1subs = '  ^------------------------!   ';
      const expected = '-----i---j---(ki)(lj)(ki)#   ';
      const result = e1[mergeMap](() => x);
      expectObservable(result).toBe([
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
  it('should mergeMap many outer to many inner, and outer throws', async () => {
    function arrayRepeat(value, times) {
      const results = [];
      for (let i = 0; i < times; i++) {
        results.push(value);
      }
      return results;
    }
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
      const result = e1[mergeMap](() => x);
      expectObservable(result).toBe([
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
  it('should mergeMap many outer to many inner, both inner and outer throw', async () => {
    function arrayRepeat(value, times) {
      const results = [];
      for (let i = 0; i < times; i++) {
        results.push(value);
      }
      return results;
    }
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
      const result = e1[mergeMap](() => x);
      expectObservable(result).toBe([
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
  it('should mergeMap to many cold Observable, with parameter concurrency=1', async () => {
    function arrayRepeat(value, times) {
      const results = [];
      for (let i = 0; i < times; i++) {
        results.push(value);
      }
      return results;
    }
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
      const project = () => x;
      const result = e1[mergeMap](project, { concurrent: 1 });
      expectObservable(result).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should mergeMap to many cold Observable, with parameter concurrency=2', async () => {
    function arrayRepeat(value, times) {
      const results = [];
      for (let i = 0; i < times; i++) {
        results.push(value);
      }
      return results;
    }
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
      const project = () => x;
      const result = e1[mergeMap](project, { concurrent: 2 });
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
  it('should mergeMap to many hot Observable, with parameter concurrency=1', async () => {
    function arrayRepeat(value, times) {
      const results = [];
      for (let i = 0; i < times; i++) {
        results.push(value);
      }
      return results;
    }
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('   x----i---j---k---l---|                                        ');
      const asubs = '   -^-------------------!                                        ';
      const b = hot('   -x-x-xxxx-x-x-xxxxx-x----i---j---k---l---|                    ');
      const bsubs = '   ---------------------^-------------------!                    ';
      const c = hot('   x-xxxx---x-x-x-x-x-xx--x--x-x--x--xxxx-x-----i---j---k---l---|');
      const csubs = '   -----------------------------------------^-------------------!';
      const e1 = hot('  -a-------b-------c---|                                        ');
      const e1subs = '  ^--------------------!                                        ';
      const expected = '-----i---j---k---l-------i---j---k---l-------i---j---k---l---|';
      const inners = { a: a, b: b, c: c };
      const project = (x) => inners[x];
      const result = e1[mergeMap](project, { concurrent: 1 });
      expectObservable(result).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
      expectSubscriptions(c.subscriptions).toBe(csubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should mergeMap to many hot Observable, with parameter concurrency=2', async () => {
    function arrayRepeat(value, times) {
      const results = [];
      for (let i = 0; i < times; i++) {
        results.push(value);
      }
      return results;
    }
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const x = hot('   x----i---j---k---l---|                    ');
      const xsubs = '   -^-------------------!                    ';
      const y = hot('   -x-x-xxxx----i---j---k---l---|            ');
      const ysubs = '   ---------^-------------------!            ';
      const z = hot('   x-xxxx---x-x-x-x-x-xx----i---j---k---l---|');
      const zsubs = '   ---------------------^-------------------!';
      const e1 = hot('  -a-------b-------c---|                    ');
      const e1subs = '  ^--------------------!                    ';
      const expected = '-----i---j---(ki)(lj)k---(li)j---k---l---|';
      const inners = { a: x, b: y, c: z };
      const project = (x) => inners[x];
      const result = e1[mergeMap](project, { concurrent: 2 });
      expectObservable(result).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(z.subscriptions).toBe(zsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should mergeMap many complex, where all inners are finite', async () => {
    function arrayRepeat(value, times) {
      const results = [];
      for (let i = 0; i < times; i++) {
        results.push(value);
      }
      return results;
    }
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const a = observable(' -#                                                  ');
      const asubs = [];
      const b = observable('   -#                                                ');
      const bsubs = [];
      const c = observable('        -2--3--4--5------------------6-|             ');
      const csubs = '       --^------------------------------!             ';
      const d = observable('              -----------2--3|                       ');
      const dsubs = '       --------^--------------!                       ';
      const e = observable('                     -1--------2--3-----4--5--------|');
      const esubs = '       ---------------^------------------------------!';
      const f = observable('                                      --|            ');
      const fsubs = '       --------------------------------^-!            ';
      const g = observable('                                            ---1-2|  ');
      const gsubs = '       --------------------------------------^-----!  ';
      const e1 = hot('-a-b--^-c-----d------e----------------f-----g|       ');
      const e1subs = '      ^--------------------------------------!       ';
      const expected = '    ---2--3--4--5---1--2--3--2--3--6--4--5---1-2--|';
      const observableLookup = { a: a, b: b, c: c, d: d, e: e, f: f, g: g };
      const result = e1[mergeMap]((value) => observableLookup[value]);
      expectObservable(result).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
      expectSubscriptions(c.subscriptions).toBe(csubs);
      expectSubscriptions(d.subscriptions).toBe(dsubs);
      expectSubscriptions(e.subscriptions).toBe(esubs);
      expectSubscriptions(f.subscriptions).toBe(fsubs);
      expectSubscriptions(g.subscriptions).toBe(gsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should mergeMap many complex, all inners finite except one', async () => {
    function arrayRepeat(value, times) {
      const results = [];
      for (let i = 0; i < times; i++) {
        results.push(value);
      }
      return results;
    }
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const a = observable(' -#                                                  ');
      const asubs = [];
      const b = observable('   -#                                                ');
      const bsubs = [];
      const c = observable('        -2--3--4--5------------------6-|             ');
      const csubs = '       --^------------------------------!             ';
      const d = observable('              -----------2--3-                       ');
      const dsubs = '--------^----------------------------------------------!';
      const e = observable('                     -1--------2--3-----4--5--------|');
      const esubs = '       ---------------^------------------------------!';
      const f = observable('                                      --|            ');
      const fsubs = '       --------------------------------^-!            ';
      const g = observable('                                            ---1-2|  ');
      const gsubs = '       --------------------------------------^-----!  ';
      const e1 = hot('-a-b--^-c-----d------e----------------f-----g|       ');
      const e1subs = '      ^--------------------------------------!       ';
      const expected = '    ---2--3--4--5---1--2--3--2--3--6--4--5---1-2---';
      const observableLookup = { a: a, b: b, c: c, d: d, e: e, f: f, g: g };
      const result = e1[mergeMap]((value) => observableLookup[value]);
      expectObservable(result, '^------------------------------------------------------!').toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
      expectSubscriptions(c.subscriptions).toBe(csubs);
      expectSubscriptions(d.subscriptions).toBe(dsubs);
      expectSubscriptions(e.subscriptions).toBe(esubs);
      expectSubscriptions(f.subscriptions).toBe(fsubs);
      expectSubscriptions(g.subscriptions).toBe(gsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should mergeMap many complex, inners finite, outer does not complete', async () => {
    function arrayRepeat(value, times) {
      const results = [];
      for (let i = 0; i < times; i++) {
        results.push(value);
      }
      return results;
    }
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const a = observable(' -#                                                  ');
      const asubs = [];
      const b = observable('   -#                                                ');
      const bsubs = [];
      const c = observable('        -2--3--4--5------------------6-|             ');
      const csubs = '       --^------------------------------!             ';
      const d = observable('              -----------2--3|                       ');
      const dsubs = '       --------^--------------!                       ';
      const e = observable('                     -1--------2--3-----4--5--------|');
      const esubs = '       ---------------^------------------------------!';
      const f = observable('                                      --|            ');
      const fsubs = '       --------------------------------^-!            ';
      const g = observable('                                            ---1-2|  ');
      const gsubs = '       --------------------------------------^-----!  ';
      const e1 = hot('-a-b--^-c-----d------e----------------f-----g--------');
      const e1subs = '^------------------------------------------------------!';
      const expected = '    ---2--3--4--5---1--2--3--2--3--6--4--5---1-2---';
      const observableLookup = { a: a, b: b, c: c, d: d, e: e, f: f, g: g };
      const result = e1[mergeMap]((value) => observableLookup[value]);
      expectObservable(result, '^------------------------------------------------------!').toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
      expectSubscriptions(c.subscriptions).toBe(csubs);
      expectSubscriptions(d.subscriptions).toBe(dsubs);
      expectSubscriptions(e.subscriptions).toBe(esubs);
      expectSubscriptions(f.subscriptions).toBe(fsubs);
      expectSubscriptions(g.subscriptions).toBe(gsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should mergeMap many complex, all inners finite, and outer throws', async () => {
    function arrayRepeat(value, times) {
      const results = [];
      for (let i = 0; i < times; i++) {
        results.push(value);
      }
      return results;
    }
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const a = observable(' -#                                                  ');
      const asubs = [];
      const b = observable('   -#                                                ');
      const bsubs = [];
      const c = observable('        -2--3--4--5------------------6-|             ');
      const csubs = '       --^------------------------------!             ';
      const d = observable('              -----------2--3|                       ');
      const dsubs = '       --------^--------------!                       ';
      const e = observable('                     -1--------2--3-----4--5--------|');
      const esubs = '       ---------------^-----------------------!       ';
      const f = observable('                                      --|            ');
      const fsubs = '       --------------------------------^-!            ';
      const g = observable('                                            ---1-2|  ');
      const gsubs = '       --------------------------------------^!       ';
      const e1 = hot('-a-b--^-c-----d------e----------------f-----g#       ');
      const e1subs = '      ^--------------------------------------!       ';
      const expected = '    ---2--3--4--5---1--2--3--2--3--6--4--5-#       ';
      const observableLookup = { a: a, b: b, c: c, d: d, e: e, f: f, g: g };
      const result = e1[mergeMap]((value) => observableLookup[value]);
      expectObservable(result).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
      expectSubscriptions(c.subscriptions).toBe(csubs);
      expectSubscriptions(d.subscriptions).toBe(dsubs);
      expectSubscriptions(e.subscriptions).toBe(esubs);
      expectSubscriptions(f.subscriptions).toBe(fsubs);
      expectSubscriptions(g.subscriptions).toBe(gsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should mergeMap many complex, all inners complete except one throws', async () => {
    function arrayRepeat(value, times) {
      const results = [];
      for (let i = 0; i < times; i++) {
        results.push(value);
      }
      return results;
    }
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const a = observable(' -#                                                  ');
      const asubs = [];
      const b = observable('   -#                                                ');
      const bsubs = [];
      const c = observable('        -2--3--4--5------------------6-#             ');
      const csubs = '       --^------------------------------!             ';
      const d = observable('              -----------2--3|                       ');
      const dsubs = '       --------^--------------!                       ';
      const e = observable('                     -1--------2--3-----4--5--------|');
      const esubs = '       ---------------^-----------------!             ';
      const f = observable('                                      --|            ');
      const fsubs = '       --------------------------------^!             ';
      const g = observable('                                            ---1-2|  ');
      const gsubs = [];
      const e1 = hot('-a-b--^-c-----d------e----------------f-----g|       ');
      const e1subs = '      ^--------------------------------!             ';
      const expected = '    ---2--3--4--5---1--2--3--2--3--6-#             ';
      const observableLookup = { a: a, b: b, c: c, d: d, e: e, f: f, g: g };
      const result = e1[mergeMap]((value) => observableLookup[value]);
      expectObservable(result).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
      expectSubscriptions(c.subscriptions).toBe(csubs);
      expectSubscriptions(d.subscriptions).toBe(dsubs);
      expectSubscriptions(e.subscriptions).toBe(esubs);
      expectSubscriptions(f.subscriptions).toBe(fsubs);
      expectSubscriptions(g.subscriptions).toBe(gsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should mergeMap many complex, all inners finite, outer is unsubscribed', async () => {
    function arrayRepeat(value, times) {
      const results = [];
      for (let i = 0; i < times; i++) {
        results.push(value);
      }
      return results;
    }
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const a = observable(' -#                                                  ');
      const asubs = [];
      const b = observable('   -#                                                ');
      const bsubs = [];
      const c = observable('        -2--3--4--5------------------6-|             ');
      const csubs = '       --^---------------------------!                ';
      const d = observable('              -----------2--3|                       ');
      const dsubs = '       --------^--------------!                       ';
      const e = observable('                     -1--------2--3-----4--5--------|');
      const esubs = '       ---------------^--------------!                ';
      const f = observable('                                      --|            ');
      const fsubs = [];
      const g = observable('                                            ---1-2|  ');
      const gsubs = [];
      const e1 = hot('-a-b--^-c-----d------e----------------f-----g|');
      const e1subs = '      ^-----------------------------!                ';
      const expected = '    ---2--3--4--5---1--2--3--2--3--                ';
      const unsub = '       ------------------------------!                ';
      const observableLookup = { a: a, b: b, c: c, d: d, e: e, f: f, g: g };
      const source = e1[mergeMap]((value) => observableLookup[value]);
      expectObservable(source, unsub).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
      expectSubscriptions(c.subscriptions).toBe(csubs);
      expectSubscriptions(d.subscriptions).toBe(dsubs);
      expectSubscriptions(e.subscriptions).toBe(esubs);
      expectSubscriptions(f.subscriptions).toBe(fsubs);
      expectSubscriptions(g.subscriptions).toBe(gsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should mergeMap many complex, all inners finite, project throws', async () => {
    function arrayRepeat(value, times) {
      const results = [];
      for (let i = 0; i < times; i++) {
        results.push(value);
      }
      return results;
    }
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const a = observable(' -#                                                  ');
      const asubs = [];
      const b = observable('   -#                                                ');
      const bsubs = [];
      const c = observable('        -2--3--4--5------------------6-|             ');
      const csubs = '       --^------------!                               ';
      const d = observable('              -----------2--3|                       ');
      const dsubs = '       --------^------!                               ';
      const e = observable('                     -1--------2--3-----4--5--------|');
      const esubs = [];
      const f = observable('                                      --|            ');
      const fsubs = [];
      const g = observable('                                            ---1-2|  ');
      const gsubs = [];
      const e1 = hot('-a-b--^-c-----d------e----------------f-----g|       ');
      const e1subs = '      ^--------------!                               ';
      const expected = '    ---2--3--4--5--#                               ';
      const observableLookup = { a: a, b: b, c: c, d: d, e: e, f: f, g: g };
      const source = e1[mergeMap]((value) => {
        if (value === 'e') {
          throw 'error';
        }
        return observableLookup[value];
      });
      expectObservable(source).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
      expectSubscriptions(c.subscriptions).toBe(csubs);
      expectSubscriptions(d.subscriptions).toBe(dsubs);
      expectSubscriptions(e.subscriptions).toBe(esubs);
      expectSubscriptions(f.subscriptions).toBe(fsubs);
      expectSubscriptions(g.subscriptions).toBe(gsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should mergeMap many outer to an array for each value', async () => {
    function arrayRepeat(value, times) {
      const results = [];
      for (let i = 0; i < times; i++) {
        results.push(value);
      }
      return results;
    }
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  2-----4--------3--------2-------|');
      const e1subs = '  ^-------------------------------!';
      const expected = '(22)--(4444)---(333)----(22)----|';
      const source = e1[mergeMap]((value) => arrayRepeat(value, +value));
      expectObservable(source).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should mergeMap many outer to inner arrays, and outer throws', async () => {
    function arrayRepeat(value, times) {
      const results = [];
      for (let i = 0; i < times; i++) {
        results.push(value);
      }
      return results;
    }
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  2-----4--------3--------2-------#');
      const e1subs = '  ^-------------------------------!';
      const expected = '(22)--(4444)---(333)----(22)----#';
      const source = e1[mergeMap]((value) => arrayRepeat(value, +value));
      expectObservable(source).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should mergeMap many outer to inner arrays, outer gets unsubscribed', async () => {
    function arrayRepeat(value, times) {
      const results = [];
      for (let i = 0; i < times; i++) {
        results.push(value);
      }
      return results;
    }
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  2-----4--------3--------2-------|');
      const e1subs = '  ^------------!                   ';
      const expected = '(22)--(4444)--                   ';
      const unsub = '   -------------!                   ';
      const source = e1[mergeMap]((value) => arrayRepeat(value, +value));
      expectObservable(source, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should mergeMap many outer to inner arrays, project throws', async () => {
    function arrayRepeat(value, times) {
      const results = [];
      for (let i = 0; i < times; i++) {
        results.push(value);
      }
      return results;
    }
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  2-----4--------3--------2-------|');
      const e1subs = '  ^--------------!                 ';
      const expected = '(22)--(4444)---#                 ';
      const source = e1[mergeMap]((value) => {
        if (value === '3') {
          throw 'error';
        }
        return arrayRepeat(value, +value);
      });
      expectObservable(source).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should properly handle errors from iterables that are processed after some async', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const failure = new Error('we do not allow x');
      const source = observable('-----a------------b-----|', {
        a: ['o', 'o', 'o'],
        b: ['o', 'x', 'o'],
      });
      const iterable = function* (values) {
        for (const value of values) {
          if (value === 'x') {
            throw failure;
          }
          yield value;
        }
      };
      const result = source[mergeMap]((values) => Observable.from([values])[delay](0)[mergeMap](iterable));
      expectObservable(result).toBe('-----(ooo)--------(o#)', undefined, failure);
      expectSubscriptions(source.subscriptions).toBe('^-----------------!');
    });
  });
});
