// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/skipWhile-spec.ts
import { describe, expect, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { ColdObservable } from 'rxjs/cold-observable';
import { mergeMap } from 'rxjs/merge-map';
import { skipWhile } from 'rxjs/skip-while';
import { tap } from 'rxjs/tap';
describe('skipWhile (cold)', () => {
  it('should skip all elements until predicate is false', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('-1-^2--3--4--5--6--|');
      const sourceSubs = '   ^---------------!';
      const expected = '     -------4--5--6--|';
      const predicate = function (v) {
        return +v < 4;
      };
      const result = source[skipWhile](predicate);
      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should skip all elements with a true predicate', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('-1-^2--3--4--5--6--|');
      const sourceSubs = '   ^---------------!';
      const expected = '     ----------------|';
      const result = source[skipWhile](() => true);
      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should skip all elements with a truthy predicate', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('-1-^2--3--4--5--6--|');
      const sourceSubs = '   ^---------------!';
      const expected = '     ----------------|';
      const result = source[skipWhile](() => {
        return {};
      });
      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should not skip any element with a false predicate', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('-1-^2--3--4--5--6--|');
      const sourceSubs = '   ^---------------!';
      const expected = '     -2--3--4--5--6--|';
      const result = source[skipWhile](() => false);
      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should not skip any elements with a falsy predicate', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('-1-^2--3--4--5--6--|');
      const sourceSubs = '   ^---------------!';
      const expected = '     -2--3--4--5--6--|';
      const result = source[skipWhile](() => undefined);
      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should skip elements on hot source', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('--1--2-^-3--4--5--6--7--8--');
      const sourceSubs = '^-------------------!';
      const expected = '         --------5--6--7--8--';
      const predicate = function (v) {
        return +v < 5;
      };
      const result = source[skipWhile](predicate);
      expectObservable(result, '^-------------------!').toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it("should be possible to skip using the element's index", async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('--a--b-^-c--d--e--f--g--h--|');
      const sourceSubs = '       ^-------------------!';
      const expected = '         --------e--f--g--h--|';
      const predicate = function (_v, index) {
        return index < 2;
      };
      const result = source[skipWhile](predicate);
      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should skip using index with source unsubscribes early', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('--a--b-^-c--d--e--f--g--h--|');
      const sourceSubs = '       ^----------!         ';
      const unsub = '            -----------!         ';
      const expected = '         -----d--e---         ';
      const predicate = function (_v, index) {
        return index < 1;
      };
      const result = source[skipWhile](predicate);
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should not break unsubscription chains when result is unsubscribed explicitly', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('--a--b-^-c--d--e--f--g--h--|');
      const sourceSubs = '       ^----------!         ';
      const expected = '         -----d--e---         ';
      const unsub = '            -----------!         ';
      const predicate = function (_v, index) {
        return index < 1;
      };
      const result = source[mergeMap](function (x) {
        return ColdObservable.from([x]);
      })
        [skipWhile](predicate)
        [mergeMap](function (x) {
          return ColdObservable.from([x]);
        });
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should skip using value with source throws', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('--a--b-^-c--d--e--f--g--h--#');
      const sourceSubs = '       ^-------------------!';
      const expected = '         -----d--e--f--g--h--#';
      const predicate = function (v) {
        return v !== 'd';
      };
      const result = source[skipWhile](predicate);
      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should invoke predicate while its false and never again', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('--a--b-^-c--d--e--f--g--h--|');
      const sourceSubs = '       ^-------------------!';
      const expected = '         --------e--f--g--h--|';
      let invoked = 0;
      const predicate = function (v) {
        invoked++;
        return v !== 'e';
      };
      const result = source[skipWhile](predicate)[tap]({
        complete() {
          expect(invoked).toBe(3);
        },
      });
      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should handle predicate that throws', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('--a--b-^-c--d--e--f--g--h--|');
      const sourceSubs = '       ^-------!            ';
      const expected = '         --------#            ';
      const predicate = function (v) {
        if (v === 'e') {
          throw new Error("nom d'une pipe !");
        }
        return v !== 'f';
      };
      const result = source[skipWhile](predicate);
      expectObservable(result).toBe(expected, undefined, new Error("nom d'une pipe !"));
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should handle Observable.empty', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('|   ');
      const subs = '       (^!)';
      const expected = '   |   ';
      const result = source[skipWhile](() => true);
      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should handle Observable.never', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('-');
      const subs = '^!';
      const expected = '   -';
      const result = source[skipWhile](() => true);
      expectObservable(result, '^!').toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should handle Observable.throw', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('#   ');
      const subs = '       (^!)';
      const expected = '   #   ';
      const result = source[skipWhile](() => true);
      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
});
