import { timer, NEVER, merge } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { mergeMap, take, concatWith } from 'rxjs/operators';
import { assertDeepEquals } from 'rxjs/internal/test_helpers/assertDeepEquals';

/** @test {timer} */
describe('timer', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(assertDeepEquals);
  });

  //asDiagram('timer(3000, 1000)')
  it('should create an observable emitting periodically', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = timer(6, 2, testScheduler).pipe(
        take(4), // make it actually finite, so it can be rendered
        concatWith(NEVER) // but pretend it's infinite by not completing
      );
      const expected = '------a-b-c-d-';
      const values = {
        a: 0,
        b: 1,
        c: 2,
        d: 3,
      };
      expectObservable(e1).toBe(expected, values);
    });
  });

  it('should schedule a value of 0 then complete', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo, time }) => {
      const dueTime = time('-----|');
      const expected =     '-----(x|)';

      const source = timer(dueTime, undefined, testScheduler);
      expectObservable(source).toBe(expected, {x: 0});
    });
  });

  it('should emit a single value immediately', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo, time }) => {
      const dueTime = time('|');
      const expected =     '(x|)';

      const source = timer(dueTime, testScheduler);
      expectObservable(source).toBe(expected, {x: 0});
    });
  });

  it('should start after delay and periodically emit values', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo, time }) => {
      const dueTime = time('----|');
      const period  = time(    '--|');
      const expected =     '----a-b-c-d-(e|)';

      const source = timer(dueTime, period, testScheduler).pipe(take(5));
      const values = { a: 0, b: 1, c: 2, d: 3, e: 4};
      expectObservable(source).toBe(expected, values);
    });
  });

  it('should start immediately and periodically emit values', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo, time }) => {
      const dueTime = time('|');
      const period  = time('---|');
      const expected =     'a--b--c--d--(e|)';

      const source = timer(dueTime, period, testScheduler).pipe(take(5));
      const values = { a: 0, b: 1, c: 2, d: 3, e: 4};
      expectObservable(source).toBe(expected, values);
    });
  });

  it('should stop emiting values when subscription is done', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo, time }) => {
      const dueTime = time('|');
      const period  = time('---|');
      const expected = 'a--b--c--d--e';
      const unsub   =  '^------------!';

      const source = timer(dueTime, period, testScheduler);
      const values = { a: 0, b: 1, c: 2, d: 3, e: 4};
      expectObservable(source, unsub).toBe(expected, values);
    });
  });

  it('should schedule a value at a specified Date', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo, time }) => {
      const offset = time('----|');
      const expected =    '----(a|)';

      const dueTime = new Date(testScheduler.now() + offset);
      const source = timer(dueTime, null, testScheduler);
      expectObservable(source).toBe(expected, {a: 0});
    });
  });

  it('should start after delay and periodically emit values', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo, time }) => {
      const offset = time('----|');
      const period = time(    '--|');
      const expected =    '----a-b-c-d-(e|)';

      const dueTime = new Date(testScheduler.now() + offset);
      const source = timer(dueTime, period, testScheduler).pipe(take(5));
      const values = { a: 0, b: 1, c: 2, d: 3, e: 4};
      expectObservable(source).toBe(expected, values);
    });
  });

  it('should still target the same date if a date is provided even for the ' +
    'second subscription', () => {
      testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo, time }) => {
        const offset = time('----|    ');
        const t1 = cold(    'a|       ');
        const t2 = cold(    '--a|     ');
        const expected =    '----(aa|)';

        const dueTime = new Date(testScheduler.now() + offset);
        const source = timer(dueTime, null, testScheduler);

        const testSource = merge(t1, t2).pipe(
          mergeMap(() => source)
        );

        expectObservable(testSource).toBe(expected, {a: 0});
    });
  });
});
