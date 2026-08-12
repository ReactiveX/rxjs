// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/observables/forkJoin-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { forkJoin } from 'rxjs/fork-join';
describe('forkJoin (platform)', () => {
  it('should join the last values of the provided observables into an array', async () => {
    await rxTest(({ hot, observable, expectObservable }) => {
      const s1 = hot('  -a--b-----c-d-e-|');
      const s2 = hot('  --------f--g-h-i--j-|');
      const s3 = observable(' --1--2-3-4---|');
      const e1 = Observable[forkJoin]([s1, s2, s3]);
      const expected = '--------------------(x|)';
      expectObservable(e1).toBe(expected, { x: ['e', 'j', '4'] });
    });
  });
  it('should accept single observable', async () => {
    await rxTest(({ hot, expectObservable }) => {
      const e1 = Observable[forkJoin](hot('--a--b--c--d--|'));
      const expected = '       --------------(x|)';
      expectObservable(e1).toBe(expected, { x: ['d'] });
    });
  });
  it('should join the last values of the provided observables into an array', async () => {
    await rxTest(({ hot, expectObservable }) => {
      const s1 = hot('  --a--b--c--d--|');
      const s2 = hot('  (b|)');
      const s3 = hot('  --1--2--3--|');
      const e1 = Observable[forkJoin]([s1, s2, s3]);
      const expected = '--------------(x|)';
      expectObservable(e1).toBe(expected, { x: ['d', 'b', '3'] });
    });
  });
  it('should allow emit null or undefined', async () => {
    await rxTest(({ hot, expectObservable }) => {
      const e2 = Observable[forkJoin]([
        hot('            --a--b--c--d--|', { d: null }),
        hot('            (b|)'),
        hot('            --1--2--3--|'),
        hot('            -----r--t--u--|', { u: undefined }),
      ]);
      const expected2 = '--------------(x|)';
      expectObservable(e2).toBe(expected2, { x: [null, 'b', '3', undefined] });
    });
  });
  it('should accept array of observable contains single', async () => {
    await rxTest(({ hot, expectObservable }) => {
      const s1 = hot('  --a--b--c--d--|');
      const e1 = Observable[forkJoin]([s1]);
      const expected = '--------------(x|)';
      expectObservable(e1).toBe(expected, { x: ['d'] });
    });
  });
  it('should accept lowercase-o observables', async () => {
    const lowerCaseO = (...values) => {
      const source = {
        subscribe(observer) {
          const destination = typeof observer === 'function' ? { next: observer } : observer;
          for (const value of values) destination.next?.(value);
          destination.complete?.();
          return { unsubscribe() {} };
        },
      };
      const observableKey = Symbol.observable ?? '@@observable';
      source[observableKey] = function () {
        return this;
      };
      return source;
    };
    await rxTest(({ hot, expectObservable }) => {
      const s1 = hot('  --a--b--c--d--|');
      const s2 = hot('  (b|)');
      const s3 = lowerCaseO('1', '2', '3');
      const e1 = Observable[forkJoin]([s1, s2, s3]);
      const expected = '--------------(x|)';
      expectObservable(e1).toBe(expected, { x: ['d', 'b', '3'] });
    });
  });
  it('should accept empty lowercase-o observables', async () => {
    const lowerCaseO = (...values) => {
      const source = {
        subscribe(observer) {
          const destination = typeof observer === 'function' ? { next: observer } : observer;
          for (const value of values) destination.next?.(value);
          destination.complete?.();
          return { unsubscribe() {} };
        },
      };
      const observableKey = Symbol.observable ?? '@@observable';
      source[observableKey] = function () {
        return this;
      };
      return source;
    };
    await rxTest(({ hot, expectObservable }) => {
      const s1 = hot('  --a--b--c--d--|');
      const s2 = hot('  (b|)');
      const s3 = lowerCaseO();
      const e1 = Observable[forkJoin]([s1, s2, s3]);
      const expected = '|';
      expectObservable(e1).toBe(expected);
    });
  });
  it('should accept array of observables', async () => {
    await rxTest(({ hot, expectObservable }) => {
      const s1 = hot('  --a--b--c--d--|');
      const s2 = hot('  (b|)');
      const s3 = hot('  --1--2--3--|');
      const e1 = Observable[forkJoin]([s1, s2, s3]);
      const expected = '--------------(x|)';
      expectObservable(e1).toBe(expected, { x: ['d', 'b', '3'] });
    });
  });
  it('should not emit if any of source observable is empty', async () => {
    await rxTest(({ hot, expectObservable }) => {
      const s1 = hot('  --a--b--c--d--|');
      const s2 = hot('  (b|)');
      const s3 = hot('  ------------------|');
      const e1 = Observable[forkJoin]([s1, s2, s3]);
      const expected = '------------------|';
      expectObservable(e1).toBe(expected);
    });
  });
  it('should complete early if any of source is empty and completes before than others', async () => {
    await rxTest(({ hot, expectObservable }) => {
      const s1 = hot('  --a--b--c--d--|');
      const s2 = hot('  (b|)');
      const s3 = hot('  ---------|');
      const e1 = Observable[forkJoin]([s1, s2, s3]);
      const expected = '---------|';
      expectObservable(e1).toBe(expected);
    });
  });
  it('should complete when all sources are empty', async () => {
    await rxTest(({ hot, expectObservable }) => {
      const s1 = hot('  --------------|');
      const s2 = hot('  ---------|');
      const e1 = Observable[forkJoin]([s1, s2]);
      const expected = '---------|';
      expectObservable(e1).toBe(expected);
    });
  });
  it('should not complete when only source never completes', async () => {
    await rxTest(({ hot, expectObservable }) => {
      const e1 = Observable[forkJoin]([hot('--------------')]);
      const expected = '        --------------';
      expectObservable(e1, '^-------------!').toBe(expected);
    });
  });
  it('should not complete when one of the sources never completes', async () => {
    await rxTest(({ hot, expectObservable }) => {
      const s1 = hot('--------------');
      const s2 = hot('-a---b--c--|');
      const e1 = Observable[forkJoin]([s1, s2]);
      const expected = '-';
      expectObservable(e1, '^!').toBe(expected);
    });
  });
  it('should complete when one of the sources never completes but other completes without values', async () => {
    await rxTest(({ hot, expectObservable }) => {
      const s1 = hot('  --------------');
      const s2 = hot('  ------|');
      const e1 = Observable[forkJoin]([s1, s2]);
      const expected = '------|';
      expectObservable(e1).toBe(expected);
    });
  });
  it('should complete if source is not provided', async () => {
    await rxTest(({ expectObservable }) => {
      const e1 = Observable[forkJoin]();
      const expected = '|';
      expectObservable(e1).toBe(expected);
    });
  });
  it('should complete if sources list is empty', async () => {
    await rxTest(({ expectObservable }) => {
      const e1 = Observable[forkJoin]([]);
      const expected = '|';
      expectObservable(e1).toBe(expected);
    });
  });
  it('should raise error when any of source raises error with empty observable', async () => {
    await rxTest(({ hot, expectObservable }) => {
      const s1 = hot('  ------#');
      const s2 = hot('  ---------|');
      const e1 = Observable[forkJoin]([s1, s2]);
      const expected = '------#';
      expectObservable(e1).toBe(expected);
    });
  });
  it('should raise error when any of source raises error with source that never completes', async () => {
    await rxTest(({ hot, expectObservable }) => {
      const s1 = hot('  ------#');
      const s2 = hot('  ----------');
      const e1 = Observable[forkJoin]([s1, s2]);
      const expected = '------#';
      expectObservable(e1).toBe(expected);
    });
  });
  it('should raise error when source raises error', async () => {
    await rxTest(({ hot, expectObservable }) => {
      const s1 = hot('  ------#');
      const s2 = hot('  ---a-----|');
      const e1 = Observable[forkJoin]([s1, s2]);
      const expected = '------#';
      expectObservable(e1).toBe(expected);
    });
  });
  it('should allow unsubscribing early and explicitly', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^--b--c---d-| ');
      const e1subs = '     ^--------!    ';
      const e2 = hot('---e-^---f--g---h-|');
      const e2subs = '     ^--------!    ';
      const expected = '   ----------    ';
      const unsub = '      ---------!    ';
      const result = Observable[forkJoin]([e1, e2]);
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should unsubscribe other Observables, when one of them errors', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^--b--c---d-| ');
      const e1subs = '     ^--------!    ';
      const e2 = hot('---e-^---f--g-#');
      const e2subs = '     ^--------!    ';
      const expected = '   ---------#    ';
      const result = Observable[forkJoin]([e1, e2]);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should join the last values of the provided observables into an array', async () => {
    await rxTest(({ hot, expectObservable }) => {
      const e1 = Observable[forkJoin]({
        foo: hot('      --a--b--c--d--|'),
        bar: hot('      (b|)'),
        baz: hot('      --1--2--3--|'),
      });
      const expected = '--------------(x|)';
      expectObservable(e1).toBe(expected, { x: { foo: 'd', bar: 'b', baz: '3' } });
    });
  });
  it('should allow emit null or undefined', async () => {
    await rxTest(({ hot, expectObservable }) => {
      const e2 = Observable[forkJoin]({
        foo: hot('       --a--b--c--d--|', { d: null }),
        bar: hot('       (b|)'),
        baz: hot('       --1--2--3--|'),
        qux: hot('       -----r--t--u--|', { u: undefined }),
      });
      const expected2 = '--------------(x|)';
      expectObservable(e2).toBe(expected2, { x: { foo: null, bar: 'b', baz: '3', qux: undefined } });
    });
  });
  it('should accept array of observable contains single', async () => {
    await rxTest(({ hot, expectObservable }) => {
      const e1 = Observable[forkJoin]({
        foo: hot('      --a--b--c--d--|'),
      });
      const expected = '--------------(x|)';
      expectObservable(e1).toBe(expected, { x: { foo: 'd' } });
    });
  });
  it('should accept lowercase-o observables', async () => {
    const lowerCaseO = (...values) => {
      const source = {
        subscribe(observer) {
          const destination = typeof observer === 'function' ? { next: observer } : observer;
          for (const value of values) destination.next?.(value);
          destination.complete?.();
          return { unsubscribe() {} };
        },
      };
      const observableKey = Symbol.observable ?? '@@observable';
      source[observableKey] = function () {
        return this;
      };
      return source;
    };
    await rxTest(({ hot, expectObservable }) => {
      const e1 = Observable[forkJoin]({
        foo: hot('      --a--b--c--d--|'),
        bar: hot('      (b|)'),
        baz: lowerCaseO('1', '2', '3'),
      });
      const expected = '--------------(x|)';
      expectObservable(e1).toBe(expected, { x: { foo: 'd', bar: 'b', baz: '3' } });
    });
  });
  it('should accept empty lowercase-o observables', async () => {
    const lowerCaseO = (...values) => {
      const source = {
        subscribe(observer) {
          const destination = typeof observer === 'function' ? { next: observer } : observer;
          for (const value of values) destination.next?.(value);
          destination.complete?.();
          return { unsubscribe() {} };
        },
      };
      const observableKey = Symbol.observable ?? '@@observable';
      source[observableKey] = function () {
        return this;
      };
      return source;
    };
    await rxTest(({ hot, expectObservable }) => {
      const e1 = Observable[forkJoin]({
        foo: hot('      --a--b--c--d--|'),
        bar: hot('      (b|)'),
        baz: lowerCaseO(),
      });
      const expected = '|';
      expectObservable(e1).toBe(expected);
    });
  });
  it('should accept an object of observables', async () => {
    await rxTest(({ hot, expectObservable }) => {
      const e1 = Observable[forkJoin]({
        foo: hot('      --a--b--c--d--|'),
        bar: hot('      (b|)'),
        baz: hot('      --1--2--3--|'),
      });
      const expected = '--------------(x|)';
      expectObservable(e1).toBe(expected, { x: { foo: 'd', bar: 'b', baz: '3' } });
    });
  });
  it('should not emit if any of source observable is empty', async () => {
    await rxTest(({ hot, expectObservable }) => {
      const e1 = Observable[forkJoin]({
        foo: hot('      --a--b--c--d--|'),
        bar: hot('      (b|)'),
        baz: hot('      ------------------|'),
      });
      const expected = '------------------|';
      expectObservable(e1).toBe(expected);
    });
  });
  it('should complete early if any of source is empty and completes before than others', async () => {
    await rxTest(({ hot, expectObservable }) => {
      const e1 = Observable[forkJoin]({
        foo: hot('      --a--b--c--d--|'),
        bar: hot('      (b|)'),
        baz: hot('      ---------|'),
      });
      const expected = '---------|';
      expectObservable(e1).toBe(expected);
    });
  });
  it('should complete when all sources are empty', async () => {
    await rxTest(({ hot, expectObservable }) => {
      const e1 = Observable[forkJoin]({
        foo: hot('      --------------|'),
        bar: hot('      ---------|'),
      });
      const expected = '---------|';
      expectObservable(e1).toBe(expected);
    });
  });
  it('should not complete when only source never completes', async () => {
    await rxTest(({ hot, expectObservable }) => {
      const e1 = Observable[forkJoin]({
        foo: hot('      --------------'),
      });
      const expected = '--------------';
      expectObservable(e1, '^-------------!').toBe(expected);
    });
  });
  it('should not complete when one of the sources never completes', async () => {
    await rxTest(({ hot, expectObservable }) => {
      const e1 = Observable[forkJoin]({
        foo: hot('      --------------'),
        bar: hot('      -a---b--c--|'),
      });
      const expected = '--------------';
      expectObservable(e1, '^-------------!').toBe(expected);
    });
  });
  it('should complete when one of the sources never completes but other completes without values', async () => {
    await rxTest(({ hot, expectObservable }) => {
      const e1 = Observable[forkJoin]({
        foo: hot('      --------------'),
        bar: hot('      ------|'),
      });
      const expected = '------|';
      expectObservable(e1).toBe(expected);
    });
  });
  it('should complete if sources object is empty', async () => {
    await rxTest(({ expectObservable }) => {
      const e1 = Observable[forkJoin]({});
      const expected = '|';
      expectObservable(e1).toBe(expected);
    });
  });
  it('should raise error when any of source raises error with empty observable', async () => {
    await rxTest(({ hot, expectObservable }) => {
      const e1 = Observable[forkJoin]({
        lol: hot('      ------#'),
        wut: hot('      ---------|'),
      });
      const expected = '------#';
      expectObservable(e1).toBe(expected);
    });
  });
  it('should raise error when any of source raises error with source that never completes', async () => {
    await rxTest(({ hot, expectObservable }) => {
      const e1 = Observable[forkJoin]({
        lol: hot('      ------#'),
        wut: hot('      ----------'),
      });
      const expected = '------#';
      expectObservable(e1).toBe(expected);
    });
  });
  it('should raise error when source raises error', async () => {
    await rxTest(({ hot, expectObservable }) => {
      const e1 = Observable[forkJoin]({
        lol: hot('      ------#'),
        foo: hot('      ---a-----|'),
      });
      const expected = '------#';
      expectObservable(e1).toBe(expected);
    });
  });
  it('should allow unsubscribing early and explicitly', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^--b--c---d-| ');
      const e1subs = '     ^--------!    ';
      const e2 = hot('---e-^---f--g---h-|');
      const e2subs = '     ^--------!    ';
      const expected = '   ----------    ';
      const unsub = '      ---------!    ';
      const result = Observable[forkJoin]({
        e1,
        e2,
      });
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should unsubscribe other Observables, when one of them errors', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--^--b--c---d-| ');
      const e1subs = '       ^--------!    ';
      const e2 = hot('  ---e-^---f--g-#');
      const e2subs = '       ^--------!    ';
      const expected = '     ---------#    ';
      const result = Observable[forkJoin]({
        e1,
        e2,
      });
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
});
