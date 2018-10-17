import { expect } from 'chai';
import { skipLast, mergeMap } from 'rxjs/operators';
import { ArgumentOutOfRangeError, of } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { assertDeepEquals } from 'rxjs/internal/test_helpers/assertDeepEquals';

/** @test {takeLast} */
describe('skipLast operator', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(assertDeepEquals);
  });

  //asDiagram('skipLast(2)')
  it('should skip two values of an observable with many values', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =  cold('--a-----b----c---d--|');
      const e1subs =   '^                   !';
      const expected = '-------------a---b--|';

      expectObservable(e1.pipe(skipLast(2))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should skip last three values', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =  cold('--a-----b----c---d--|');
      const e1subs =   '^                   !';
      const expected = '-----------------a--|';

      expectObservable(e1.pipe(skipLast(3))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should skip all values when trying to take larger then source', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =  cold('--a-----b----c---d--|');
      const e1subs =   '^                   !';
      const expected = '--------------------|';

      expectObservable(e1.pipe(skipLast(5))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should skip all element when try to take exact', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =  cold('--a-----b----c---d--|');
      const e1subs =   '^                   !';
      const expected = '--------------------|';

      expectObservable(e1.pipe(skipLast(4))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should not skip any values', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =  cold('--a-----b----c---d--|');
      const e1subs =   '^                   !';
      const expected = '--a-----b----c---d--|';

      expectObservable(e1.pipe(skipLast(0))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should work with empty', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =  cold('|');
      const e1subs =   '(^!)';
      const expected = '|';

      expectObservable(e1.pipe(skipLast(42))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should go on forever on never', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =  cold('-');
      const e1subs =   '^';
      const expected = '-';

      expectObservable(e1.pipe(skipLast(42))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should skip one value from an observable with one value', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('---(a|)');
      const e1subs =   '^  !   ';
      const expected = '---|   ';

      expectObservable(e1.pipe(skipLast(1))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should skip one value from an observable with many values', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('--a--^--b----c---d--|');
      const e1subs =      '^              !';
      const expected =    '--------b---c--|';

      expectObservable(e1.pipe(skipLast(1))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should work with empty and early emission', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('--a--^----|');
      const e1subs =      '^    !';
      const expected =    '-----|';

      expectObservable(e1.pipe(skipLast(42))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should propagate error from the source observable', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('---^---#', null, 'too bad');
      const e1subs =    '^   !';
      const expected =  '----#';

      expectObservable(e1.pipe(skipLast(42))).toBe(expected, null, 'too bad');
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should propagate error from an observable with values', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('---^--a--b--#');
      const e1subs =    '^        !';
      const expected =  '---------#';

      expectObservable(e1.pipe(skipLast(42))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should allow unsubscribing explicitly and early', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('---^--a--b-----c--d--e--|');
      const unsub =     '         !            ';
      const e1subs =    '^        !            ';
      const expected =  '----------            ';

      expectObservable(e1.pipe(skipLast(42)), unsub).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should work with throw', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =  cold('#');
      const e1subs =   '(^!)';
      const expected = '#';

      expectObservable(e1.pipe(skipLast(42))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should throw if total is less than zero', () => {
    expect(() => { of(1, 2, 3).pipe(skipLast(-1)); })
      .to.throw(ArgumentOutOfRangeError);
  });

  it('should not break unsubscription chain when unsubscribed explicitly', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('---^--a--b-----c--d--e--|');
      const unsub =     '         !            ';
      const e1subs =    '^        !            ';
      const expected =  '----------            ';

      const result = e1.pipe(
        mergeMap((x: string) => of(x)),
        skipLast(42),
        mergeMap((x: string) => of(x))
      );

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });
});
