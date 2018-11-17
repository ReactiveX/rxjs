import { sampleTime, mergeMap } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { of } from 'rxjs';
import { assertDeepEquals } from 'rxjs/internal/test_helpers/assertDeepEquals';

/** @test {sampleTime} */
describe('sampleTime operator', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(assertDeepEquals);
  });

  //asDiagram('sampleTime(70)')
  it('should get samples on a delay', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('a---b-c---------d--e---f-g-h--|');
      const e1subs =   '^                             !';
      const expected = '-------c-------------e------h-|';
      // timer          -------!------!------!------!--

      expectObservable(e1.pipe(sampleTime(7, testScheduler))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should sample nothing if new value has not arrived', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('----a-^--b----c--------------f----|');
      const e1subs =         '^                           !';
      const expected =       '-----------c----------------|';
      // timer                -----------!----------!---------

      expectObservable(e1.pipe(sampleTime(11, testScheduler))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should sample if new value has arrived, even if it is the same value', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('----a-^--b----c----------c---f----|');
      const e1subs =         '^                           !';
      const expected =       '-----------c----------c-----|';
      // timer                -----------!----------!---------

      expectObservable(e1.pipe(sampleTime(11, testScheduler))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should sample nothing if source has not nexted by time of sample', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('----a-^-------------b-------------|');
      const e1subs =         '^                           !';
      const expected =       '----------------------b-----|';
      // timer                -----------!----------!---------

      expectObservable(e1.pipe(sampleTime(11, testScheduler))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should raise error if source raises error', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('----a-^--b----c----d----#');
      const e1subs =         '^                 !';
      const expected =       '-----------c------#';
      // timer                -----------!----------!---------

      expectObservable(e1.pipe(sampleTime(11, testScheduler))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should allow unsubscribing explicitly and early', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('----a-^--b----c----d----e----f----|');
      const unsub =          '                !            ';
      const e1subs =         '^               !            ';
      const expected =       '-----------c-----            ';
      // timer                -----------!----------!---------

      expectObservable(e1.pipe(sampleTime(11, testScheduler)), unsub).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('----a-^--b----c----d----e----f----|');
      const e1subs =         '^               !            ';
      // timer                -----------!----------!---------
      const expected =       '-----------c-----            ';
      const unsub =          '                !            ';

      const result = e1.pipe(
        mergeMap((x: string) => of(x)),
        sampleTime(11, testScheduler),
        mergeMap((x: string) => of(x))
      );

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should completes if source does not emits', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =  cold('|');
      const e1subs =   '(^!)';
      const expected = '|';

      expectObservable(e1.pipe(sampleTime(6, testScheduler))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should raise error if source throws immediately', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =  cold('#');
      const e1subs =   '(^!)';
      const expected = '#';

      expectObservable(e1.pipe(sampleTime(6, testScheduler))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  // TODO: this is not testable; the TestScheduler will effect an out-of-memory error
  it.skip('should not completes if source does not complete', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =  cold('-');
      const e1subs =   '^';
      const expected = '-';

      expectObservable(e1.pipe(sampleTime(6, testScheduler))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });
});
