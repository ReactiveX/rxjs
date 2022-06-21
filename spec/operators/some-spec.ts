import { expect } from 'chai';
import { some, mergeMap } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { of } from 'rxjs';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {some} */
describe('some', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(observableMatcher);
  });

  function falsePredicate(x: number | string) {
    return false;
  }

  function predicate(x: number | string) {
    return +x % 2 !== 0;
  }

  it('should return false if no elements matches the predicate', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const values = { a: 2, b: 4, c: 6, d: 10 };
      const e1 = hot('  --a--b--c--d--|', values);
      const e1Subs = '  ^-------------!      ';
      const expected = '--------------(x|)   ';

      expectObservable(e1.pipe(some(predicate))).toBe(expected, { x: false });
      expectSubscriptions(e1.subscriptions).toBe(e1Subs);
    });
  });

  it('should return true if there is an elements that matches the predicate', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const values = { a: 2, b: 4, c: 5, d: 10 };
      const e1 = hot('  --a--b--c--d--|', values);
      const e1Subs = '  ^-------!      ';
      const expected = '--------(x|)';

      expectObservable(e1.pipe(some(predicate))).toBe(expected, { x: true });
      expectSubscriptions(e1.subscriptions).toBe(e1Subs);
    });
  });

  it('should emit true if source value matches with predicate after the subscription happened', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const values = { a: 2, b: 4, c: 3, d: 9 };
      const e1 = hot('   --e--^--a--b--c--d-|', values);
      const e1subs = '   ^--------!    ';
      const expected = '  ---------(x|)     ';

      expectObservable(e1.pipe(some(predicate))).toBe(expected, { x: true });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should emit false if source values does not match with predicate after the subscription happened', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const values = { a: 2, b: 4, c: 6, d: 8 };
      const e1 = hot('   --e--^--a--b--c--d-|', values);
      const e1subs = '   ^-------------!';
      const expected = '  --------------(x|)';

      expectObservable(e1.pipe(some(predicate))).toBe(expected, { x: false });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should emit false if source does not emit after subscription', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --e--^---|');
      const e1subs = '  ^---!';
      const expected = '----(x|)';

      expectObservable(e1.pipe(some(predicate))).toBe(expected, { x: false });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should increment index on each call of the predicate', () => {
    const indices: number[] = [];
    of(1, 2, 3, 4, 5)
      .pipe(
        some((_, i) => {
          indices.push(i);
          return false;
        })
      )
      .subscribe();

    expect(indices).to.deep.equal([0, 1, 2, 3, 4]);
  });

  it('should emit true if source is empty', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot(' ---|  ');
      const e1subs = ' ^--!  ';
      const expected = '---(x|)';

      expectObservable(e1.pipe(some(predicate))).toBe(expected, { x: false });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should return false if single source element does not match the predicate', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const value = { a: 2 };
      const e1 = hot(' ---a----|', value);
      const e1subs = ' ^-------!';
      const expected = '--------(x|)';

      expectObservable(e1.pipe(some(predicate))).toBe(expected, { x: false });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should return true if single source element matches the predicate', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot(' ---a----|');
      const e1subs = ' ^--!        ';
      const expected = '---(x|)';

      expectObservable(e1.pipe(some(predicate))).toBe(expected, { x: true });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should allow unsubscribing early and explicitly', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const values = { a: 2, b: 4, c: 6, d: 11 };
      const e1 = hot(' --a--b--c--d---|', values);
      const e1subs = ' ^----!          ';
      const expected = '-------        ';
      const unsub = '   -----!         ';

      const result = e1.pipe(some(predicate));

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not break unsubscription chains when result observable is unsubscribed', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const values = { a: 2, b: 4, c: 6, d: 11 };
      const e1 = hot(' --a--b--c--d---|', values);
      const e1subs = ' ^----!          ';
      const expected = '-------        ';
      const unsub = '   -----!         ';

      const result = e1.pipe(
        mergeMap((x: any) => of(x)),
        some(predicate),
        mergeMap((x: any) => of(x))
      );

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should propagate error if predicate throws an error', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c---|');
      const e1subs = '  ^----!';
      const expected = '  ^----#';

      function faultyPredicate(x: string) {
        if (x === 'b') {
          throw 'error';
        } else {
          return false;
        }
      }

      expectObservable(e1.pipe(some(faultyPredicate))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should emit true if scalar source matches the predicate', () => {
    testScheduler.run(({ expectObservable }) => {
      const e1 = of(1);
      const expect = '(x|)';

      expectObservable(e1.pipe(some(predicate))).toBe(expect, { x: true });
    });
  });

  it('should emit false if scalar source matches with predicate', () => {
    testScheduler.run(({ expectObservable }) => {
      const e1 = of(2);
      const expect = '(x|)';

      expectObservable(e1.pipe(some(predicate))).toBe(expect, { x: false });
    });
  });

  it('should emit true if scalar array source matches with predicate', () => {
    testScheduler.run(({ expectObservable }) => {
      const e1 = of(2, 1, 3);
      const expect = '(x|)';

      expectObservable(e1.pipe(some(predicate))).toBe(expect, { x: true });
    });
  });

  it('should emit false if scalar array source matches with predicate', () => {
    testScheduler.run(({ expectObservable }) => {
      const e1 = of(2, 4, 6);
      const expect = '(x|)';

      expectObservable(e1.pipe(some(predicate))).toBe(expect, { x: false });
    });
  });

  it('should propagate error if predicate throws on scalar array source', () => {
    testScheduler.run(({ expectObservable }) => {
      const e1 = of(2, 1, 3);
      const expected = '#';

      function faultyPredicate(x: number) {
        if (x === 1) {
          throw 'error';
        } else {
          return false;
        }
      }

      expectObservable(e1.pipe(some(faultyPredicate))).toBe(expected);
    });
  });

  it('should emit error if source emits error', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('   --#');
      const e1subs = '   ^-!';
      const expected = '--#';

      expectObservable(e1.pipe(some(falsePredicate))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not complete if source never emits a value', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -');
      const e1subs = '  ^';
      const expected = '-';

      expectObservable(e1.pipe(some(falsePredicate))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should emit error if source emits error after subscription', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --e---^--#');
      const e1subs = '  ^--!';
      const expected = '  ---#';

      expectObservable(e1.pipe(some(falsePredicate))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
});
