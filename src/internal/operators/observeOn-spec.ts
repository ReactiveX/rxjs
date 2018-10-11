import { observeOn, mergeMap } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { expect } from 'chai';
import { of, Observable, asapScheduler } from 'rxjs';
import { assertDeepEquals } from 'rxjs/internal/test_helpers/assertDeepEquals';
import { SchedulerLike } from 'rxjs/internal/types';

/** @test {observeOn} */
describe('observeOn operator', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(assertDeepEquals);
  });

  //asDiagram('observeOn(scheduler)')
  it('should observe on specified scheduler', () => {
    testScheduler.run(({hot, cold, expectObservable, expectSubscriptionsTo}) => {
      const e1 =    hot('--a--b--|');
      const expected =  '--a--b--|';
      const sub =       '^       !';

      expectObservable(e1.pipe(observeOn(testScheduler))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(sub);
    });
  });

  it('should observe after specified delay', () => {
    testScheduler.run(({hot, cold, expectObservable, expectSubscriptionsTo}) => {
      const e1 =    hot('--a--b--|   ');
      const expected =  '-----a--b--|';
      const sub =       '^       !   ';

      expectObservable(e1.pipe(observeOn(testScheduler, 3))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(sub);
    });
  });

  it('should observe when source raises error', () => {
    testScheduler.run(({hot, cold, expectObservable, expectSubscriptionsTo}) => {
      const e1 =    hot('--a--#');
      const expected =  '--a--#';
      const sub =       '^    !';

      expectObservable(e1.pipe(observeOn(testScheduler))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(sub);
    });
  });

  it('should observe when source is empty', () => {
    testScheduler.run(({hot, cold, expectObservable, expectSubscriptionsTo}) => {
      const e1 =    hot('-----|');
      const expected =  '-----|';
      const sub =       '^    !';

      expectObservable(e1.pipe(observeOn(testScheduler))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(sub);
    });
  });

  it('should observe when source does not complete', () => {
    testScheduler.run(({hot, cold, expectObservable, expectSubscriptionsTo}) => {
      const e1 =    hot('-----');
      const expected =  '-----';
      const sub =       '^    ';

      expectObservable(e1.pipe(observeOn(testScheduler))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(sub);
    });
  });

  it('should allow unsubscribing early and explicitly', () => {
    testScheduler.run(({hot, cold, expectObservable, expectSubscriptionsTo}) => {
      const e1 =    hot('--a--b--|');
      const sub =       '^   !    ';
      const expected =  '--a--    ';
      const unsub =     '    !    ';

      const result = e1.pipe(observeOn(testScheduler));

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptionsTo(e1).toBe(sub);
    });
  });

  it('should not break unsubscription chains when the result is unsubscribed explicitly', () => {
    testScheduler.run(({hot, cold, expectObservable, expectSubscriptionsTo}) => {
      const e1 =    hot('--a--b--|');
      const sub =       '^   !    ';
      const expected =  '--a--    ';
      const unsub =     '    !    ';

      const result = e1.pipe(
        mergeMap((x: string) => of(x)),
        observeOn(testScheduler),
        mergeMap((x: string) => of(x))
      );

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptionsTo(e1).toBe(sub);
    });
  });
});
