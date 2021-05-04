/** @prettier */
import { sampleTime, mergeMap } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { of } from 'rxjs';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {sampleTime} */
describe('sampleTime', () => {
  let rxTest: TestScheduler;

  beforeEach(() => {
    rxTest = new TestScheduler(observableMatcher);
  });

  it('should get samples on a delay', () => {
    rxTest.run(({ hot, expectObservable, expectSubscriptions, time }) => {
      const e1 = hot('     a---b-c---------d--e---f-g-h--|');
      const e1subs = '     ^-----------------------------!';
      const expected = '   -------c-------------e------h-|';
      // period            -------!------!------!------!--
      const period = time('-------|                       ');

      expectObservable(e1.pipe(sampleTime(period, rxTest))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should sample nothing if new value has not arrived', () => {
    rxTest.run(({ hot, expectObservable, expectSubscriptions, time }) => {
      const e1 = hot('  ----a-^--b----c--------------f----|');
      const e1subs = '        ^---------------------------!';
      const expected = '      -----------c----------------|';
      // period               -----------!----------!---------
      const period = time('   -----------|                 ');

      expectObservable(e1.pipe(sampleTime(period, rxTest))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should sample if new value has arrived, even if it is the same value', () => {
    rxTest.run(({ hot, expectObservable, expectSubscriptions, time }) => {
      const e1 = hot('----a-^--b----c----------c---f----|');
      const e1subs = '      ^---------------------------!';
      const expected = '    -----------c----------c-----|';
      // period             -----------!----------!---------
      const period = time(' -----------|                 ');

      expectObservable(e1.pipe(sampleTime(period, rxTest))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should sample nothing if source has not nexted by time of sample', () => {
    rxTest.run(({ hot, expectObservable, expectSubscriptions, time }) => {
      const e1 = hot('----a-^-------------b-------------|');
      const e1subs = '      ^---------------------------!';
      const expected = '    ----------------------b-----|';
      // period             -----------!----------!---------
      const period = time(' -----------|                 ');

      expectObservable(e1.pipe(sampleTime(period, rxTest))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should raise error if source raises error', () => {
    rxTest.run(({ hot, expectObservable, expectSubscriptions, time }) => {
      const e1 = hot('----a-^--b----c----d----#');
      const e1subs = '      ^-----------------!';
      const expected = '    -----------c------#';
      // period             -----------!----------!---------
      const period = time(' -----------|       ');

      expectObservable(e1.pipe(sampleTime(period, rxTest))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should allow unsubscribing explicitly and early', () => {
    rxTest.run(({ hot, expectObservable, expectSubscriptions, time }) => {
      const e1 = hot('----a-^--b----c----d----e----f----|');
      const unsub = '       ----------------!            ';
      const e1subs = '      ^---------------!            ';
      const expected = '    -----------c-----            ';
      // period             -----------!----------!---------
      const period = time(' -----------|                 ');

      expectObservable(e1.pipe(sampleTime(period, rxTest)), unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    rxTest.run(({ hot, expectObservable, expectSubscriptions, time }) => {
      const e1 = hot('----a-^--b----c----d----e----f----|');
      const e1subs = '      ^---------------!            ';
      // period             -----------!----------!---------
      const period = time(' -----------|                 ');
      const expected = '    -----------c-----            ';
      const unsub = '       ----------------!            ';

      const result = e1.pipe(
        mergeMap((x: string) => of(x)),
        sampleTime(period, rxTest),
        mergeMap((x: string) => of(x))
      );

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should completes if source does not emits', () => {
    rxTest.run(({ cold, expectObservable, expectSubscriptions, time }) => {
      const e1 = cold('    |     ');
      const e1subs = '     (^!)  ';
      const expected = '   |     ';
      const period = time('-----|');

      expectObservable(e1.pipe(sampleTime(period, rxTest))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should raise error if source throws immediately', () => {
    rxTest.run(({ cold, expectObservable, expectSubscriptions, time }) => {
      const e1 = cold('    #     ');
      const e1subs = '     (^!)  ';
      const expected = '   #     ';
      const period = time('-----|');

      expectObservable(e1.pipe(sampleTime(period, rxTest))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not complete if source does not complete', () => {
    rxTest.run(({ cold, expectObservable, expectSubscriptions, time }) => {
      const e1 = cold('    --------');
      const e1subs = '     ^------!';
      const expected = '   --------';
      const period = time('-----|  ');
      const e1unsbs = '    -------!';

      expectObservable(e1.pipe(sampleTime(period, rxTest)), e1unsbs).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
});
