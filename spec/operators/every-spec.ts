/** @prettier */
import { expect } from 'chai';
import { every, mergeMap } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { of, Observable, Observer } from 'rxjs';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {every} */
describe('every', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(observableMatcher);
  });

  function truePredicate(x: number | string) {
    return true;
  }

  function predicate(x: number | string) {
    return +x % 5 === 0;
  }

  it('should return false if only one of elements does not match with predicate', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const values = { a: 5, b: 10, c: 15, d: 18, e: 20 };
      const e1 = hot('  --a--b--c--d--e--|', values);
      const e1subs = '  ^----------!      ';
      const expected = '-----------(x|)   ';

      expectObservable(e1.pipe(every(predicate))).toBe(expected, { x: false });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should accept thisArg with scalar observables', () => {
    const thisArg = {};

    of(1)
      .pipe(
        every(function (this: any, value: number, index: number) {
          expect(this).to.deep.equal(thisArg);
          return true;
        }, thisArg)
      )
      .subscribe();
  });

  it('should increment index on each call to the predicate', () => {
    const indices: number[] = [];
    of(1, 2, 3, 4)
      .pipe(
        every((_, i) => {
          indices.push(i);
          return true;
        })
      )
      .subscribe();

    expect(indices).to.deep.equal([0, 1, 2, 3]);
  });

  it('should accept thisArg with array observable', () => {
    const thisArg = {};

    of(1, 2, 3, 4)
      .pipe(
        every(function (this: any, value: number, index: number) {
          expect(this).to.deep.equal(thisArg);
          return true;
        }, thisArg)
      )
      .subscribe();
  });

  it('should accept thisArg with ordinary observable', () => {
    const thisArg = {};

    const source = new Observable((observer: Observer<number>) => {
      observer.next(1);
      observer.complete();
    });
    source
      .pipe(
        every(function (this: any, value: number, index: number) {
          expect(this).to.deep.equal(thisArg);
          return true;
        }, thisArg)
      )
      .subscribe();
  });

  it('should emit true if source is empty', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -----|   ');
      const e1subs = '  ^----!   ';
      const expected = '-----(x|)';

      expectObservable(e1.pipe(every(predicate))).toBe(expected, { x: true });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should emit false if single source element does not match with predicate', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--|');
      const e1subs = '  ^-!   ';
      const expected = '--(x|)';

      expectObservable(e1.pipe(every(predicate))).toBe(expected, { x: false });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should emit false if none of elements match with predicate', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--d--e--|');
      const e1subs = '  ^-!               ';
      const expected = '--(x|)            ';

      expectObservable(e1.pipe(every(predicate))).toBe(expected, { x: false });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should return false if only some of elements matches with predicate', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const values = { a: 5, b: 10, c: 15 };
      const e1 = hot('  --a--b--c--d--e--|', values);
      const e1subs = '  ^----------!      ';
      const expected = '-----------(x|)   ';

      expectObservable(e1.pipe(every(predicate))).toBe(expected, { x: false });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should allow unsubscribing early and explicitly', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const values = { a: 5, b: 10, c: 15 };
      const e1 = hot('  --a--b--c--d--e--|', values);
      const e1subs = '  ^------!          ';
      const expected = '--------          ';
      const unsub = '   -------!          ';

      const result = e1.pipe(every(predicate));

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not break unsubscription chains when result observable is unsubscribed', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const values = { a: 5, b: 10, c: 15 };
      const e1 = hot('  --a--b--c--d--e--|', values);
      const e1subs = '  ^------!          ';
      const expected = '--------          ';
      const unsub = '   -------!          ';

      const result = e1.pipe(
        mergeMap((x: any) => of(x)),
        every(predicate),
        mergeMap((x: any) => of(x))
      );

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should propagate error if predicate eventually throws', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--d--e--|');
      const e1subs = '  ^-------!';
      const expected = '--------#';

      function faultyPredicate(x: string) {
        if (x === 'c') {
          throw 'error';
        } else {
          return true;
        }
      }

      expectObservable(e1.pipe(every(faultyPredicate))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should emit true if single source element matches with predicate', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const values = { a: 5 };
      const e1 = hot('  --a--|   ', values);
      const e1subs = '  ^----!   ';
      const expected = '-----(x|)';

      expectObservable(e1.pipe(every(predicate))).toBe(expected, { x: true });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should emit true if scalar source matches with predicate', () => {
    testScheduler.run(({ expectObservable }) => {
      const e1 = of(5);
      const expected = '(x|)';

      expectObservable(e1.pipe(every(predicate))).toBe(expected, { x: true });
    });
  });

  it('should emit false if scalar source does not match with predicate', () => {
    testScheduler.run(({ expectObservable }) => {
      const e1 = of(3);
      const expected = '(x|)';

      expectObservable(e1.pipe(every(predicate))).toBe(expected, { x: false });
    });
  });

  it('should propagate error if predicate throws on scalar source', () => {
    testScheduler.run(({ expectObservable }) => {
      const e1 = of(3);
      const expected = '#';

      function faultyPredicate(x: number): boolean {
        throw 'error';
      }

      expectObservable(e1.pipe(every(faultyPredicate))).toBe(expected);
    });
  });

  it('should emit true if scalar array source matches with predicate', () => {
    testScheduler.run(({ expectObservable }) => {
      const e1 = of(5, 10, 15, 20);
      const expected = '(x|)';

      expectObservable(e1.pipe(every(predicate))).toBe(expected, { x: true });
    });
  });

  it('should emit false if scalar array source does not match with predicate', () => {
    testScheduler.run(({ expectObservable }) => {
      const e1 = of(5, 9, 15, 20);
      const expected = '(x|)';

      expectObservable(e1.pipe(every(predicate))).toBe(expected, { x: false });
    });
  });

  it('should propagate error if predicate eventually throws on scalar array source', () => {
    testScheduler.run(({ expectObservable }) => {
      const e1 = of(5, 10, 15, 20);
      const expected = '#';

      function faultyPredicate(x: number) {
        if (x === 15) {
          throw 'error';
        }
        return true;
      }

      expectObservable(e1.pipe(every(faultyPredicate))).toBe(expected);
    });
  });

  it('should emit true if all source elements match with predicate', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const values = { a: 5, b: 10, c: 15, d: 20, e: 25 };
      const e1 = hot('  --a--b--c--d--e--|   ', values);
      const e1subs = '  ^----------------!   ';
      const expected = '-----------------(x|)';

      expectObservable(e1.pipe(every(predicate))).toBe(expected, { x: true });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should raise error if source raises error', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --#');
      const e1subs = '  ^-!';
      const expected = '--#';

      expectObservable(e1.pipe(every(truePredicate))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not complete if source never emits', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' -');
      const e1subs = '  ^';
      const expected = '-';

      expectObservable(e1.pipe(every(truePredicate))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should emit true if source element matches with predicate after subscription', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const values = { a: 5, b: 10, c: 15, d: 20, e: 25 };
      const e1 = hot('--z--^--a--b--c--d--e--|   ', values);
      const e1subs = '     ^-----------------!   ';
      const expected = '   ------------------(x|)';

      expectObservable(e1.pipe(every(predicate))).toBe(expected, { x: true });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should emit false if source element does not match with predicate after subscription', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const values = { a: 5, b: 10, c: 15, d: 20 };
      const e1 = hot('--z--^--b--c--z--d--|', values);
      const e1subs = '     ^--------!      ';
      const expected = '   ---------(x|)   ';

      expectObservable(e1.pipe(every(predicate))).toBe(expected, { x: false });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should raise error if source raises error after subscription', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--z--^--#');
      const e1subs = '     ^--!';
      const expected = '   ---#';

      expectObservable(e1.pipe(every(truePredicate))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should emit true if source does not emit after subscription', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--z--^-----|   ');
      const e1subs = '     ^-----!   ';
      const expected = '   ------(x|)';

      expectObservable(e1.pipe(every(predicate))).toBe(expected, { x: true });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
});
