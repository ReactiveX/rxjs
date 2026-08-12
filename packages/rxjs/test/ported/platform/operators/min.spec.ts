// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/min-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { mergeMap } from 'rxjs/merge-map';
import { min } from 'rxjs/min';
describe('min (platform)', () => {
  it('should min the values of an observable', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('--a--b--c--|', { a: 42, b: -1, c: 3 });
      const subs = '      ^----------!';
      const expected = '  -----------(x|)';
      expectObservable(source[min]()).toBe(expected, { x: -1 });
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should be never when source is never', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' -');
      const e1subs = '^!';
      const expected = '-';
      expectObservable(e1[min](), '^!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should be zero when source is empty', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' |');
      const e1subs = '  (^!)';
      const expected = '|';
      expectObservable(e1[min]()).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it("should be never when source doesn't complete", async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--x--^--y--');
      const e1subs = '^-----!';
      const expected = '   ------';
      expectObservable(e1[min](), '^-----!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it("should be completes when source doesn't have values", async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-x-^---|');
      const e1subs = '   ^---!';
      const expected = ' ----|';
      expectObservable(e1[min]()).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should min the unique value of an observable', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-x-^--y--|', { y: 42 });
      const e1subs = '   ^-----!';
      const expected = ' ------(w|)';
      expectObservable(e1[min]()).toBe(expected, { w: 42 });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should min the values of an ongoing hot observable', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a-^-b--c--d--|', { a: 42, b: -1, c: 0, d: 666 });
      const subs = '      ^----------!';
      const expected = '  -----------(x|)';
      expectObservable(e1[min]()).toBe(expected, { x: -1 });
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });
  it('should work with error', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-x-^--y--z--#', { x: 1, y: 2, z: 3 }, 'too bad');
      const e1subs = '   ^--------!';
      const expected = ' ---------#';
      expectObservable(e1[min]()).toBe(expected, null, 'too bad');
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should work with throw', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' #');
      const e1subs = '  (^!)';
      const expected = '#';
      expectObservable(e1[min]()).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle a constant predicate on an empty hot observable', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-x-^---|');
      const e1subs = '   ^---!';
      const expected = ' ----|';
      const predicate = function (x, y) {
        return 42;
      };
      expectObservable(e1[min](predicate)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle a constant predicate on an never hot observable', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-x-^----');
      const e1subs = '^----!';
      const expected = ' -----';
      const predicate = function (x, y) {
        return 42;
      };
      expectObservable(e1[min](predicate), '^----!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle a constant predicate on a simple hot observable', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-x-^-a-|', { a: 1 });
      const e1subs = '   ^---!';
      const expected = ' ----(w|)';
      const predicate = () => {
        return 42;
      };
      expectObservable(e1[min](predicate)).toBe(expected, { w: 1 });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should allow unsubscribing explicitly and early', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-x-^-a-b-c-d-e-f-g-|');
      const unsub = '    -------!         ';
      const e1subs = '   ^------!         ';
      const expected = ' --------         ';
      const predicate = () => {
        return 42;
      };
      expectObservable(e1[min](predicate), unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not break unsubscription chains when result is unsubscribed explicitly', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-x-^-a-b-c-d-e-f-g-|');
      const e1subs = '   ^------!         ';
      const expected = ' --------         ';
      const unsub = '    -------!         ';
      const predicate = function () {
        return 42;
      };
      const result = e1[mergeMap]((x) => Observable.from([x]))
        [min](predicate)
        [mergeMap]((x) => Observable.from([x]));
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle a reverse predicate on observable with many values', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-a-^-b--c--d-|', { a: 42, b: -1, c: 0, d: 666 });
      const e1subs = '   ^---------!';
      const expected = ' ----------(w|)';
      const predicate = function (x, y) {
        return x > y ? -1 : 1;
      };
      expectObservable(e1[min](predicate)).toBe(expected, { w: 666 });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle a predicate for string on observable with many values', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-a-^-b--c--d-|');
      const e1subs = '   ^---------!';
      const expected = ' ----------(w|)';
      const predicate = function (x, y) {
        return x > y ? -1 : 1;
      };
      expectObservable(e1[min](predicate)).toBe(expected, { w: 'd' });
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
      expectObservable(e1[min](predicate)).toBe(expected);
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
      expectObservable(e1[min](predicate)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
});
