
import { last, mergeMap } from 'rxjs/operators';
import { EmptyError, of } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { assertDeepEquals } from 'rxjs/internal/test_helpers/assertDeepEquals';

/** @test {last} */
describe('last', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(assertDeepEquals);
  });

  //asDiagram('last')
  it('should take the last value of an observable', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('--a----b--c--|');
      const e1subs =   '^            !';
      const expected = '-------------(c|)';

      expectObservable(e1.pipe(last())).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should error on nothing sent but completed', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('--a--^----|');
      const e1subs =      '^    !';
      const expected =    '-----#';

      expectObservable(e1.pipe(last())).toBe(expected, null, new EmptyError());
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should error on empty', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =  cold('|');
      const e1subs =   '(^!)';
      const expected = '#';

      expectObservable(e1.pipe(last())).toBe(expected, null, new EmptyError());
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should go on forever on never', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =  cold('-');
      const e1subs =   '^';
      const expected = '-';

      expectObservable(e1.pipe(last())).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should return last element matches with predicate', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =    hot('--a--b--a--b--|');
      const e1subs =    '^             !';
      const expected =  '--------------(b|)';

      expectObservable(e1.pipe(last(value => value === 'b'))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should allow unsubscribing explicitly and early', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =    hot('--a--b--c--d--|');
      const unsub =     '       !       ';
      const e1subs =    '^      !       ';
      const expected =  '--------       ';

      expectObservable(e1.pipe(last()), unsub).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =    hot('--a--b--c--d--|');
      const e1subs =    '^      !       ';
      const expected =  '--------       ';
      const unsub =     '       !       ';

      const result = e1.pipe(
        mergeMap(x => of(x)),
        last(),
        mergeMap(x => of(x)),
      );

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should return a default value if no element found', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =  cold('|');
      const e1subs =   '(^!)';
      const expected = '(a|)';

      expectObservable(e1.pipe(last(null, 'a'))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should not return default value if an element is found', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('--a---^---b---c---d---|');
      const e1subs =       '^               !';
      const expected =     '----------------(d|)';

      expectObservable(e1.pipe(last(null, 'x'))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should raise error when predicate throws', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('--a--^---b---c---d---e--|');
      const e1subs =      '^       !           ';
      const expected =    '--------#           ';

      const predicate = function (x: string) {
        if (x === 'c') {
          throw 'error';
        } else {
          return false;
        }
      };

      expectObservable(e1.pipe(last(predicate))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });
});
