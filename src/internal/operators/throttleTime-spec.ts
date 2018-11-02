import { expect } from 'chai';
import { throttleTime, take, map, mergeMap } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { of, concat, timer } from 'rxjs';
import { assertDeepEquals } from 'rxjs/internal/test_helpers/assertDeepEquals';


/** @test {throttleTime} */
describe('throttleTime operator', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(assertDeepEquals);
  });

  //asDiagram('throttleTime(5)')
  it('should immediately emit the first value in each time window', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo}) => {
      const e1 =   hot('-a-x-y----b---x-cx---|');
      const subs =     '^                    !';
      const expected = '-a--------b-----c----|';

      const result = e1.pipe(throttleTime(5, testScheduler));

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(subs);
    });
  });

  it('should throttle events by 5 time units', done => {
    of(1, 2, 3).pipe(throttleTime(5))
      .subscribe(x => {
        expect(x).to.equal(1);
      }, null, done);
  });

  it('should throttle events multiple times', () => {
    const expected = ['1-0', '2-0'];
    concat(
      timer(0, 1, testScheduler).pipe(take(3), map(x => '1-' + x)),
      timer(8, 1, testScheduler).pipe(take(5), map(x => '2-' + x))
    ).pipe(
      throttleTime(5, testScheduler)
    ).subscribe((x: string) => {
      expect(x).to.equal(expected.shift());
    });

    testScheduler.flush();
  });

  it('should simply mirror the source if values are not emitted often enough', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo}) => {
      const e1 =   hot('-a--------b-----c----|');
      const subs =     '^                    !';
      const expected = '-a--------b-----c----|';

      expectObservable(e1.pipe(throttleTime(5, testScheduler))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(subs);
    });
  });

  it('should handle a busy producer emitting a regular repeating sequence', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo}) => {
      const e1 =   hot('abcdefabcdefabcdefabcdefa|');
      const subs =     '^                        !';
      const expected = 'a-----a-----a-----a-----a|';

      expectObservable(e1.pipe(throttleTime(5, testScheduler))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(subs);
    });
  });

  it('should complete when source does not emit', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo}) => {
      const e1 =   hot('-----|');
      const subs =     '^    !';
      const expected = '-----|';

      expectObservable(e1.pipe(throttleTime(5, testScheduler))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(subs);
    });
  });

  it('should raise error when source does not emit and raises error', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo}) => {
      const e1 =   hot('-----#');
      const subs =     '^    !';
      const expected = '-----#';

      expectObservable(e1.pipe(throttleTime(1, testScheduler))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(subs);
    });
  });

  it('should handle an empty source', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo}) => {
      const e1 =  cold('|');
      const subs =     '(^!)';
      const expected = '|';

      expectObservable(e1.pipe(throttleTime(3, testScheduler))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(subs);
    });
  });

  it('should handle a never source', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo}) => {
      const e1 =  cold('-');
      const subs =     '^';
      const expected = '-';

      expectObservable(e1.pipe(throttleTime(3, testScheduler))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(subs);
    });
  });

  it('should handle a throw source', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo}) => {
      const e1 =  cold('#');
      const subs =     '(^!)';
      const expected = '#';

      expectObservable(e1.pipe(throttleTime(3, testScheduler))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(subs);
    });
  });

  it('should throttle and does not complete when source does not completes', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo}) => {
      const e1 =   hot('-a--(bc)-------d----------------');
      const unsub =    '                               !';
      const subs =     '^                              !';
      const expected = '-a-------------d----------------';

      expectObservable(e1.pipe(throttleTime(5, testScheduler)), unsub).toBe(expected);
      expectSubscriptionsTo(e1).toBe(subs);
    });
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo}) => {
      const e1 =   hot('-a--(bc)-------d----------------');
      const subs =     '^                              !';
      const expected = '-a-------------d----------------';
      const unsub =    '                               !';

      const result = e1.pipe(
        mergeMap((x: string) => of(x)),
        throttleTime(5, testScheduler),
        mergeMap((x: string) => of(x))
      );

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptionsTo(e1).toBe(subs);
    });
  });

  it('should throttle values until source raises error', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo}) => {
      const e1 =   hot('-a--(bc)-------d---------------#');
      const subs =     '^                              !';
      const expected = '-a-------------d---------------#';

      expectObservable(e1.pipe(throttleTime(5, testScheduler))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(subs);
    });
  });

  describe('throttleTime(fn, { leading: true, trailing: true })', () => {
    //asDiagram('throttleTime(fn, { leading: true, trailing: true })')
    it('should immediately emit the first value in each time window', () =>  {
      testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo, time}) => {
        const e1 =   hot('-a-xy-----b--x--cxxx--|');
        const e1subs =   '^                     !';
        const t =  time( '----|                 ');
        const expected = '-a---y----b---x-c---x-|';

        const result = e1.pipe(throttleTime(t, testScheduler, { leading: true, trailing: true }));

        expectObservable(result).toBe(expected);
        expectSubscriptionsTo(e1).toBe(e1subs);
      });
    });
  });

  describe('throttleTime(fn, { leading: false, trailing: true })', () => {
    //asDiagram('throttleTime(fn, { leading: false, trailing: true })')
    it('should immediately emit the first value in each time window', () =>  {
      testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo, time}) => {
        const e1 =   hot('-a-xy-----b--x--cxxx--|');
        const e1subs =   '^                     !';
        const t =  time( '----|                 ');
        const expected = '-----y--------x-----x-|';

        const result = e1.pipe(throttleTime(t, testScheduler, { leading: false, trailing: true }));

        expectObservable(result).toBe(expected);
        expectSubscriptionsTo(e1).toBe(e1subs);
      });
    });

    //asDiagram('throttleTime(fn, { leading: false, trailing: true })')
    it('should emit the last throttled value when complete', () => {
      testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo, time}) => {
        const e1 =   hot('-a-xy-----b--x--cxx|');
        const e1subs =   '^                  !';
        const t =   time('----|');
        const expected = '-----y--------x----(x|)';

        const result = e1.pipe(throttleTime(t, testScheduler, { leading: false, trailing: true }));
        expectObservable(result).toBe(expected);
        expectSubscriptionsTo(e1).toBe(e1subs);
      });
    });
  });
});
