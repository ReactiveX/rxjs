import { race, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { assertDeepEquals } from 'rxjs/internal/test_helpers/assertDeepEquals';

/** @test {race} */
describe('static race', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(assertDeepEquals);
  });

  it('should race a single observable', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =  cold('---a-----b-----c----|');
      const e1subs =   '^                   !';
      const expected = '---a-----b-----c----|';

      const result = race(e1);

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should race cold and cold', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =  cold('---a-----b-----c----|');
      const e1subs =   '^                   !';
      const e2 =  cold('------x-----y-----z----|');
      const e2subs =   '^  !';
      const expected = '---a-----b-----c----|';

      const result = race(e1, e2);

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
    });
  });

  it('should race with array of observable', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =  cold('---a-----b-----c----|');
      const e1subs =   '^                   !';
      const e2 =  cold('------x-----y-----z----|');
      const e2subs =   '^  !';
      const expected = '---a-----b-----c----|';

      const result = race([e1, e2]);

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
    });
  });

  it('should race hot and hot', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('---a-----b-----c----|');
      const e1subs =   '^                   !';
      const e2 =   hot('------x-----y-----z----|');
      const e2subs =   '^  !';
      const expected = '---a-----b-----c----|';

      const result = race(e1, e2);

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
    });
  });

  it('should race hot and cold', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =  cold('---a-----b-----c----|');
      const e1subs =   '^                   !';
      const e2 =   hot('------x-----y-----z----|');
      const e2subs =   '^  !';
      const expected = '---a-----b-----c----|';

      const result = race(e1, e2);

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
    });
  });

  it('should race 2nd and 1st', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =  cold('------x-----y-----z----|');
      const e1subs =   '^  !';
      const e2 =  cold('---a-----b-----c----|');
      const e2subs =   '^                   !';
      const expected = '---a-----b-----c----|';

      const result = race(e1, e2);

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
    });
  });

  it('should race emit and complete', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =  cold('-----|');
      const e1subs =   '^    !';
      const e2 =   hot('------x-----y-----z----|');
      const e2subs =   '^    !';
      const expected = '-----|';

      const result = race(e1, e2);

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
    });
  });

  it('should allow unsubscribing early and explicitly', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =  cold('---a-----b-----c----|');
      const e1subs =   '^           !';
      const e2 =   hot('------x-----y-----z----|');
      const e2subs =   '^  !';
      const expected = '---a-----b---';
      const unsub =    '^-----------!';

      const result = race(e1, e2);

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
    });
  });

  it('should not break unsubscription chains when unsubscribed explicitly', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('--a--^--b--c---d-| ');
      const e1subs =        '^        !    ';
      const e2 =   hot('---e-^---f--g---h-|');
      const e2subs =        '^  !    ';
      const expected =      '---b--c---    ';
      const unsub =         '^--------!    ';

      const result = race(
          e1.pipe(mergeMap((x: string) => of(x))),
          e2.pipe(mergeMap((x: string) => of(x)))
      ).pipe(mergeMap((x: any) => of(x)));

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
    });
  });

  it('should never emit when given non emitting sources', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =  cold('---|');
      const e2 =  cold('---|');
      const e1subs =   '^  !';
      const expected = '---|';

      const source = race(e1, e2);

      expectObservable(source).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should throw when error occurs mid stream', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =  cold('---a-----#');
      const e1subs =   '^        !';
      const e2 =  cold('------x-----y-----z----|');
      const e2subs =   '^  !';
      const expected = '---a-----#';

      const result = race(e1, e2);

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
    });
  });

  it('should throw when error occurs before a winner is found', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =  cold('---#');
      const e1subs =   '^  !';
      const e2 =  cold('------x-----y-----z----|');
      const e2subs =   '^  !';
      const expected = '---#';

      const result = race(e1, e2);

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
    });
  });

  it('handle empty', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =  cold('|');
      const e1subs =   '(^!)';
      const expected = '|';

      const source = race(e1);

      expectObservable(source).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('handle never', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =  cold('-');
      const e1subs =   '^';
      const expected = '-';

      const source = race(e1);

      expectObservable(source).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('handle throw', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =  cold('#');
      const e1subs =   '(^!)';
      const expected = '#';

      const source = race(e1);

      expectObservable(source).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });
});
