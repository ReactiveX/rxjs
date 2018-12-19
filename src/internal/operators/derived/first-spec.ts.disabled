import { expect } from 'chai';
import { first, mergeMap, delay } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { of, Subject, EmptyError } from 'rxjs';
import { assertDeepEquals } from 'rxjs/internal/test_helpers/assertDeepEquals';

/** @test {first} */
describe('first', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(assertDeepEquals);
  });

  //asDiagram('first')
  it('should take the first value of an observable with many values', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('-----a--b--c---d---|');
      const expected = '-----(a|)           ';
      const sub =      '^    !              ';

      expectObservable(e1.pipe(first())).toBe(expected);
      expectSubscriptionsTo(e1).toBe(sub);
    });
  });

  it('should take the first value of an observable with one value', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('---(a|)');
      const expected = '---(a|)';
      const sub =      '^  !';

      expectObservable(e1.pipe(first())).toBe(expected);
      expectSubscriptionsTo(e1).toBe(sub);
    });
  });

  it('should error on empty', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('--a--^----|');
      const expected =    '-----#';
      const sub =         '^    !';

      expectObservable(e1.pipe(first())).toBe(expected, null, new EmptyError());
      expectSubscriptionsTo(e1).toBe(sub);
    });
  });

  it('should return the default value if source observable was empty', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('-----^----|');
      const expected =    '-----(a|)';
      const sub =         '^    !';

      expectObservable(e1.pipe(first(null, 'a'))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(sub);
    });
  });

  it('should only emit one value in recursive cases', () => {
    const subject = new Subject<number>();
    const results: number[] = [];

    subject.pipe(first()).subscribe(x => {
      results.push(x);
      subject.next(x + 1);
    });

    subject.next(0);

    expect(results).to.deep.equal([0]);
  });

  it('should propagate error from the source observable', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('---^---#');
      const expected =  '----#';
      const sub =       '^   !';

      expectObservable(e1.pipe(first())).toBe(expected);
      expectSubscriptionsTo(e1).toBe(sub);
    });
  });

  it('should go on forever on never', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('--^-------');
      const expected = '--------';
      const sub =      '^       ';

      expectObservable(e1.pipe(first())).toBe(expected);
      expectSubscriptionsTo(e1).toBe(sub);
    });
  });

  it('should allow unsubscribing early and explicitly', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('--a--^-----b----c---d--|');
      const e1subs =      '^  !               ';
      const expected =    '----               ';
      const unsub =       '   !               ';

      expectObservable(e1.pipe(first()), unsub).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('--a--^-----b----c---d--|');
      const e1subs =      '^  !               ';
      const expected =    '----               ';
      const unsub =       '   !               ';

      const result = e1.pipe(
        mergeMap(x => of(x)),
        first(),
        mergeMap(x => of(x)),
      );

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should unsubscribe when the first value is receiv', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const source = hot('--a--b---c-|');
      const subs =       '^ !';
      const expected =   '----(a|)';

      const duration = testScheduler.createTime('--|');

      expectObservable(source.pipe(
        first(),
        delay(duration, testScheduler)
      )).toBe(expected);
      expectSubscriptionsTo(source).toBe(subs);
    });
  });

  it('should return first value that matches a predicate', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('--a-^--b--c--a--c--|');
      const expected =   '------(c|)';
      const sub =        '^     !';

      expectObservable(e1.pipe(first(value => value === 'c'))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(sub);
    });
  });

  it('should return first value that matches a predicate for odd numbers', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('--a-^--b--c--d--e--|', {a: 1, b: 2, c: 3, d: 4, e: 5});
      const expected =   '------(c|)';
      const sub =        '^     !';

      expectObservable(e1.pipe(first(x => x % 2 === 1))).toBe(expected, {c: 3});
      expectSubscriptionsTo(e1).toBe(sub);
    });
  });

  it('should error when no value matches the predicate', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('--a-^--b--c--a--c--|');
      const expected =   '---------------#';
      const sub =        '^              !';

      expectObservable(e1.pipe(first(x => x === 's'))).toBe(expected, null, new EmptyError());
      expectSubscriptionsTo(e1).toBe(sub);
    });
  });

  it('should return the default value when no value matches the predicate', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('--a-^--b--c--a--c--|');
      const expected =   '---------------(d|)';
      const sub =        '^              !';
      expectObservable(e1.pipe(first<string>(x => x === 's', 'd'))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(sub);
    });
  });

  it('should propagate error when no value matches the predicate', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('--a-^--b--c--a--#');
      const expected =   '------------#';
      const sub =        '^           !';

      expectObservable(e1.pipe(first(x => x === 's'))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(sub);
    });
  });

  it('should return first value that matches the index in the predicate', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('--a-^--b--c--a--c--|');
      const expected =   '---------(a|)';
      const sub =        '^        !';

      expectObservable(e1.pipe(first((_, i) => i === 2))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(sub);
    });
  });

  it('should propagate error from predicate', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('--a-^--b--c--d--e--|', {a: 1, b: 2, c: 3, d: 4, e: 5});
      const expected =   '---------#';
      const sub =        '^        !';
      const predicate = function (value: number) {
        if (value < 4) {
          return false;
        } else {
          throw 'error';
        }
      };

      expectObservable(e1.pipe(first(predicate))).toBe(expected, null, 'error');
      expectSubscriptionsTo(e1).toBe(sub);
    });
  });
});
