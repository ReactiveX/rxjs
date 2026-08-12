// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/distinctUntilChanged-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { ColdObservable } from 'rxjs/cold-observable';
import { distinctUntilChanged } from 'rxjs/distinct-until-changed';
import { mergeMap } from 'rxjs/merge-map';
describe('distinctUntilChanged (cold)', () => {
  it('should distinguish between values', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -1--2-2----1-3-|');
      const e1subs = '  ^--------------!';
      const expected = '-1--2------1-3-|';
      expectObservable(e1[distinctUntilChanged]()).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should distinguish between values', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--a--a--b--b--a--|');
      const e1subs = '  ^-------------------!';
      const expected = '--a--------b-----a--|';
      expectObservable(e1[distinctUntilChanged]()).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should distinguish between values and does not complete', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--a--a--b--b--a-');
      const e1subs = '^------------------!';
      const expected = '--a--------b-----a-';
      expectObservable(e1[distinctUntilChanged](), '^------------------!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not complete if source never completes', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' -');
      const e1subs = '^!';
      const expected = '-';
      expectObservable(e1[distinctUntilChanged](), '^!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not complete if source does not complete', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -');
      const e1subs = '^!';
      const expected = '-';
      expectObservable(e1[distinctUntilChanged](), '^!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should complete if source is empty', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' |   ');
      const e1subs = '  (^!)';
      const expected = '|   ';
      expectObservable(e1[distinctUntilChanged]()).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should complete if source does not emit', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ------|');
      const e1subs = '  ^-----!';
      const expected = '------|';
      expectObservable(e1[distinctUntilChanged]()).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should emit if source emits single element only', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--|');
      const e1subs = '  ^----!';
      const expected = '--a--|';
      expectObservable(e1[distinctUntilChanged]()).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should emit if source is scalar', async () => {
    await rxTest(({ expectObservable }) => {
      const e1 = ColdObservable.from(['a']);
      const expected = '(a|)';
      expectObservable(e1[distinctUntilChanged]()).toBe(expected);
    });
  });
  it('should raise error if source raises error', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--a--#');
      const e1subs = '  ^-------!';
      const expected = '--a-----#';
      expectObservable(e1[distinctUntilChanged]()).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should raise error if source throws', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' #   ');
      const e1subs = '  (^!)';
      const expected = '#   ';
      expectObservable(e1[distinctUntilChanged]()).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not omit if source elements are all different', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--d--e--f--|');
      const e1subs = '  ^-------------------!';
      const expected = '--a--b--c--d--e--f--|';
      expectObservable(e1[distinctUntilChanged]()).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should allow unsubscribing early and explicitly', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--b--d--a--f--|');
      const e1subs = '  ^---------!          ';
      const expected = '--a--b-----          ';
      const unsub = '   ----------!          ';
      const result = e1[distinctUntilChanged]();
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not break unsubscription chains when unsubscribed explicitly', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--b--d--a--f--|');
      const e1subs = '  ^---------!          ';
      const expected = '--a--b-----          ';
      const unsub = '   ----------!          ';
      const result = e1[mergeMap]((x) => ColdObservable.from([x]))
        [distinctUntilChanged]()
        [mergeMap]((x) => ColdObservable.from([x]));
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should emit once if source elements are all same', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--a--a--a--a--a--|');
      const e1subs = '  ^-------------------!';
      const expected = '--a-----------------|';
      expectObservable(e1[distinctUntilChanged]()).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should emit once if comparator returns true always regardless of source emits', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--d--e--f--|');
      const e1subs = '  ^-------------------!';
      const expected = '--a-----------------|';
      const comparator = () => true;
      expectObservable(e1[distinctUntilChanged](comparator)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should emit all if comparator returns false always regardless of source emits', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--a--a--a--a--a--|');
      const e1subs = '  ^-------------------!';
      const expected = '--a--a--a--a--a--a--|';
      const comparator = () => false;
      expectObservable(e1[distinctUntilChanged](comparator)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should distinguish values by comparator', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--d--e--f--|', { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 });
      const e1subs = '  ^-------------------!';
      const expected = '--a-----c-----e-----|';
      const comparator = (x, y) => y % 2 === 0;
      expectObservable(e1[distinctUntilChanged](comparator)).toBe(expected, { a: 1, c: 3, e: 5 });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should raise error when comparator throws', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--d--e--f--|');
      const e1subs = '  ^----------!         ';
      const expected = '--a--b--c--#         ';
      const comparator = (x, y) => {
        if (y === 'd') {
          throw 'error';
        }
        return x === y;
      };
      expectObservable(e1[distinctUntilChanged](comparator)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should use the keySelector to pick comparator values', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--d--e--f--|', { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 });
      const e1subs = '  ^-------------------!';
      const expected = '--a--b-----d-----f--|';
      const comparator = (x, y) => y % 2 === 1;
      const keySelector = (x) => x % 2;
      expectObservable(e1[distinctUntilChanged](comparator, keySelector)).toBe(expected, { a: 1, b: 2, d: 4, f: 6 });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should use the keySelector even for the first emit', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--|', { a: 2, b: 4 });
      const e1subs = '  ^-------!';
      const expected = '--a-----|';
      const keySelector = (x) => x % 2;
      expectObservable(e1[distinctUntilChanged](null, keySelector)).toBe(expected, { a: 2 });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should raise error when keySelector throws', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--d--e--f--|');
      const e1subs = '  ^----------!         ';
      const expected = '--a--b--c--#         ';
      const keySelector = (x) => {
        if (x === 'd') {
          throw 'error';
        }
        return x;
      };
      expectObservable(e1[distinctUntilChanged](null, keySelector)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
});
