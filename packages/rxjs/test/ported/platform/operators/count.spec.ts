// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/count-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { count } from 'rxjs/count';
import { mergeMap } from 'rxjs/merge-map';
describe('count (platform)', () => {
  it('should count the values of an observable', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('--a--b--c--|');
      const subs = '      ^----------!';
      const expected = '  -----------(x|)';
      expectObservable(source[count]()).toBe(expected, { x: 3 });
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should be never when source is never', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' -');
      const e1subs = '^!';
      const expected = '-';
      expectObservable(e1[count](), '^!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should be zero when source is empty', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' |');
      const e1subs = '  (^!)';
      const expected = '(w|)';
      expectObservable(e1[count]()).toBe(expected, { w: 0 });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it("should be never when source doesn't complete", async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--x--^--y--');
      const e1subs = '^-----!';
      const expected = '   ------';
      expectObservable(e1[count](), '^-----!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it("should be zero when source doesn't have values", async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-x-^---|');
      const e1subs = '   ^---!';
      const expected = ' ----(w|)';
      expectObservable(e1[count]()).toBe(expected, { w: 0 });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should count the unique value of an observable', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-x-^--y--|');
      const e1subs = '   ^-----!';
      const expected = ' ------(w|)';
      expectObservable(e1[count]()).toBe(expected, { w: 1 });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should count the values of an ongoing hot observable', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('--a-^-b--c--d--|');
      const subs = '          ^----------!';
      const expected = '      -----------(x|)';
      expectObservable(source[count]()).toBe(expected, { x: 3 });
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should work with error', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-x-^--y--z--#', { x: 1, y: 2, z: 3 }, 'too bad');
      const e1subs = '   ^--------!';
      const expected = ' ---------#';
      expectObservable(e1[count]()).toBe(expected, null, 'too bad');
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should work with throw', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' #');
      const e1subs = '  (^!)';
      const expected = '#';
      expectObservable(e1[count]()).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle an always-true predicate on an empty hot observable', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-x-^---|');
      const e1subs = '   ^---!';
      const expected = ' ----(w|)';
      const predicate = () => {
        return true;
      };
      expectObservable(e1[count](predicate)).toBe(expected, { w: 0 });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle an always-false predicate on an empty hot observable', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-x-^---|');
      const e1subs = '   ^---!';
      const expected = ' ----(w|)';
      const predicate = () => {
        return false;
      };
      expectObservable(e1[count](predicate)).toBe(expected, { w: 0 });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle an always-true predicate on a simple hot observable', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-x-^-a-|');
      const e1subs = '   ^---!';
      const expected = ' ----(w|)';
      const predicate = () => {
        return true;
      };
      expectObservable(e1[count](predicate)).toBe(expected, { w: 1 });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle an always-false predicate on a simple hot observable', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-x-^-a-|');
      const e1subs = '   ^---!';
      const expected = ' ----(w|)';
      const predicate = () => {
        return false;
      };
      expectObservable(e1[count](predicate)).toBe(expected, { w: 0 });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should allow unsubscribing early and explicitly', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-1-^-2--3--4-|');
      const e1subs = '   ^-----!    ';
      const expected = ' -------    ';
      const unsub = '    ------!    ';
      const result = e1[count]((value) => parseInt(value) < 10);
      expectObservable(result, unsub).toBe(expected, { w: 3 });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not break unsubscription chains when result is unsubscribed explicitly', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-1-^-2--3--4-|');
      const e1subs = '   ^-----!    ';
      const expected = ' -------    ';
      const unsub = '    ------!    ';
      const result = e1[mergeMap]((x) => Observable.from([x]))
        [count]((value) => parseInt(value) < 10)
        [mergeMap]((x) => Observable.from([x]));
      expectObservable(result, unsub).toBe(expected, { w: 3 });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle a match-all predicate on observable with many values', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-1-^-2--3--4-|');
      const e1subs = '   ^---------!';
      const expected = ' ----------(w|)';
      const predicate = (value) => parseInt(value) < 10;
      expectObservable(e1[count](predicate)).toBe(expected, { w: 3 });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle a match-none predicate on observable with many values', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-1-^-2--3--4-|');
      const e1subs = '   ^---------!';
      const expected = ' ----------(w|)';
      const predicate = (value) => parseInt(value) > 10;
      expectObservable(e1[count](predicate)).toBe(expected, { w: 0 });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle an always-true predicate on observable that throws', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-1-^---#');
      const e1subs = '   ^---!';
      const expected = ' ----#';
      const predicate = () => true;
      expectObservable(e1[count](predicate)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle an always-false predicate on observable that throws', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-1-^---#');
      const e1subs = '   ^---!';
      const expected = ' ----#';
      const predicate = () => false;
      expectObservable(e1[count](predicate)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle an always-true predicate on a hot never-observable', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-x-^----');
      const e1subs = '^----!';
      const expected = ' -----';
      const predicate = () => true;
      expectObservable(e1[count](predicate), '^----!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle a predicate that throws, on observable with many values', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-1-^-2--3--|');
      const e1subs = '   ^----!   ';
      const expected = ' -----#   ';
      const predicate = (value) => {
        if (value === '3') {
          throw 'error';
        }
        return true;
      };
      expectObservable(e1[count](predicate)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
});
