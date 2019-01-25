import { expect } from 'chai';
import { forkJoin, of } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { assertDeepEquals } from '../test_helpers/assertDeepEquals';
import { lowerCaseO } from '../test_helpers/lowerCaseO';

/** @test {forkJoin} */
describe('forkJoin', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(assertDeepEquals);
  });

  //asDiagram('forkJoin')
  it('should join the last values of the provided observables into an array', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = forkJoin(
                    hot('---a---b---c---d---|'),
                    hot('-1---2---3---|')
      );
      const expected =  '-------------------(x|)';

      expectObservable(e1).toBe(expected, {x: ['d', '3']});
    });
  });

  it('should join the last values of the provided observables into an array', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = forkJoin(
                hot('--a--b--c--d--|'),
                hot('(b|)'),
                hot('--1--2--3--|')
              );
      const expected = '--------------(x|)';

      expectObservable(e1).toBe(expected, {x: ['d', 'b', '3']});
    });
  });

  it('should allow emit null or undefined', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e2 = forkJoin(
                hot('--a--b--c--d--|', { d: null }),
                hot('(b|)'),
                hot('--1--2--3--|'),
                hot('-----r--t--u--|', { u: undefined })
              );
      const expected2 = '--------------(x|)';

      expectObservable(e2).toBe(expected2, {x: [null, 'b', '3', undefined]});
    });
  });

  it('should accept single observable', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = forkJoin(
                hot('--a--b--c--d--|')
              );
      const expected = '--------------(x|)';

      expectObservable(e1).toBe(expected, {x: ['d']});
    });
  });

  it('should accept array of observable contains single', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = forkJoin(
                [hot('--a--b--c--d--|')]
              );
      const expected = '--------------(x|)';

      expectObservable(e1).toBe(expected, {x: ['d']});
    });
  });

  it('should accept lowercase-o observables', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = forkJoin(
                hot('--a--b--c--d--|'),
                hot('(b|)'),
                lowerCaseO('1', '2', '3')
              );
      const expected = '--------------(x|)';

      expectObservable(e1).toBe(expected, {x: ['d', 'b', '3']});
    });
  });

  it('should accept empty lowercase-o observables', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = forkJoin(
                hot('--a--b--c--d--|'),
                hot('(b|)'),
                lowerCaseO()
              );
      const expected = '|';

      expectObservable(e1).toBe(expected);
    });
  });

  it('should accept promise', done => {
    const e1 = forkJoin(
               of(1),
               Promise.resolve(2)
            );

    e1.subscribe({
      next: x => {
        expect(x).to.deep.equal([1, 2]);
      },
      error: (err: any) => {
        done(new Error('should not be called'));
      },
      complete: done,
    });
  });

  it('should accept array of observables', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = forkJoin(
                [hot('--a--b--c--d--|'),
                  hot('(b|)'),
                  hot('--1--2--3--|')]
              );
      const expected = '--------------(x|)';

      expectObservable(e1).toBe(expected, {x: ['d', 'b', '3']});
    });
  });

  it('should not emit if any of source observable is empty', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = forkJoin(
                hot('--a--b--c--d--|'),
                hot('(b|)'),
                hot('------------------|')
              );
      const expected = '------------------|';

      expectObservable(e1).toBe(expected);
    });
  });

  it('should complete early if any of source is empty and completes before than others', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = forkJoin(
                hot('--a--b--c--d--|'),
                hot('(b|)'),
                hot('---------|')
      );
      const expected = '---------|';

      expectObservable(e1).toBe(expected);
    });
  });

  it('should complete when all sources are empty', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = forkJoin(
                hot('--------------|'),
                hot('---------|')
      );
      const expected = '---------|';

      expectObservable(e1).toBe(expected);
    });
  });

  it('should not complete when only source never completes', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = forkJoin(
        hot('--------------')
      );
      const expected = '-';

      expectObservable(e1).toBe(expected);
    });
  });

  it('should not complete when one of the sources never completes', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = forkJoin(
        hot('--------------'),
        hot('-a---b--c--|')
      );
      const expected = '-';

      expectObservable(e1).toBe(expected);
    });
  });

  it('should complete when one of the sources never completes but other completes without values', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = forkJoin(
                  hot('--------------'),
                  hot('------|')
      );
      const expected = '------|';

      expectObservable(e1).toBe(expected);
    });
  });

  it('should complete if source is not provided', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = forkJoin();
      const expected = '|';

      expectObservable(e1).toBe(expected);
    });
  });

  it('should complete if sources list is empty', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = forkJoin([]);
      const expected = '|';

      expectObservable(e1).toBe(expected);
    });
  });

  it('should raise error when any of source raises error with empty observable', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = forkJoin(
                hot('------#'),
                hot('---------|'));
      const expected = '------#';

      expectObservable(e1).toBe(expected);
    });
  });

  it('should raise error when any of source raises error with source that never completes', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = forkJoin(
                  hot('------#'),
                  hot('----------'));
      const expected = '------#';

      expectObservable(e1).toBe(expected);
    });
  });

  it('should raise error when source raises error', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = forkJoin(
                hot('------#'),
                hot('---a-----|'));
      const expected = '------#';

      expectObservable(e1).toBe(expected);
    });
  });

  it('should allow unsubscribing early and explicitly', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('--a--^--b--c---d-| ');
      const e1subs =        '^        !    ';
      const e2 =   hot('---e-^---f--g---h-|');
      const e2subs =        '^        !    ';
      const expected =      '----------    ';
      const unsub =         '         !    ';

      const result = forkJoin(e1, e2);

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
    });
  });

  it('should unsubscribe other Observables, when one of them errors', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
    const e1 =   hot('--a--^--b--c---d-| ');
      const e1subs =        '^        !    ';
      const e2 =   hot('---e-^---f--g-#');
      const e2subs =        '^        !    ';
      const expected =      '---------#    ';

      const result = forkJoin(e1, e2);

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
    });
  });
});
