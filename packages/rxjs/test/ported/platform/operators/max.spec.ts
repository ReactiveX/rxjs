// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/max-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { max } from 'rxjs/max';
import { mergeMap } from 'rxjs/merge-map';
describe('max (platform)', () => {
  it('should find the max of values of an observable', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--|   ', { a: 42, b: -1, c: 3 });
      const e1subs = '  ^----------!   ';
      const expected = '-----------(x|)';
      expectObservable(e1[max]()).toBe(expected, { x: 42 });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should be never when source is never', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' -');
      const e1subs = '^!';
      const expected = '-';
      expectObservable(e1[max](), '^!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should be zero when source is empty', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' |   ');
      const e1subs = '  (^!)';
      const expected = '|   ';
      expectObservable(e1[max]()).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it("should be never when source doesn't complete", async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--x--^--y--');
      const e1subs = '^-----!';
      const expected = '   ------';
      expectObservable(e1[max](), '^-----!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it("should complete when source doesn't have values", async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-x-^---|');
      const e1subs = '   ^---!';
      const expected = ' ----|';
      expectObservable(e1[max]()).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should max the unique value of an observable', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-x-^--y--|   ', { y: 42 });
      const e1subs = '   ^-----!   ';
      const expected = ' ------(w|)';
      expectObservable(e1[max]()).toBe(expected, { w: 42 });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should max the values of an ongoing hot observable', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a-^-b--c--d--|   ', { a: 42, b: -1, c: 0, d: 6 });
      const e1subs = '    ^----------!   ';
      const expected = '  -----------(x|)';
      expectObservable(e1[max]()).toBe(expected, { x: 6 });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should allow unsubscribing explicitly and early', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--|', { a: 42, b: -1, c: 0 });
      const e1subs = '  ^-----!     ';
      const expected = '-------     ';
      const unsub = '   ------!     ';
      expectObservable(e1[max](), unsub).toBe(expected, { x: 42 });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not break unsubscription chains when result is unsubscribed explicitly', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--|', { a: 42, b: -1, c: 0 });
      const e1subs = '  ^-----!     ';
      const expected = '-------     ';
      const unsub = '   ------!     ';
      const result = e1[mergeMap]((x) => Observable.from([x]))
        [max]()
        [mergeMap]((x) => Observable.from([x]));
      expectObservable(result, unsub).toBe(expected, { x: 42 });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should work with error', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-x-^--y--z--#', { x: 1, y: 2, z: 3 }, 'too bad');
      const e1subs = '   ^--------!';
      const expected = ' ---------#';
      expectObservable(e1[max]()).toBe(expected, null, 'too bad');
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should work with throw', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' #   ');
      const e1subs = '  (^!)';
      const expected = '#   ';
      expectObservable(e1[max]()).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle a constant predicate on an empty hot observable', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-x-^---|');
      const e1subs = '   ^---!';
      const expected = ' ----|';
      const predicate = function () {
        return 42;
      };
      expectObservable(e1[max](predicate)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle a constant predicate on an never hot observable', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-x-^----');
      const e1subs = '^----!';
      const expected = ' -----';
      const predicate = function () {
        return 42;
      };
      expectObservable(e1[max](predicate), '^----!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle a constant predicate on a simple hot observable', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-x-^-a-|   ', { a: 1 });
      const e1subs = '   ^---!   ';
      const expected = ' ----(w|)';
      const predicate = function () {
        return 42;
      };
      expectObservable(e1[max](predicate)).toBe(expected, { w: 1 });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle a reverse predicate on observable with many values', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-a-^-b--c--d-|   ', { a: 42, b: -1, c: 0, d: 666 });
      const e1subs = '   ^---------!   ';
      const expected = ' ----------(w|)';
      const predicate = function (x, y) {
        return x > y ? -1 : 1;
      };
      expectObservable(e1[max](predicate)).toBe(expected, { w: -1 });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle a predicate for string on observable with many values', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-a-^-b--c--d-|   ');
      const e1subs = '   ^---------!   ';
      const expected = ' ----------(w|)';
      const predicate = function (x, y) {
        return x > y ? -1 : 1;
      };
      expectObservable(e1[max](predicate)).toBe(expected, { w: 'b' });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle a constant predicate on observable that throws', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-1-^---#');
      const e1subs = '   ^---!';
      const expected = ' ----#';
      const predicate = () => {
        return 42;
      };
      expectObservable(e1[max](predicate)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle a predicate that throws, on observable with many values', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-1-^-2--3--|');
      const e1subs = '   ^----!   ';
      const expected = ' -----#   ';
      const predicate = function (x, y) {
        if (y === '3') {
          throw 'error';
        }
        return x > y ? -1 : 1;
      };
      expectObservable(e1[max](predicate)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
});
