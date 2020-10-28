import { expect } from 'chai';
import { skipLast, mergeMap, take } from 'rxjs/operators';
import { of, Observable } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {skipLast} */
describe('skipLast operator', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(observableMatcher);
  });

  it('should skip two values of an observable with many values', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' --a-----b----c---d--|');
      const e1subs = '  ^-------------------!';
      const expected = '-------------a---b--|';

      expectObservable(e1.pipe(skipLast(2))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should skip last three values', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' --a-----b----c---d--|');
      const e1subs = '  ^-------------------!';
      const expected = '-----------------a--|';

      expectObservable(e1.pipe(skipLast(3))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should skip all elements when trying to skip larger then source', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' --a-----b----c---d--|');
      const e1subs = '  ^-------------------!';
      const expected = '--------------------|';

      expectObservable(e1.pipe(skipLast(5))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should skip all elements when trying to skip exact', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' --a-----b----c---d--|');
      const e1subs = '  ^-------------------!';
      const expected = '--------------------|';

      expectObservable(e1.pipe(skipLast(4))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not skip any values', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' --a-----b----c---d--|');
      const e1subs = '  ^-------------------!';
      const expected = '--a-----b----c---d--|';

      expectObservable(e1.pipe(skipLast(0))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not skip any values if provided with negative value', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' --a-----b----c---d--|');
      const e1subs = '  ^-------------------!';
      const expected = '--a-----b----c---d--|';

      expectObservable(e1.pipe(skipLast(-42))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should work with empty', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' |');
      const e1subs = '  (^!)';
      const expected = '|';

      expectObservable(e1.pipe(skipLast(42))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should go on forever on never', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' -');
      const e1subs = '  ^';
      const expected = '-';

      expectObservable(e1.pipe(skipLast(42))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should skip one value from an observable with one value', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ---(a|)');
      const e1subs = '  ^--!   ';
      const expected = '---|   ';

      expectObservable(e1.pipe(skipLast(1))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should skip one value from an observable with many values', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^--b----c---d--|');
      const e1subs = '     ^--------------!';
      const expected = '   --------b---c--|';

      expectObservable(e1.pipe(skipLast(1))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should work with empty and early emission', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^----|');
      const e1subs = '     ^----!';
      const expected = '   -----|';

      expectObservable(e1.pipe(skipLast(42))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should propagate error from the source observable', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('---^---#', undefined, 'too bad');
      const e1subs = '   ^---!';
      const expected = ' ----#';

      expectObservable(e1.pipe(skipLast(42))).toBe(expected, null, 'too bad');
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should propagate error from an observable with values', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('---^--a--b--#');
      const e1subs = '   ^--------!';
      const expected = ' ---------#';

      expectObservable(e1.pipe(skipLast(42))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should allow unsubscribing explicitly and early', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('---^--a--b-----c--d--e--|');
      const unsub = '    ---------!            ';
      const e1subs = '   ^--------!            ';
      const expected = ' ----------            ';

      expectObservable(e1.pipe(skipLast(42)), unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should work with throw', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' #');
      const e1subs = '  (^!)';
      const expected = '#';

      expectObservable(e1.pipe(skipLast(42))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not break unsubscription chain when unsubscribed explicitly', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('---^--a--b-----c--d--e--|');
      const unsub = '    ---------!            ';
      const e1subs = '   ^--------!            ';
      const expected = ' ----------            ';

      const result = e1.pipe(
        mergeMap((x: string) => of(x)),
        skipLast(42),
        mergeMap((x: string) => of(x))
      );

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should stop listening to a synchronous observable when unsubscribed', () => {
    const sideEffects: number[] = [];
    const synchronousObservable = new Observable<number>(subscriber => {
      // This will check to see if the subscriber was closed on each loop
      // when the unsubscribe hits (from the `take`), it should be closed
      for (let i = 0; !subscriber.closed && i < 10; i++) {
        sideEffects.push(i);
        subscriber.next(i);
      }
    });

    synchronousObservable.pipe(
      skipLast(1),
      take(3),
    ).subscribe(() => { /* noop */ });

    // This expectation might seem a little strange, but the implementation of
    // skipLast works by eating the number of elements that are to be skipped,
    // so it will consume the number skipped in addition to the number taken.
    expect(sideEffects).to.deep.equal([0, 1, 2, 3]);
  });
});
