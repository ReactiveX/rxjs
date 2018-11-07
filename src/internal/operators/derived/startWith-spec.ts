import { startWith, mergeMap } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { of } from 'rxjs';
import { assertDeepEquals } from 'rxjs/internal/test_helpers/assertDeepEquals';

/** @test {startWith} */
describe('startWith operator', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(assertDeepEquals);
  });

  //asDiagram('startWith(s)')
  it('should prepend to a cold Observable', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =  cold('---a--b--c--|');
      const e1subs =   '^           !';
      const expected = 's--a--b--c--|';

      expectObservable(e1.pipe(startWith('s'))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should start an observable with given value', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('--a--|');
      const e1subs =   '^    !';
      const expected = 'x-a--|';

      expectObservable(e1.pipe(startWith('x'))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should start with given value and does not completes if source does not completes', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('----a-');
      const e1subs =   '^     ';
      const expected = 'x---a-';

      expectObservable(e1.pipe(startWith('x'))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should start with given value and does not completes if source never emits', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =  cold('-');
      const e1subs =   '^';
      const expected = 'x-';

      expectObservable(e1.pipe(startWith('x'))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should start with given value and completes if source does not emits', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('---|');
      const e1subs =   '^  !';
      const expected = 'x--|';

      expectObservable(e1.pipe(startWith('x'))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should start with given value and complete immediately if source is empty', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =  cold('|');
      const e1subs =   '(^!)';
      const expected = '(x|)';

      expectObservable(e1.pipe(startWith('x'))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should start with given value and source both if source emits single value', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =  cold('(a|)');
      const e1subs =   '(^!)';
      const expected = '(xa|)';

      expectObservable(e1.pipe(startWith('x'))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should start with given values when given value is more than one', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('-----a--|');
      const e1subs =   '^       !';
      const expected = '(yz)-a--|';

      expectObservable(e1.pipe(startWith('y', 'z'))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should start with given value and raises error if source raises error', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('--#');
      const e1subs =   '^ !';
      const expected = 'x-#';

      expectObservable(e1.pipe(startWith('x'))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should start with given value and raises error immediately if source throws error', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =  cold('#');
      const e1subs =   '(^!)';
      const expected = '(x#)';

      expectObservable(e1.pipe(startWith('x'))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should allow unsubscribing explicitly and early', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('---a--b----c--d--|');
      const unsub =    '         !        ';
      const e1subs =   '^        !        ';
      const expected = 's--a--b---';
      const values = { s: 's', a: 'a', b: 'b' };

      const result = e1.pipe(startWith('s'));

      expectObservable(result, unsub).toBe(expected, values);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('---a--b----c--d--|');
      const e1subs =   '^        !        ';
      const expected = 's--a--b---        ';
      const unsub =    '         !        ';
      const values = { s: 's', a: 'a', b: 'b' };

      const result = e1.pipe(
        mergeMap(x => of(x)),
        startWith('s'),
        mergeMap(x => of(x))
      );

      expectObservable(result, unsub).toBe(expected, values);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should start with empty if given value is not specified', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('-a-|');
      const e1subs =   '^  !';
      const expected = '-a-|';

      expectObservable(e1.pipe(startWith())).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });
});
