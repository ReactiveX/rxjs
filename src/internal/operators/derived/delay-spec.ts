import { of } from 'rxjs';
import { delay, mergeMap } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { assertDeepEquals } from 'rxjs/internal/test_helpers/assertDeepEquals';

/** @test {delay} */
describe('delay operator', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(assertDeepEquals);
  });

  // asDiagram('delay(20)')
  it('should delay by specified timeframe', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo, time }) => {
      const e1 =   hot('---a--b---|');
      const t =   time(   '--|     ');
      const expected = '-----a--b-|';
      const subs =     '^         !';

      const result = e1.pipe(delay(t, testScheduler));

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(subs);
    });
  });

  it('should delay by absolute time period', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo, time }) => {
      const e1 =   hot('--a--b--|   ');
      const t =   time(  '---|      ');
      const expected = '-----a--(b|)';
      const subs =     '^       !   ';

      const absoluteDelay = new Date(testScheduler.now() + t);
      const result = e1.pipe(delay(absoluteDelay, testScheduler));

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(subs);
    });
  });

  it('should delay by absolute time period after subscription', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo, time }) => {
      const e1 =   hot('---^--a--b--|   ');
      const t =   time(      '---|      ');
      const expected =    '------a--(b|)';
      const subs =        '^        !   ';

      const absoluteDelay = new Date(testScheduler.now() + t);
      const result = e1.pipe(delay(absoluteDelay, testScheduler));

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(subs);
    });
  });

  it('should raise error when source raises error', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo, time }) => {
      const e1 =   hot('---a---b---#');
      const t =   time(   '---|     ');
      const expected = '------a---b#';
      const subs =     '^          !';

      const result = e1.pipe(delay(t, testScheduler));

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(subs);
    });
  });

  it('should raise error when source raises error', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo, time }) => {
      const e1 =   hot('--a--b--#');
      const t =   time(  '---|   ');
      const expected = '-----a--#';
      const subs =     '^       !';

      const absoluteDelay = new Date(testScheduler.now() + t);
      const result = e1.pipe(delay(absoluteDelay, testScheduler));

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(subs);
    });
  });

  it('should raise error when source raises error after subscription', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo, time }) => {
      const e1 =   hot('---^---a---b---#');
      const t =   time(       '---|     ');
      const expected =    '-------a---b#';
      const e1Sub =       '^           !';

      const absoluteDelay = new Date(testScheduler.now() + t);
      const result = e1.pipe(delay(absoluteDelay, testScheduler));

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1Sub);
    });
  });

  it('should NOT delay when source does not emits', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo, time }) => {
      const e1 =   hot('----|   ');
      const t =   time(    '---|');
      const expected = '----|';
      const subs =     '^   !   ';

      const result = e1.pipe(delay(t, testScheduler));

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(subs);
    });
  });

  it('should NOT delay when source is empty', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo, time }) => {
      const e1 =  cold('|');
      const t =   time('---|');
      const expected = '|';

      const result = e1.pipe(delay(t, testScheduler));

      expectObservable(result).toBe(expected);
    });
  });

  it('should not complete when source does not completes', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo, time }) => {
      const e1 =   hot('---a---b---------');
      const t =   time(   '---|          ');
      const expected = '------a---b------';
      const unsub =    '----------------!';
      const subs =     '^               !';

      const result = e1.pipe(delay(t, testScheduler));

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptionsTo(e1).toBe(subs);
    });
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo, time }) => {
      const e1 =   hot('---a---b----');
      const t =   time(   '---|     ');
      const e1subs =   '^       !   ';
      const expected = '------a--   ';
      const unsub =    '        !   ';

      const result = e1.pipe(
        mergeMap((x: any) => of(x)),
        delay(t, testScheduler),
        mergeMap((x: any) => of(x))
      );

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should not complete when source never completes', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo, time }) => {
      const e1 =  cold('-');
      const t =   time('---|');
      const expected = '-';

      const result = e1.pipe(delay(t, testScheduler));

      expectObservable(result).toBe(expected);
    });
  });
});
