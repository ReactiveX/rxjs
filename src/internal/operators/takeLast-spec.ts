import { takeLast, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { assertDeepEquals } from 'rxjs/internal/test_helpers/assertDeepEquals';

/** @test {takeLast} */
describe('takeLast operator', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(assertDeepEquals);
  });

  // asDiagram('takeLast(2)')
  it('should take two values of an observable with many values', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =  cold('--a-----b----c---d--|    ');
      const e1subs =   '^                   !    ';
      const expected = '--------------------(cd|)';

      expectObservable(e1.pipe(takeLast(2))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should take last three values', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =  cold('--a-----b----c---d--|    ');
      const e1subs =   '^                   !    ';
      const expected = '--------------------(bcd|)';

      expectObservable(e1.pipe(takeLast(3))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should take all element when try to take larger then source', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =  cold('--a-----b----c---d--|    ');
      const e1subs =   '^                   !    ';
      const expected = '--------------------(abcd|)';

      expectObservable(e1.pipe(takeLast(5))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should take all element when try to take exact', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =  cold('--a-----b----c---d--|    ');
      const e1subs =   '^                   !    ';
      const expected = '--------------------(abcd|)';

      expectObservable(e1.pipe(takeLast(4))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should not take any values if zero is passed', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =  cold('--a-----b----c---d--|');
      const expected = '|';

      expectObservable(e1.pipe(takeLast(0))).toBe(expected);
    });
  });

  it('should work with empty', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =  cold('|');
      const e1subs =   '(^!)';
      const expected = '|';

      expectObservable(e1.pipe(takeLast(42))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should go on forever on never', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =  cold('-');
      const e1subs =   '^';
      const expected = '-';

      expectObservable(e1.pipe(takeLast(42))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should be empty on takeLast(0)', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('--a--^--b----c---d--|');
      const e1subs: string[] = []; // Don't subscribe at all
      const expected =    '|';

      expectObservable(e1.pipe(takeLast(0))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should take one value from an observable with one value', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('---(a|)');
      const e1subs =   '^  !   ';
      const expected = '---(a|)';

      expectObservable(e1.pipe(takeLast(1))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should take one value from an observable with many values', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('--a--^--b----c---d--|   ');
      const e1subs =      '^              !   ';
      const expected =    '---------------(d|)';

      expectObservable(e1.pipe(takeLast(1))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should error on empty', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('--a--^----|');
      const e1subs =      '^    !';
      const expected =    '-----|';

      expectObservable(e1.pipe(takeLast(42))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should propagate error from the source observable', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('---^---#', null, 'too bad');
      const e1subs =    '^   !';
      const expected =  '----#';

      expectObservable(e1.pipe(takeLast(42))).toBe(expected, null, 'too bad');
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should propagate error from an observable with values', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('---^--a--b--#');
      const e1subs =    '^        !';
      const expected =  '---------#';

      expectObservable(e1.pipe(takeLast(42))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should allow unsubscribing explicitly and early', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('---^--a--b-----c--d--e--|');
      const unsub =     '         !            ';
      const e1subs =    '^        !            ';
      const expected =  '----------            ';

      expectObservable(e1.pipe(takeLast(42)), unsub).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should work with throw', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =  cold('#');
      const e1subs =   '(^!)';
      const expected = '#';

      expectObservable(e1.pipe(takeLast(42))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  // TODO(benlesh): uncomment
  // it('should throw if total is less than zero', () => {
  //   expect(() => { range(0, 10).pipe(takeLast(-1)); })
  //     .to.throw(ArgumentOutOfRangeError);
  // });

  it('should not break unsubscription chain when unsubscribed explicitly', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('---^--a--b-----c--d--e--|');
      const unsub =     '         !            ';
      const e1subs =    '^        !            ';
      const expected =  '----------            ';

      const result = e1.pipe(
        mergeMap((x: string) => of(x)),
        takeLast(42),
        mergeMap((x: string) => of(x))
      );

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });
});
