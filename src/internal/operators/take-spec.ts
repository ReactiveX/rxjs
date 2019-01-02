import { expect } from 'chai';
import { TestScheduler } from 'rxjs/testing';
import { take, mergeMap } from 'rxjs/operators';
import { /*range, ArgumentOutOfRangeError,*/ of, Observable, Subject } from 'rxjs';
import { assertDeepEquals } from 'rxjs/internal/test_helpers/assertDeepEquals';

declare function asDiagram(arg: string): Function;

/** @test {take} */
describe('take operator', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(assertDeepEquals);
  });

  //asDiagram('take(2)')
  it('should take two values of an observable with many values', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =  cold('--a-----b----c---d--|');
      const e1subs =   '^       !            ';
      const expected = '--a-----(b|)         ';

      expectObservable(e1.pipe(take(2))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should work with empty', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =  cold('|');
      const e1subs =   '(^!)';
      const expected = '|';

      expectObservable(e1.pipe(take(42))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should go on forever on never', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =  cold('-');
      const e1subs =   '^';
      const expected = '-';

      expectObservable(e1.pipe(take(42))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should be empty on take(0)', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('--a--^--b----c---d--|');
      const e1subs: string[] = []; // Don't subscribe at all
      const expected =    '|';

      expectObservable(e1.pipe(take(0))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should take one value of an observable with one value', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('---(a|)');
      const e1subs =   '^  !   ';
      const expected = '---(a|)';

      expectObservable(e1.pipe(take(1))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should take one values of an observable with many values', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('--a--^--b----c---d--|');
      const e1subs =      '^  !            ';
      const expected =    '---(b|)         ';

      expectObservable(e1.pipe(take(1))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should error on empty', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('--a--^----|');
      const e1subs =      '^    !';
      const expected =    '-----|';

      expectObservable(e1.pipe(take(42))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should propagate error from the source observable', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('---^---#', null, 'too bad');
      const e1subs =    '^   !';
      const expected =  '----#';

      expectObservable(e1.pipe(take(42))).toBe(expected, null, 'too bad');
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should propagate error from an observable with values', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('---^--a--b--#');
      const e1subs =    '^        !';
      const expected =  '---a--b--#';

      expectObservable(e1.pipe(take(42))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should allow unsubscribing explicitly and early', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('---^--a--b-----c--d--e--|');
      const unsub =     '^--------!            ';
      const e1subs =    '^        !            ';
      const expected =  '---a--b---            ';

      expectObservable(e1.pipe(take(42)), unsub).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should work with throw', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =  cold('#');
      const e1subs =   '(^!)';
      const expected = '#';

      expectObservable(e1.pipe(take(42))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  // TODO(benlesh): uncomment
  // it('should throw if total is less than zero', () => {
  //   expect(() => { range(0, 10).pipe(take(-1)); })
  //     .to.throw(ArgumentOutOfRangeError);
  // });

  it('should not break unsubscription chain when unsubscribed explicitly', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('---^--a--b-----c--d--e--|');
      const unsub =     '^--------!            ';
      const e1subs =    '^        !            ';
      const expected =  '---a--b---            ';

      const result = e1.pipe(
        mergeMap((x: string) => of(x)),
        take(42),
        mergeMap((x: string) => of(x))
      );

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should unsubscribe from the source when it reaches the limit', () => {
    const source = new Observable<number>(observer => {
      expect(observer.closed).to.be.false;
      observer.next(42);
      expect(observer.closed).to.be.true;
    }).pipe(take(1));

    source.subscribe();
  });

  it('should complete when the source is reentrant', () => {
    let completed = false;
    const source = new Subject();
    source.pipe(take(5)).subscribe({
      next() {
        source.next(undefined);
      },
      complete() {
        completed = true;
      }
    });
    source.next(undefined);
    expect(completed).to.be.true;
  });
});
