import { expect } from 'chai';
import { single, mergeMap, tap } from 'rxjs/operators';
import { of, EmptyError } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { assertDeepEquals } from '../helpers/test-helper';

/** @test {single} */
describe('single operator', () => {
  let rxTest: TestScheduler;

  beforeEach(() => {
    rxTest = new TestScheduler(assertDeepEquals);
  });

  it('should raise error from empty predicate if observable emits multiple time', () => {
    rxTest.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--|');
      const e1subs = '  ^----!      ';
      const expected = '-----#      ';
      const errorMsg = 'Sequence contains more than one element';

      expectObservable(e1.pipe(single())).toBe(expected, null, errorMsg);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should raise error from empty predicate if observable does not emit', () => {
    rxTest.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^--|');
      const e1subs = '     ^--!';
      const expected = '   ---#';

      expectObservable(e1.pipe(single())).toBe(expected, null, new EmptyError());
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should return only element from empty predicate if observable emits only once', () => {
    rxTest.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--|');
      const e1subs = '  ^----!';
      const expected = '-----(a|)';

      expectObservable(e1.pipe(single())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should allow unsubscribing explicitly and early', () => {
    rxTest.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--|');
      const unsub = '   ----!        ';
      const e1subs = '  ^---!        ';
      const expected = '------------';

      expectObservable(e1.pipe(single()), unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    rxTest.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--|');
      const e1subs = '  ^--!        ';
      const expected = '----        ';
      const unsub = '   ---!        ';

      const result = e1.pipe(
        mergeMap(x => of(x)),
        single(),
        mergeMap(x => of(x))
      );

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should raise error from empty predicate if observable emits error', () => {
    rxTest.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b^--#');
      const e1subs = '  ^--!';
      const expected = '---#';

      expectObservable(e1.pipe(single())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should raise error from predicate if observable emits error', () => {
    rxTest.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--b^--#');
      const e1subs = '      ^--!';
      const expected = '    ---#';

      expectObservable(e1.pipe(single(v => v === 'c'))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should raise error if predicate throws error', () => {
    rxTest.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--d--|');
      const e1subs = '  ^----------!   ';
      const expected = '-----------#   ';

      expectObservable(
        e1.pipe(
          single(v => {
            if (v !== 'd') {
              return false;
            }
            throw 'error';
          })
        )
      ).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should return element from predicate if observable have single matching element', () => {
    rxTest.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--|');
      const e1subs = '  ^----------!';
      const expected = '-----------(b|)';

      expectObservable(e1.pipe(single(v => v === 'b'))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should raise error from predicate if observable have multiple matching element', () => {
    rxTest.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--a--b--b--|');
      const e1subs = '  ^----------!      ';
      const expected = '-----------#      ';

      expectObservable(e1.pipe(single(v => v === 'b'))).toBe(expected, null, 'Sequence contains more than one element');
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should raise error from predicate if observable does not emit', () => {
    rxTest.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^--|');
      const e1subs = '     ^--!';
      const expected = '   ---#';

      expectObservable(e1.pipe(single(v => v === 'a'))).toBe(expected, null, new EmptyError());
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should return undefined from predicate if observable does not contain matching element', () => {
    rxTest.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--|');
      const e1subs = '  ^----------!';
      const expected = '-----------(z|)';

      expectObservable(e1.pipe(single(v => v === 'x'))).toBe(expected, { z: undefined });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should call predicate with indices starting at 0', () => {
    rxTest.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--|');
      const e1subs = '  ^----------!';
      const expected = '-----------(b|)';

      let indices: number[] = [];
      const predicate = function(value: string, index: number) {
        indices.push(index);
        return value === 'b';
      };

      expectObservable(
        e1.pipe(
          single(predicate),
          tap(null, null, () => {
            expect(indices).to.deep.equal([0, 1, 2]);
          })
        )
      ).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
});
