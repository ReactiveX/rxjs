import { takeLast, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {takeLast} */
describe('takeLast operator', () => {
  let rxTest: TestScheduler;

  beforeEach(() => {
    rxTest = new TestScheduler(observableMatcher);
  });

  it('should take two values of an observable with many values', () => {
    rxTest.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('--a-----b----c---d--|    ');
      const e1subs = ' ^-------------------!    ';
      const expected = '--------------------(cd|)';

      expectObservable(e1.pipe(takeLast(2))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should take last three values', () => {
    rxTest.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' --a-----b----c---d--|    ');
      const e1subs = '  ^-------------------!    ';
      const expected = '--------------------(bcd|)';

      expectObservable(e1.pipe(takeLast(3))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should take all element when try to take larger then source', () => {
    rxTest.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' --a-----b----c---d--|    ');
      const e1subs = '  ^-------------------!    ';
      const expected = '--------------------(abcd|)';

      expectObservable(e1.pipe(takeLast(5))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should take all element when try to take exact', () => {
    rxTest.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' --a-----b----c---d--|    ');
      const e1subs = '  ^-------------------!    ';
      const expected = '--------------------(abcd|)';

      expectObservable(e1.pipe(takeLast(4))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not take any values', () => {
    rxTest.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' --a-----b----c---d--|');
      const expected = '|';
      const e1subs: string[] = [];

      expectObservable(e1.pipe(takeLast(0))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not take any values if provided with negative value', () => {
    rxTest.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' --a-----b----c---d--|');
      const expected = '|';
      const e1subs: string[] = [];

      expectObservable(e1.pipe(takeLast(-42))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should work with empty', () => {
    rxTest.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' |');
      const e1subs = '  (^!)';
      const expected = '|';

      expectObservable(e1.pipe(takeLast(42))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should go on forever on never', () => {
    rxTest.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' -');
      const e1subs = '  ^';
      const expected = '-';

      expectObservable(e1.pipe(takeLast(42))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should be empty on takeLast(0)', () => {
    rxTest.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^--b----c---d--|');
      const expected = '   |';
      const e1subs: string[] = []; // Don't subscribe at all

      expectObservable(e1.pipe(takeLast(0))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should take one value from an observable with one value', () => {
    rxTest.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ---(a|)');
      const e1subs = '  ^--!   ';
      const expected = '---(a|)';

      expectObservable(e1.pipe(takeLast(1))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should take one value from an observable with many values', () => {
    rxTest.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^--b----c---d--|   ');
      const e1subs = '     ^--------------!   ';
      const expected = '   ---------------(d|)';

      expectObservable(e1.pipe(takeLast(1))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should error on empty', () => {
    rxTest.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^----|');
      const e1subs = '     ^----!';
      const expected = '   -----|';

      expectObservable(e1.pipe(takeLast(42))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should propagate error from the source observable', () => {
    rxTest.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('---^---#', undefined, 'too bad');
      const e1subs = '   ^---!';
      const expected = ' ----#';

      expectObservable(e1.pipe(takeLast(42))).toBe(expected, null, 'too bad');
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should propagate error from an observable with values', () => {
    rxTest.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('---^--a--b--#');
      const e1subs = '   ^--------!';
      const expected = ' ---------#';

      expectObservable(e1.pipe(takeLast(42))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should allow unsubscribing explicitly and early', () => {
    rxTest.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('---^--a--b-----c--d--e--|');
      const unsub = '    ---------!            ';
      const e1subs = '   ^--------!            ';
      const expected = ' ----------------------';

      expectObservable(e1.pipe(takeLast(42)), unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should work with throw', () => {
    rxTest.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' #');
      const e1subs = '  (^!)';
      const expected = '#';

      expectObservable(e1.pipe(takeLast(42))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not break unsubscription chain when unsubscribed explicitly', () => {
    rxTest.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('---^--a--b-----c--d--e--|');
      const unsub = '    ---------!            ';
      const e1subs = '   ^--------!            ';
      const expected = ' ----------------------';

      const result = e1.pipe(
        mergeMap((x: string) => of(x)),
        takeLast(42),
        mergeMap((x: string) => of(x))
      );

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
});
