import { expect } from 'chai';
import { of, concat, timer } from 'rxjs';
import { auditTime, take, map, mergeMap } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { assertDeepEquals } from 'rxjs/internal/test_helpers/assertDeepEquals';

/** @test {auditTime} */
describe('auditTime operator', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(assertDeepEquals);
  });

  //asDiagram('auditTime(50)')
  it('should emit the last value in each time window', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('-a-x-y----b---x-cx---|');
      const subs =     '^                    !';
      const expected = '------y--------x-----|';

      const result = e1.pipe(auditTime(5, testScheduler));

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(subs);
    });
  });

  it('should auditTime events by 50 time units', (done: MochaDone) => {
    of(1, 2, 3).pipe(
      auditTime(5)
    ).subscribe(x => {
      done(new Error('should not be called'));
    }, null, () => {
      done();
    });
  });

  it('should auditTime events multiple times', () => {
    const expected = ['1-2', '2-2'];
    concat(
      timer(0, 1, testScheduler).pipe(
        take(3),
        map(x => '1-' + x)
      ),
      timer(8, 1, testScheduler).pipe(
        take(5),
        map(x => '2-' + x)
      )
    ).pipe(
      auditTime(5, testScheduler)
    ).subscribe(x => {
      expect(x).to.equal(expected.shift());
    });

    testScheduler.flush();
  });

  it('should delay the source if values are not emitted often enough', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('-a--------b-----c----|');
      const subs =     '^                    !';
      const expected = '------a--------b-----|';

      expectObservable(e1.pipe(auditTime(5, testScheduler))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(subs);
    });
  });

  it('should handle a busy producer emitting a regular repeating sequence', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('abcdefabcdefabcdefabcdefa|');
      const subs =     '^                        !';
      const expected = '-----f-----f-----f-----f-|';

      expectObservable(e1.pipe(auditTime(5, testScheduler))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(subs);
    });
  });

  it('should complete when source does not emit', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('-----|');
      const subs =     '^    !';
      const expected = '-----|';

      expectObservable(e1.pipe(auditTime(5, testScheduler))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(subs);
    });
  });

  it('should raise error when source does not emit and raises error', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('-----#');
      const subs =     '^    !';
      const expected = '-----#';

      expectObservable(e1.pipe(auditTime(1, testScheduler))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(subs);
    });
  });

  it('should handle an empty source', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =  cold('|');
      const subs =     '(^!)';
      const expected = '|';

      expectObservable(e1.pipe(auditTime(3, testScheduler))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(subs);
    });
  });

  it('should handle a never source', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =  cold('-');
      const subs =     '^';
      const expected = '-';

      expectObservable(e1.pipe(auditTime(3, testScheduler))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(subs);
    });
  });

  it('should handle a throw source', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =  cold('#');
      const subs =     '(^!)';
      const expected = '#';

      expectObservable(e1.pipe(auditTime(3, testScheduler))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(subs);
    });
  });

  it('should not complete when source does not complete', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('-a--(bc)-------d----------------');
      const unsub =    '                               !';
      const subs =     '^                              !';
      const expected = '------c-------------d-----------';

      expectObservable(e1.pipe(auditTime(5, testScheduler)), unsub).toBe(expected);
      expectSubscriptionsTo(e1).toBe(subs);
    });
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('-a--(bc)-------d----------------');
      const subs =     '^                              !';
      const expected = '------c-------------d-----------';
      const unsub =    '                               !';

      const result = e1.pipe(
        mergeMap((x: string) => of(x)),
        auditTime(5, testScheduler),
        mergeMap((x: string) => of(x))
      );

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptionsTo(e1).toBe(subs);
    });
  });

  it('should auditTime values until source raises error', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('-a--(bc)-------d---------------#');
      const subs =     '^                              !';
      const expected = '------c-------------d----------#';

      expectObservable(e1.pipe(auditTime(5, testScheduler))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(subs);
    });
  });
});
