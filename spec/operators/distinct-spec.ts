/** @prettier */
import { expect } from 'chai';
import { distinct, mergeMap, take } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { of, Observable } from 'rxjs';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {distinct} */
describe('distinct', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(observableMatcher);
  });

  it('should distinguish between values', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--a--a--b--b--a--|');
      const e1subs = '  ^-------------------!';
      const expected = '--a--------b--------|';

      expectObservable(e1.pipe(distinct())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should distinguish between values and does not complete', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--a--a--b--b--a-');
      const e1subs = '  ^------------------';
      const expected = '--a--------b-------';

      expectObservable(e1.pipe(distinct())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not complete if source never completes', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' -');
      const e1subs = '  ^';
      const expected = '-';

      expectObservable(e1.pipe(distinct())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not complete if source does not complete', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -');
      const e1subs = '  ^';
      const expected = '-';

      expectObservable(e1.pipe(distinct())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should complete if source is empty', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' |');
      const e1subs = '  (^!)';
      const expected = '|';

      expectObservable(e1.pipe(distinct())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should complete if source does not emit', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ------|');
      const e1subs = '  ^-----!';
      const expected = '------|';

      expectObservable(e1.pipe(distinct())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should emit if source emits single element only', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--|');
      const e1subs = '  ^----!';
      const expected = '--a--|';

      expectObservable(e1.pipe(distinct())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should emit if source is scalar', () => {
    testScheduler.run(({ expectObservable }) => {
      const e1 = of('a');
      const expected = '(a|)';

      expectObservable(e1.pipe(distinct())).toBe(expected);
    });
  });

  it('should raises error if source raises error', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--a--#');
      const e1subs = '  ^-------!';
      const expected = '--a-----#';

      expectObservable(e1.pipe(distinct())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should raises error if source throws', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' #   ');
      const e1subs = '  (^!)';
      const expected = '#   ';

      expectObservable(e1.pipe(distinct())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not omit if source elements are all different', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--d--e--f--|');
      const e1subs = '  ^-------------------!';
      const expected = '--a--b--c--d--e--f--|';

      expectObservable(e1.pipe(distinct())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should allow unsubscribing early and explicitly', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--b--d--a--f--|');
      const e1subs = '  ^---------!          ';
      const expected = '--a--b-----          ';
      const unsub = '   ----------!          ';

      const result = e1.pipe(distinct());

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not break unsubscription chains when unsubscribed explicitly', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--b--d--a--f--|');
      const e1subs = '  ^---------!          ';
      const expected = '--a--b-----          ';
      const unsub = '   ----------!          ';

      const result = e1.pipe(
        mergeMap((x: any) => of(x)),
        distinct(),
        mergeMap((x: any) => of(x))
      );

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should emit once if source elements are all same', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--a--a--a--a--a--|');
      const e1subs = '  ^-------------------!';
      const expected = '--a-----------------|';

      expectObservable(e1.pipe(distinct())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should distinguish values by key', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const values = { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 };
      const e1 = hot('  --a--b--c--d--e--f--|', values);
      const e1subs = '  ^-------------------!';
      const expected = '--a--b--c-----------|';
      const selector = (value: number) => value % 3;

      expectObservable(e1.pipe(distinct(selector))).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should raises error when selector throws', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--d--e--f--|');
      const e1subs = '  ^----------!         ';
      const expected = '--a--b--c--#         ';
      const selector = (value: string) => {
        if (value === 'd') {
          throw new Error('d is for dumb');
        }
        return value;
      };

      expectObservable(e1.pipe(distinct(selector))).toBe(expected, undefined, new Error('d is for dumb'));
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should support a flushing stream', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--a--b--a--b--|');
      const e1subs = '  ^-------------------!';
      const e2 = hot('  -----------x--------|');
      const e2subs = '  ^-------------------!';
      const expected = '--a--b--------a--b--|';

      expectObservable(e1.pipe(distinct(undefined, e2))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should raise error if flush raises error', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--a--b--a--b--|');
      const e1subs = '  ^------------!       ';
      const e2 = hot('  -----------x-#       ');
      const e2subs = '  ^------------!       ';
      const expected = '--a--b-------#       ';

      expectObservable(e1.pipe(distinct(undefined, e2))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should unsubscribe from the flushing stream when the main stream is unsubbed', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--a--b--a--b--|');
      const e1subs = '  ^----------!         ';
      const e2 = hot('  -----------x--------|');
      const e2subs = '  ^----------!         ';
      const unsub = '   -----------!         ';
      const expected = '--a--b------         ';

      expectObservable(e1.pipe(distinct(undefined, e2)), unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should allow opting in to default comparator with flush', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--a--b--a--b--|');
      const e1subs = '  ^-------------------!';
      const e2 = hot('  -----------x--------|');
      const e2subs = '  ^-------------------!';
      const expected = '--a--b--------a--b--|';

      expectObservable(e1.pipe(distinct(undefined, e2))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should stop listening to a synchronous observable when unsubscribed', () => {
    const sideEffects: number[] = [];
    const synchronousObservable = new Observable<number>((subscriber) => {
      // This will check to see if the subscriber was closed on each loop
      // when the unsubscribe hits (from the `take`), it should be closed
      for (let i = 0; !subscriber.closed && i < 10; i++) {
        sideEffects.push(i);
        subscriber.next(i);
      }
    });

    synchronousObservable.pipe(distinct(), take(3)).subscribe(() => {
      /* noop */
    });

    expect(sideEffects).to.deep.equal([0, 1, 2]);
  });
});
