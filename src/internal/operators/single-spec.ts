import { expect } from 'chai';
import { single, mergeMap, tap } from 'rxjs/operators';
import { of, EmptyError } from 'rxjs';
import { TestScheduler } from 'rxjs/internal/testing/TestScheduler';
import { assertDeepEquals } from 'rxjs/internal/test_helpers/assertDeepEquals';

/** @test {single} */
describe('single operator', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(assertDeepEquals);
  });

  //asDiagram('single')
  it('should raise error from empty predicate if observable emits multiple time', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =    hot('--a--b--c--|');
      const e1subs =    '^    !      ';
      const expected =  '-----#      ';
      const errorMsg = new Error('Sequence contains more than one element');

      expectObservable(e1.pipe(single())).toBe(expected, null, errorMsg);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should raise error from empty predicate if observable does not emit', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('--a--^--|');
      const e1subs =      '^  !';
      const expected =    '---#';

      expectObservable(e1.pipe(single())).toBe(expected, null, new EmptyError());
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should return only element from empty predicate if observable emits only once', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =    hot('--a--|');
      const e1subs =    '^    !';
      const expected =  '-----(a|)';

      expectObservable(e1.pipe(single())).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should allow unsubscribing explicitly and early', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =    hot('--a--b--c--|');
      const unsub =     '   !        ';
      const e1subs =    '^  !        ';
      const expected =  '----        ';

      expectObservable(e1.pipe(single()), unsub).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =    hot('--a--b--c--|');
      const e1subs =    '^  !        ';
      const expected =  '----        ';
      const unsub =     '   !        ';

      const result = e1.pipe(
        mergeMap((x: string) => of(x)),
        single(),
        mergeMap((x: string) => of(x))
      );

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should raise error from empty predicate if observable emits error', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =    hot('--a--b^--#');
      const e1subs =          '^  !';
      const expected =        '---#';

      expectObservable(e1.pipe(single())).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should raise error from predicate if observable emits error', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =    hot('--a--b^--#');
      const e1subs =          '^  !';
      const expected =        '---#';

      const predicate = function (value: string) {
        return value === 'c';
      };

      expectObservable(e1.pipe(single(predicate))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should raise error if predicate throws error', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =    hot('--a--b--c--d--|');
      const e1subs =    '^          !   ';
      const expected =  '-----------#   ';

      const predicate = function (value: string) {
        if (value !== 'd') {
          return false;
        }
        throw 'error';
      };

      expectObservable(e1.pipe(single(predicate))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should return element from predicate if observable have single matching element', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =    hot('--a--b--c--|');
      const e1subs =    '^          !';
      const expected =  '-----------(b|)';

      const predicate = function (value: string) {
        return value === 'b';
      };

      expectObservable(e1.pipe(single(predicate))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should raise error from predicate if observable have multiple matching element', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =    hot('--a--b--a--b--b--|');
      const e1subs =    '^          !      ';
      const expected =  '-----------#      ';

      const predicate = function (value: string) {
        return value === 'b';
      };

      expectObservable(e1.pipe(single(predicate))).toBe(expected, null, new Error('Sequence contains more than one element'));
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should raise error from predicate if observable does not emit', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('--a--^--|');
      const e1subs =      '^  !';
      const expected =    '---#';

      const predicate = function (value: string) {
        return value === 'a';
      };

      expectObservable(e1.pipe(single(predicate))).toBe(expected, null, new EmptyError());
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should return undefined from predicate if observable does not contain matching element', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =    hot('--a--b--c--|');
      const e1subs =    '^          !';
      const expected =  '-----------(z|)';

      const predicate = function (value: string) {
        return value === 'x';
      };

      expectObservable(e1.pipe(single(predicate))).toBe(expected, {z: undefined});
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should call predicate with indices starting at 0', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =    hot('--a--b--c--|');
      const e1subs =    '^          !';
      const expected =  '-----------(b|)';

      let indices: number[] = [];
      const predicate = function(value: string, index: number) {
        indices.push(index);
        return value === 'b';
      };

      expectObservable(e1.pipe(
        single(predicate),
        tap(null, null, () => {
          expect(indices).to.deep.equal([0, 1, 2]);
        }))
      ).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });
});
