import { subscribeOn, mergeMap } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { of } from 'rxjs';
import { assertDeepEquals } from 'rxjs/internal/test_helpers/assertDeepEquals';

/** @test {subscribeOn} */
describe('subscribeOn operator', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(assertDeepEquals);
  });

  //asDiagram('subscribeOn(scheduler)')
  it('should subscribe on specified scheduler', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('--a--b--|');
      const expected = '--a--b--|';
      const sub =      '^       !';

      expectObservable(e1.pipe(subscribeOn(testScheduler))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(sub);
    });
  });

  it('should start subscribe after specified delay', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('--a--b--|');
      const expected = '-----b--|';
      const sub =      '   ^    !';

      expectObservable(e1.pipe(subscribeOn(testScheduler, 3))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(sub);
    });
  });

  it('should subscribe when source raises error', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('--a--#');
      const expected = '--a--#';
      const sub =      '^    !';

      expectObservable(e1.pipe(subscribeOn(testScheduler))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(sub);
    });
  });

  it('should subscribe when source is empty', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('----|');
      const expected = '----|';
      const sub =      '^   !';

      expectObservable(e1.pipe(subscribeOn(testScheduler))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(sub);
    });
  });

  it('should subscribe when source does not complete', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('----');
      const expected = '----';
      const sub =      '^   ';

      expectObservable(e1.pipe(subscribeOn(testScheduler))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(sub);
    });
  });

  it('should allow unsubscribing early and explicitly', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =    hot('--a--b--|');
      const sub =       '^   !    ';
      const expected =  '--a--    ';
      const unsub =     '    !    ';

      const result = e1.pipe(subscribeOn(testScheduler));

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptionsTo(e1).toBe(sub);
    });
  });

  it('should not break unsubscription chains when the result is unsubscribed explicitly', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =    hot('--a--b--|');
      const sub =       '^   !    ';
      const expected =  '--a--    ';
      const unsub =     '    !    ';

      const result = e1.pipe(
        mergeMap((x: string) => of(x)),
        subscribeOn(testScheduler),
        mergeMap((x: string) => of(x))
      );

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptionsTo(e1).toBe(sub);
    });
  });
});
