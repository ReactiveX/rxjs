// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/concatMapTo-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { ColdObservable } from 'rxjs/cold-observable';
import { mergeMap } from 'rxjs/merge-map';
describe('concatMapTo (cold)', () => {
  it('should map-and-flatten each item to an Observable', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --1-----3--5-------|');
      const e1subs = '  ^------------------!';
      const e2 = cold(' x-x-x|              ', { x: 10 });
      const expected = '--x-x-x-x-x-xx-x-x-|';
      const values = { x: 10 };
      const result = e1[mergeMap](() => e2, { concurrent: 1 });
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should concatMapTo many outer values to many inner values', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const values = { i: 'foo', j: 'bar', k: 'baz', l: 'qux' };
      const e1 = hot('    -a---b---c---d---|                        ');
      const e1subs = '    ^----------------!                        ';
      const inner = cold('--i-j-k-l-|                               ', values);
      const innerSubs = [
        '                 -^---------!                              ',
        '                 -----------^---------!                    ',
        '                 ---------------------^---------!          ',
        '                 -------------------------------^---------!',
      ];
      const expected = '  ---i-j-k-l---i-j-k-l---i-j-k-l---i-j-k-l-|';
      const result = e1[mergeMap](() => inner, { concurrent: 1 });
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(inner.subscriptions).toBe(innerSubs);
    });
  });
  it('should handle an empty source', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' |');
      const e1subs = '  (^!)';
      const inner = cold('-1-2-3|');
      const innerSubs = [];
      const expected = '|';
      const result = e1[mergeMap](() => inner, { concurrent: 1 });
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(inner.subscriptions).toBe(innerSubs);
    });
  });
  it('should handle a never source', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' -');
      const e1subs = '^!';
      const inner = cold('-1-2-3|');
      const innerSubs = [];
      const expected = '-';
      const result = e1[mergeMap](() => inner, { concurrent: 1 });
      expectObservable(result, '^!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(inner.subscriptions).toBe(innerSubs);
    });
  });
  it('should error immediately if given a just-throw source', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' #');
      const e1subs = '  (^!)';
      const inner = cold('-1-2-3|');
      const innerSubs = [];
      const expected = '#';
      const result = e1[mergeMap](() => inner, { concurrent: 1 });
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(inner.subscriptions).toBe(innerSubs);
    });
  });
  it('should return a silenced version of the source if the mapped inner is empty', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('   --a-b--c-|');
      const e1subs = '    ^--------!';
      const inner = cold('|');
      // prettier-ignore
      const innerSubs = [
                '                 --(^!)     ',
                '                 ----(^!)   ',
                '                 -------(^!)',
            ];
      const expected = '  ---------|';
      const result = e1[mergeMap](() => inner, { concurrent: 1 });
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(inner.subscriptions).toBe(innerSubs);
    });
  });
  it('should return a never if the mapped inner is never', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('   --a-b--c-|');
      const e1subs = '    ^--------!';
      const inner = cold('-');
      const innerSubs = '--^-------!';
      const expected = '  ----------';
      const result = e1[mergeMap](() => inner, { concurrent: 1 });
      expectObservable(result, '^---------!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(inner.subscriptions).toBe(innerSubs);
    });
  });
  it('should propagate errors if the mapped inner is a just-throw Observable', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('   --a-b--c-|');
      const e1subs = '    ^-!       ';
      const inner = cold('#');
      const innerSubs = ' --(^!)    ';
      const expected = '  --#';
      const result = e1[mergeMap](() => inner, { concurrent: 1 });
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(inner.subscriptions).toBe(innerSubs);
    });
  });
  it('should concatMapTo many outer to many inner, complete late', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const values = { i: 'foo', j: 'bar', k: 'baz', l: 'qux' };
      const e1 = hot('    -a---b---c---d----------------------------------|');
      const e1subs = '    ^-----------------------------------------------!';
      const inner = cold('--i-j-k-l-|                                      ', values);
      const innerSubs = [
        '                 -^---------!                                     ',
        '                 -----------^---------!                           ',
        '                 ---------------------^---------!                 ',
        '                 -------------------------------^---------!       ',
      ];
      const expected = '  ---i-j-k-l---i-j-k-l---i-j-k-l---i-j-k-l--------|';
      const result = e1[mergeMap](() => inner, { concurrent: 1 });
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(inner.subscriptions).toBe(innerSubs);
    });
  });
  it('should concatMapTo many outer to many inner, outer never completes', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const values = { i: 'foo', j: 'bar', k: 'baz', l: 'qux' };
      const e1 = hot('    -a---b---c---d-----------------------------------');
      const e1subs = '^------------------------------------------------!';
      const inner = cold('--i-j-k-l-|                                      ', values);
      const innerSubs = [
        '                 -^---------!                                     ',
        '                 -----------^---------!                           ',
        '                 ---------------------^---------!                 ',
        '                 -------------------------------^---------!       ',
      ];
      const expected = '  ---i-j-k-l---i-j-k-l---i-j-k-l---i-j-k-l---------';
      const result = e1[mergeMap](() => inner, { concurrent: 1 });
      expectObservable(result, '^------------------------------------------------!').toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(inner.subscriptions).toBe(innerSubs);
    });
  });
  it('should not break unsubscription chains when result is unsubscribed explicitly', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const values = { i: 'foo', j: 'bar', k: 'baz', l: 'qux' };
      const e1 = hot('    -a---b---c---d---| ');
      const e1subs = '    ^----------------! ';
      const inner = cold('--i-j-k-l-|        ', values);
      // prettier-ignore
      const innerSubs = [
                '                 -^---------!       ',
                '                 -----------^------!',
            ];
      const expected = '  ---i-j-k-l---i-j-k-';
      const unsub = '     ------------------!';
      const result = e1[mergeMap]((x) => ColdObservable.from([x]))
        [mergeMap](() => inner, { concurrent: 1 })
        [mergeMap]((x) => ColdObservable.from([x]));
      expectObservable(result, unsub).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(inner.subscriptions).toBe(innerSubs);
    });
  });
  it('should concatMapTo many outer to many inner, inner never completes', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const values = { i: 'foo', j: 'bar', k: 'baz', l: 'qux' };
      const e1 = hot('    -a---b---c---d---|');
      const e1subs = '    ^----------------!';
      const inner = cold('--i-j-k-l-        ', values);
      const innerSubs = '-^----------------!';
      const expected = '  ---i-j-k-l--------';
      const result = e1[mergeMap](() => inner, { concurrent: 1 });
      expectObservable(result, '^-----------------!').toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(inner.subscriptions).toBe(innerSubs);
    });
  });
  it('should concatMapTo many outer to many inner, and inner throws', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const values = { i: 'foo', j: 'bar', k: 'baz', l: 'qux' };
      const e1 = hot('    -a---b---c---d---|');
      const e1subs = '    ^----------!      ';
      const inner = cold('--i-j-k-l-#       ', values);
      const innerSubs = ' -^---------!      ';
      const expected = '  ---i-j-k-l-#      ';
      const result = e1[mergeMap](() => inner, { concurrent: 1 });
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(inner.subscriptions).toBe(innerSubs);
    });
  });
  it('should concatMapTo many outer to many inner, and outer throws', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const values = { i: 'foo', j: 'bar', k: 'baz', l: 'qux' };
      const e1 = hot('    -a---b---c---d---#');
      const e1subs = '    ^----------------!';
      const inner = cold('--i-j-k-l-|       ', values);
      // prettier-ignore
      const innerSubs = [
                '                 -^---------!      ',
                '                 -----------^-----!',
            ];
      const expected = '  ---i-j-k-l---i-j-#';
      const result = e1[mergeMap](() => inner, { concurrent: 1 });
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(inner.subscriptions).toBe(innerSubs);
    });
  });
  it('should concatMapTo many outer to many inner, both inner and outer throw', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const values = { i: 'foo', j: 'bar', k: 'baz', l: 'qux' };
      const e1 = hot('    -a---b---c---d---#');
      const e1subs = '    ^----------!      ';
      const inner = cold('--i-j-k-l-#       ', values);
      const innerSubs = ' -^---------!      ';
      const expected = '  ---i-j-k-l-#      ';
      const result = e1[mergeMap](() => inner, { concurrent: 1 });
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(inner.subscriptions).toBe(innerSubs);
    });
  });
  it('should concatMapTo many outer to an array', async () => {
    await rxTest(({ hot, expectObservable }) => {
      const e1 = hot('  2-----4--------3--------2-------|');
      const expected = '(0123)(0123)---(0123)---(0123)--|';
      const result = e1[mergeMap](() => ['0', '1', '2', '3'], { concurrent: 1 });
      expectObservable(result).toBe(expected);
    });
  });
  it('should concatMapTo many outer to inner arrays, and outer throws', async () => {
    await rxTest(({ hot, expectObservable }) => {
      const e1 = hot('  2-----4--------3--------2-------#');
      const expected = '(0123)(0123)---(0123)---(0123)--#';
      const result = e1[mergeMap](() => ['0', '1', '2', '3'], { concurrent: 1 });
      expectObservable(result).toBe(expected);
    });
  });
  it('should concatMapTo many outer to inner arrays, outer unsubscribed early', async () => {
    await rxTest(({ hot, expectObservable }) => {
      const e1 = hot('  2-----4--------3--------2-------|');
      const unsub = '   -------------!';
      const expected = '(0123)(0123)--';
      const result = e1[mergeMap](() => ['0', '1', '2', '3'], { concurrent: 1 });
      expectObservable(result, unsub).toBe(expected);
    });
  });
});
