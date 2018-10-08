import { TestScheduler } from 'rxjs/testing';
import { defaultIfEmpty, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { assertDeepEquals } from 'rxjs/internal/test_helpers/assertDeepEquals';


/** @test {defaultIfEmpty} */
describe('defaultIfEmpty', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(assertDeepEquals);
  });

  // asDiagram('defaultIfEmpty(42)')
  it('should return the Observable if not empty with a default value', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('--------|');
      const expected = '--------(x|)';

      expectObservable(e1.pipe(defaultIfEmpty(42))).toBe(expected, { x: 42 });
    });
  });

  it('should return the argument if Observable is empty', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =  cold('|');
      const e1subs =   '(^!)';
      const expected = '(x|)';

      expectObservable(e1.pipe(defaultIfEmpty('x'))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should return null if the Observable is empty and no arguments', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =  cold('|');
      const e1subs =   '(^!)';
      const expected = '(x|)';

      expectObservable(e1.pipe(defaultIfEmpty())).toBe(expected, { x: null });
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should return the Observable if not empty with a default value', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('--a--b--|');
      const e1subs =   '^       !';
      const expected = '--a--b--|';

      expectObservable(e1.pipe(defaultIfEmpty('x'))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should return the Observable if not empty with no default value', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('--a--b--|');
      const e1subs =   '^       !';
      const expected = '--a--b--|';

      expectObservable(e1.pipe(defaultIfEmpty())).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should allow unsubscribing early and explicitly', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('--a--b--|');
      const e1subs =   '^   !    ';
      const expected = '--a--    ';
      const unsub =    '    !    ';

      const result = e1.pipe(defaultIfEmpty('x'));

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should not break unsubscription chains when unsubscribed explicitly', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('--a--b--|');
      const e1subs =   '^   !    ';
      const expected = '--a--    ';
      const unsub =    '    !    ';

      const result = e1.pipe(
        mergeMap(x => of(x)),
        defaultIfEmpty('x'),
        mergeMap(x => of(x)),
      );

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should error if the Observable errors', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =  cold('#');
      const e1subs =   '(^!)';
      const expected = '#';

      expectObservable(e1.pipe(defaultIfEmpty('x'))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });
});
