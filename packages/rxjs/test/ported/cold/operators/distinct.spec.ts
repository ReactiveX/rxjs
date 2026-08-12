// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/distinct-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { ColdObservable } from 'rxjs/cold-observable';
import { distinct } from 'rxjs/distinct';
import { mergeMap } from 'rxjs/merge-map';
describe('distinct (cold)', () => {
  it('should distinguish between values', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--a--a--b--b--a--|');
      const e1subs = '  ^-------------------!';
      const expected = '--a--------b--------|';
      expectObservable(e1[distinct]()).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should distinguish between values and does not complete', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--a--a--b--b--a-');
      const e1subs = '^------------------!';
      const expected = '--a--------b-------';
      expectObservable(e1[distinct](), '^------------------!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not complete if source never completes', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' -');
      const e1subs = '^!';
      const expected = '-';
      expectObservable(e1[distinct](), '^!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not complete if source does not complete', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -');
      const e1subs = '^!';
      const expected = '-';
      expectObservable(e1[distinct](), '^!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should complete if source is empty', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' |');
      const e1subs = '  (^!)';
      const expected = '|';
      expectObservable(e1[distinct]()).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should complete if source does not emit', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ------|');
      const e1subs = '  ^-----!';
      const expected = '------|';
      expectObservable(e1[distinct]()).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should emit if source emits single element only', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--|');
      const e1subs = '  ^----!';
      const expected = '--a--|';
      expectObservable(e1[distinct]()).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should emit if source is scalar', async () => {
    await rxTest(({ expectObservable }) => {
      const e1 = ColdObservable.from(['a']);
      const expected = '(a|)';
      expectObservable(e1[distinct]()).toBe(expected);
    });
  });
  it('should raises error if source raises error', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--a--#');
      const e1subs = '  ^-------!';
      const expected = '--a-----#';
      expectObservable(e1[distinct]()).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should raises error if source throws', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' #   ');
      const e1subs = '  (^!)';
      const expected = '#   ';
      expectObservable(e1[distinct]()).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not omit if source elements are all different', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--d--e--f--|');
      const e1subs = '  ^-------------------!';
      const expected = '--a--b--c--d--e--f--|';
      expectObservable(e1[distinct]()).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should allow unsubscribing early and explicitly', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--b--d--a--f--|');
      const e1subs = '  ^---------!          ';
      const expected = '--a--b-----          ';
      const unsub = '   ----------!          ';
      const result = e1[distinct]();
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
        [distinct]()
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
      expectObservable(e1[distinct]()).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should distinguish values by key', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const values = { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 };
      const e1 = hot('  --a--b--c--d--e--f--|', values);
      const e1subs = '  ^-------------------!';
      const expected = '--a--b--c-----------|';
      const selector = (value) => value % 3;
      expectObservable(e1[distinct](selector)).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should raises error when selector throws', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--d--e--f--|');
      const e1subs = '  ^----------!         ';
      const expected = '--a--b--c--#         ';
      const selector = (value) => {
        if (value === 'd') {
          throw new Error('d is for dumb');
        }
        return value;
      };
      expectObservable(e1[distinct](selector)).toBe(expected, undefined, new Error('d is for dumb'));
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should support a flushing stream', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--a--b--a--b--|');
      const e1subs = '  ^-------------------!';
      const e2 = hot('  -----------x--------|');
      const e2subs = '  ^-------------------!';
      const expected = '--a--b--------a--b--|';
      expectObservable(e1[distinct](undefined, e2)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should raise error if flush raises error', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--a--b--a--b--|');
      const e1subs = '  ^------------!       ';
      const e2 = hot('  -----------x-#       ');
      const e2subs = '  ^------------!       ';
      const expected = '--a--b-------#       ';
      expectObservable(e1[distinct](undefined, e2)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should unsubscribe from the flushing stream when the main stream is unsubbed', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--a--b--a--b--|');
      const e1subs = '  ^----------!         ';
      const e2 = hot('  -----------x--------|');
      const e2subs = '  ^----------!         ';
      const unsub = '   -----------!         ';
      const expected = '--a--b------         ';
      expectObservable(e1[distinct](undefined, e2), unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should allow opting in to default comparator with flush', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--a--b--a--b--|');
      const e1subs = '  ^-------------------!';
      const e2 = hot('  -----------x--------|');
      const e2subs = '  ^-------------------!';
      const expected = '--a--b--------a--b--|';
      expectObservable(e1[distinct](undefined, e2)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
});
