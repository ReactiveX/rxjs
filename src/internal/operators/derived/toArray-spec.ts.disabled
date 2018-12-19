import { toArray, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { assertDeepEquals } from 'rxjs/internal/test_helpers/assertDeepEquals';

/** @test {toArray} */
describe('toArray operator', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(assertDeepEquals);
  });

  //asDiagram('toArray')
  it('should reduce the values of an observable into an array', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('---a--b--|');
      const e1subs =   '^        !';
      const expected = '---------(w|)';

      expectObservable(e1.pipe(toArray())).toBe(expected, { w: ['a', 'b'] });
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should be never when source is never', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =  cold('-');
      const e1subs =   '^';
      const expected = '-';

      expectObservable(e1.pipe(toArray())).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should be never when source is empty', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =  cold('|');
      const e1subs =   '(^!)';
      const expected = '(w|)';

      expectObservable(e1.pipe(toArray())).toBe(expected, { w: [] });
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should be never when source doesn\'t complete', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('--x--^--y--');
      const e1subs =      '^     ';
      const expected =    '------';

      expectObservable(e1.pipe(toArray())).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should reduce observable without values into an array of length zero', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('-x-^---|');
      const e1subs =    '^   !';
      const expected =  '----(w|)';

      expectObservable(e1.pipe(toArray())).toBe(expected, { w: [] });
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should reduce the a single value of an observable into an array', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('-x-^--y--|');
      const e1subs =    '^     !';
      const expected =  '------(w|)';

      expectObservable(e1.pipe(toArray())).toBe(expected, { w: ['y'] });
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should allow multiple subscriptions', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('-x-^--y--|');
      const e1subs =    '^     !';
      const expected =  '------(w|)';

      const result = e1.pipe(toArray());
      expectObservable(result).toBe(expected, { w: ['y'] });
      expectObservable(result).toBe(expected, { w: ['y'] });
      expectSubscriptionsTo(e1).toBe([e1subs, e1subs]);
    });
  });

  it('should allow unsubscribing explicitly and early', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('--a--b----c-----d----e---|');
      const unsub =    '        !                 ';
      const e1subs =   '^       !                 ';
      const expected = '---------                 ';

      expectObservable(e1.pipe(toArray()), unsub).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('--a--b----c-----d----e---|');
      const e1subs =   '^       !                 ';
      const expected = '---------                 ';
      const unsub =    '        !                 ';

      const result = e1.pipe(
        mergeMap((x: string) => of(x)),
        toArray(),
        mergeMap((x: Array<string>) => of(x))
      );

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should work with error', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('-x-^--y--z--#', { x: 1, y: 2, z: 3 }, 'too bad');
      const e1subs =    '^        !';
      const expected =  '---------#';

      expectObservable(e1.pipe(toArray())).toBe(expected, null, 'too bad');
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should work with throw', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =  cold('#');
      const e1subs =   '(^!)';
      const expected = '#';

      expectObservable(e1.pipe(toArray())).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });
});
