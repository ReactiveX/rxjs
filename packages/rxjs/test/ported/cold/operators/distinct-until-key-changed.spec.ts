// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/distinctUntilKeyChanged-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { ColdObservable } from 'rxjs/cold-observable';
import { distinctUntilKeyChanged } from 'rxjs/distinct-until-key-changed';
import { mergeMap } from 'rxjs/merge-map';
describe('distinctUntilKeyChanged (cold)', () => {
  it('should distinguish between values', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const values = { a: { k: 1 }, b: { k: 2 }, c: { k: 3 } };
      const e1 = hot('  -a--b-b----a-c-|', values);
      const e1Subs = '  ^--------------!';
      const expected = '-a--b------a-c-|';
      const result = e1[distinctUntilKeyChanged]('k');
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1Subs);
    });
  });
  it('should distinguish between values', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const values = { a: { val: 1 }, b: { val: 2 } };
      const e1 = hot('  --a--a--a--b--b--a--|', values);
      const e1subs = '  ^-------------------!';
      const expected = '--a--------b-----a--|';
      expectObservable(e1[distinctUntilKeyChanged]('val')).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should distinguish between values and does not complete', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const values = { a: { val: 1 }, b: { val: 2 } };
      const e1 = hot('  --a--a--a--b--b--a-', values);
      const e1subs = '^------------------!';
      const expected = '--a--------b-----a-';
      expectObservable(e1[distinctUntilKeyChanged]('val'), '^------------------!').toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should distinguish between values with key', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const values = { a: { val: 1 }, b: { valOther: 1 }, c: { valOther: 3 }, d: { val: 1 }, e: { val: 5 } };
      const e1 = hot('--a--b--c--d--e--|', values);
      const e1subs = '     ^----------------!';
      const expected = '   --a--b-----d--e--|';
      expectObservable(e1[distinctUntilKeyChanged]('val')).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not compare if source does not have element with key', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const values = { a: { valOther: 1 }, b: { valOther: 1 }, c: { valOther: 3 }, d: { valOther: 1 }, e: { valOther: 5 } };
      const e1 = hot('--a--b--c--d--e--|', values);
      const e1subs = '     ^----------------!';
      const expected = '   --a--------------|';
      expectObservable(e1[distinctUntilKeyChanged]('val')).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not complete if source never completes', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('-');
      const e1subs = '^!';
      const expected = '    -';
      expectObservable(e1[distinctUntilKeyChanged]('val'), '^!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not complete if source does not complete', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-');
      const e1subs = '^!';
      const expected = '   -';
      expectObservable(e1[distinctUntilKeyChanged]('val'), '^!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should complete if source is empty', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('|');
      const e1subs = '      (^!)';
      const expected = '    |';
      expectObservable(e1[distinctUntilKeyChanged]('val')).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should complete if source does not emit', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('------|');
      const e1subs = '     ^-----!';
      const expected = '   ------|';
      expectObservable(e1[distinctUntilKeyChanged]('val')).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should emit if source emits single element only', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const values = { a: { val: 1 } };
      const e1 = hot('  --a--|', values);
      const e1subs = '  ^----!';
      const expected = '--a--|';
      expectObservable(e1[distinctUntilKeyChanged]('val')).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should emit if source is scalar', async () => {
    await rxTest(({ expectObservable }) => {
      const values = { a: { val: 1 } };
      const e1 = ColdObservable.from([values.a]);
      const expected = '(a|)';
      expectObservable(e1[distinctUntilKeyChanged]('val')).toBe(expected, values);
    });
  });
  it('should raise error if source raises error', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const values = { a: { val: 1 } };
      const e1 = hot('  --a--a--#', values);
      const e1subs = '  ^-------!';
      const expected = '--a-----#';
      expectObservable(e1[distinctUntilKeyChanged]('val')).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should raise error if source throws', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('#   ');
      const e1subs = '      (^!)';
      const expected = '    #   ';
      expectObservable(e1[distinctUntilKeyChanged]('val')).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not omit if source elements are all different', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const values = { a: { val: 1 }, b: { val: 2 }, c: { val: 3 }, d: { val: 4 }, e: { val: 5 } };
      const e1 = hot('  --a--b--c--d--e--|', values);
      const e1subs = '  ^----------------!';
      const expected = '--a--b--c--d--e--|';
      expectObservable(e1[distinctUntilKeyChanged]('val')).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should allow unsubscribing early and explicitly', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const values = { a: { val: 1 }, b: { val: 2 }, c: { val: 3 }, d: { val: 4 }, e: { val: 5 } };
      const e1 = hot('  --a--b--b--d--a--e--|', values);
      const e1subs = '  ^---------!          ';
      const expected = '--a--b-----          ';
      const unsub = '   ----------!          ';
      const result = e1[distinctUntilKeyChanged]('val');
      expectObservable(result, unsub).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not break unsubscription chains when unsubscribed explicitly', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const values = { a: { val: 1 }, b: { val: 2 }, c: { val: 3 }, d: { val: 4 }, e: { val: 5 } };
      const e1 = hot('  --a--b--b--d--a--e--|', values);
      const e1subs = '  ^---------!          ';
      const expected = '--a--b-----          ';
      const unsub = '   ----------!          ';
      const result = e1[mergeMap]((x) => ColdObservable.from([x]))
        [distinctUntilKeyChanged]('val')
        [mergeMap]((x) => ColdObservable.from([x]));
      expectObservable(result, unsub).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should emit once if source elements are all same', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const values = { a: { val: 1 } };
      const e1 = hot('  --a--a--a--a--a--a--|', values);
      const e1subs = '  ^-------------------!';
      const expected = '--a-----------------|';
      expectObservable(e1[distinctUntilKeyChanged]('val')).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should emit once if comparer returns true always regardless of source emits', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const values = { a: { val: 1 }, b: { val: 2 }, c: { val: 3 }, d: { val: 4 }, e: { val: 5 } };
      const e1 = hot('  --a--b--c--d--e--|', values);
      const e1subs = '  ^----------------!';
      const expected = '--a--------------|';
      expectObservable(e1[distinctUntilKeyChanged]('val', () => true)).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should emit all if comparer returns false always regardless of source emits', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const values = { a: { val: 1 } };
      const e1 = hot('  --a--a--a--a--a--a--|', values);
      const e1subs = '  ^-------------------!';
      const expected = '--a--a--a--a--a--a--|';
      expectObservable(e1[distinctUntilKeyChanged]('val', () => false)).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should distinguish values by selector', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const values = { a: { val: 1 }, b: { val: 2 }, c: { val: 3 }, d: { val: 4 }, e: { val: 5 } };
      const e1 = hot('  --a--b--c--d--e--|', values);
      const e1subs = '  ^----------------!';
      const expected = '--a-----c-----e--|';
      const selector = (x, y) => y % 2 === 0;
      expectObservable(e1[distinctUntilKeyChanged]('val', selector)).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should raise error when comparer throws', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const values = { a: { val: 1 }, b: { val: 2 }, c: { val: 3 }, d: { val: 4 }, e: { val: 5 } };
      const e1 = hot('  --a--b--c--d--e--|', values);
      const e1subs = '  ^----------!      ';
      const expected = '--a--b--c--#      ';
      const selector = (x, y) => {
        if (y === 4) {
          throw 'error';
        }
        return x === y;
      };
      expectObservable(e1[distinctUntilKeyChanged]('val', selector)).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
});
