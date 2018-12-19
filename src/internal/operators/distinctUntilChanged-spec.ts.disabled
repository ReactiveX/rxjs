import { distinctUntilChanged, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { assertDeepEquals } from 'rxjs/internal/test_helpers/assertDeepEquals';

declare function asDiagram(arg: string): Function;

/** @test {distinctUntilChanged} */
describe('distinctUntilChanged operator', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(assertDeepEquals);
  });

  //asDiagram('distinctUntilChanged')
  it('should distinguish between values', () => {
    testScheduler.run(({ hot, expectObservable }) => {
      const e1 =   hot('-1--2-2----1-3-|');
      const expected = '-1--2------1-3-|';

      expectObservable(e1.pipe(distinctUntilChanged())).toBe(expected);
    });
  });

  it('should distinguish between values', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('--a--a--a--b--b--a--|');
      const e1subs =   '^                   !';
      const expected = '--a--------b-----a--|';

      expectObservable(e1.pipe(distinctUntilChanged())).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should distinguish between values and does not completes', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('--a--a--a--b--b--a-');
      const e1subs =   '^                  ';
      const expected = '--a--------b-----a-';

      expectObservable(e1.pipe(distinctUntilChanged())).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should not completes if source never completes', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =  cold('-');
      const e1subs =   '^';
      const expected = '-';

      expectObservable(e1.pipe(distinctUntilChanged())).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should not completes if source does not completes', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('-');
      const e1subs =   '^';
      const expected = '-';

      expectObservable(e1.pipe(distinctUntilChanged())).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should complete if source is empty', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =  cold('|');
      const e1subs =   '(^!)';
      const expected = '|';

      expectObservable(e1.pipe(distinctUntilChanged())).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should complete if source does not emit', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('------|');
      const e1subs =   '^     !';
      const expected = '------|';

      expectObservable(e1.pipe(distinctUntilChanged())).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should emit if source emits single element only', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('--a--|');
      const e1subs =   '^    !';
      const expected = '--a--|';

      expectObservable(e1.pipe(distinctUntilChanged())).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should emit if source is scalar', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = of('a');
      const expected = '(a|)';

      expectObservable(e1.pipe(distinctUntilChanged())).toBe(expected);
    });
  });

  it('should raises error if source raises error', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('--a--a--#');
      const e1subs =   '^       !';
      const expected = '--a-----#';

      expectObservable(e1.pipe(distinctUntilChanged())).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should raises error if source throws', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =  cold('#');
      const e1subs =   '(^!)';
      const expected = '#';

      expectObservable(e1.pipe(distinctUntilChanged())).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should not omit if source elements are all different', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('--a--b--c--d--e--f--|');
      const e1subs =   '^                   !';
      const expected = '--a--b--c--d--e--f--|';

      expectObservable(e1.pipe(distinctUntilChanged())).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should allow unsubscribing early and explicitly', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('--a--b--b--d--a--f--|');
      const e1subs =   '^         !          ';
      const expected = '--a--b-----          ';
      const unsub =    '          !          ';

      const result = e1.pipe(distinctUntilChanged());

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should not break unsubscription chains when unsubscribed explicitly', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('--a--b--b--d--a--f--|');
      const e1subs =   '^         !          ';
      const expected = '--a--b-----          ';
      const unsub =    '          !          ';

      const result = e1.pipe(
        mergeMap((x: any) => of(x)),
        distinctUntilChanged(),
        mergeMap((x: any) => of(x)),
      );

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should emit once if source elements are all same', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('--a--a--a--a--a--a--|');
      const e1subs =   '^                   !';
      const expected = '--a-----------------|';

      expectObservable(e1.pipe(distinctUntilChanged())).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should emit once if comparator returns true always regardless of source emits', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('--a--b--c--d--e--f--|');
      const e1subs =   '^                   !';
      const expected = '--a-----------------|';

      expectObservable(e1.pipe(distinctUntilChanged(() => { return true; }))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should emit all if comparator returns false always regardless of source emits', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('--a--a--a--a--a--a--|');
      const e1subs =   '^                   !';
      const expected = '--a--a--a--a--a--a--|';

      expectObservable(e1.pipe(distinctUntilChanged(() => { return false; }))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should distinguish values by comparator', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('--a--b--c--d--e--f--|', {a: 1, b: 2, c: 3, d: 4, e: 5, f: 6});
      const e1subs =   '^                   !';
      const expected = '--a-----c-----e-----|';
      const comparator = (x: number, y: number) => y % 2 === 0;

      expectObservable(e1.pipe(distinctUntilChanged(comparator))).toBe(expected, {a: 1, c: 3, e: 5});
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should raises error when comparator throws', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('--a--b--c--d--e--f--|');
      const e1subs =   '^          !         ';
      const expected = '--a--b--c--#         ';
      const comparator = (x: string, y: string) => {
        if (y === 'd') {
          throw 'error';
        }
        return x === y;
      };

      expectObservable(e1.pipe(distinctUntilChanged(comparator))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should use the keySelector to pick comparator values', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('--a--b--c--d--e--f--|', {a: 1, b: 2, c: 3, d: 4, e: 5, f: 6});
      const e1subs =   '^                   !';
      const expected = '--a--b-----d-----f--|';
      const comparator = (x: number, y: number) => y % 2 === 1;
      const keySelector = (x: number) => x % 2;

      expectObservable(e1.pipe(distinctUntilChanged(comparator, keySelector))).toBe(expected, {a: 1, b: 2, d: 4, f: 6});
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should raise an error when keySelector throws', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('--a--b--c--d--e--f--|');
      const e1subs =   '^          !         ';
      const expected = '--a--b--c--#         ';
      const keySelector = (x: string) => {
        if (x === 'd') {
          throw 'error';
        }
        return x;
      };

      expectObservable(e1.pipe(distinctUntilChanged(null, keySelector))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });
});
