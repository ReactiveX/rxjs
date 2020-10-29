/** @prettier */
import { expect } from 'chai';
import { distinctUntilKeyChanged, mergeMap, map, take } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { of, Observable } from 'rxjs';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {distinctUntilKeyChanged} */
describe('distinctUntilKeyChanged', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(observableMatcher);
  });

  it('should distinguish between values', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const values = { a: { k: 1 }, b: { k: 2 }, c: { k: 3 } };
      const e1 = hot('  -a--b-b----a-c-|', values);
      const e1Subs = '  ^--------------!';
      const expected = '-a--b------a-c-|';

      const result = e1.pipe(distinctUntilKeyChanged('k'));

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1Subs);
    });
  });

  it('should distinguish between values', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const values = { a: { val: 1 }, b: { val: 2 } };
      const e1 = hot('  --a--a--a--b--b--a--|', values);
      const e1subs = '  ^-------------------!';
      const expected = '--a--------b-----a--|';

      expectObservable(e1.pipe(distinctUntilKeyChanged('val'))).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should distinguish between values and does not complete', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const values = { a: { val: 1 }, b: { val: 2 } };
      const e1 = hot('  --a--a--a--b--b--a-', values);
      const e1subs = '  ^                  ';
      const expected = '--a--------b-----a-';

      expectObservable(e1.pipe(distinctUntilKeyChanged('val'))).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should distinguish between values with key', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const values = { a: { val: 1 }, b: { valOther: 1 }, c: { valOther: 3 }, d: { val: 1 }, e: { val: 5 } };
      const e1 = hot<any>('--a--b--c--d--e--|', values);
      const e1subs = '     ^----------------!';
      const expected = '   --a--b-----d--e--|';

      expectObservable(e1.pipe(distinctUntilKeyChanged('val'))).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not compare if source does not have element with key', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const values = { a: { valOther: 1 }, b: { valOther: 1 }, c: { valOther: 3 }, d: { valOther: 1 }, e: { valOther: 5 } };
      const e1 = hot<any>('--a--b--c--d--e--|', values);
      const e1subs = '     ^----------------!';
      const expected = '   --a--------------|';

      expectObservable(e1.pipe(distinctUntilKeyChanged('val'))).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not complete if source never completes', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold<any>('-');
      const e1subs = '      ^';
      const expected = '    -';

      expectObservable(e1.pipe(distinctUntilKeyChanged('val'))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not complete if source does not complete', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot<any>('-');
      const e1subs = '     ^';
      const expected = '   -';

      expectObservable(e1.pipe(distinctUntilKeyChanged('val'))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should complete if source is empty', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold<any>('|');
      const e1subs = '      (^!)';
      const expected = '    |';

      expectObservable(e1.pipe(distinctUntilKeyChanged('val'))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should complete if source does not emit', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot<any>('------|');
      const e1subs = '     ^-----!';
      const expected = '   ------|';

      expectObservable(e1.pipe(distinctUntilKeyChanged('val'))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should emit if source emits single element only', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const values = { a: { val: 1 } };
      const e1 = hot('  --a--|', values);
      const e1subs = '  ^----!';
      const expected = '--a--|';

      expectObservable(e1.pipe(distinctUntilKeyChanged('val'))).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should emit if source is scalar', () => {
    testScheduler.run(({ expectObservable }) => {
      const values = { a: { val: 1 } };
      const e1 = of(values.a);
      const expected = '(a|)';

      expectObservable(e1.pipe(distinctUntilKeyChanged('val'))).toBe(expected, values);
    });
  });

  it('should raise error if source raises error', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const values = { a: { val: 1 } };
      const e1 = hot('  --a--a--#', values);
      const e1subs = '  ^-------!';
      const expected = '--a-----#';

      expectObservable(e1.pipe(distinctUntilKeyChanged('val'))).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should raise error if source throws', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold<any>('#   ');
      const e1subs = '      (^!)';
      const expected = '    #   ';

      expectObservable(e1.pipe(distinctUntilKeyChanged('val'))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not omit if source elements are all different', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const values = { a: { val: 1 }, b: { val: 2 }, c: { val: 3 }, d: { val: 4 }, e: { val: 5 } };
      const e1 = hot('  --a--b--c--d--e--|', values);
      const e1subs = '  ^----------------!';
      const expected = '--a--b--c--d--e--|';

      expectObservable(e1.pipe(distinctUntilKeyChanged('val'))).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should allow unsubscribing early and explicitly', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const values = { a: { val: 1 }, b: { val: 2 }, c: { val: 3 }, d: { val: 4 }, e: { val: 5 } };
      const e1 = hot('  --a--b--b--d--a--e--|', values);
      const e1subs = '  ^---------!          ';
      const expected = '--a--b-----          ';
      const unsub = '   ----------!          ';

      const result = e1.pipe(distinctUntilKeyChanged('val'));

      expectObservable(result, unsub).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not break unsubscription chains when unsubscribed explicitly', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const values = { a: { val: 1 }, b: { val: 2 }, c: { val: 3 }, d: { val: 4 }, e: { val: 5 } };
      const e1 = hot('  --a--b--b--d--a--e--|', values);
      const e1subs = '  ^---------!          ';
      const expected = '--a--b-----          ';
      const unsub = '   ----------!          ';

      const result = e1.pipe(
        mergeMap((x: any) => of(x)),
        distinctUntilKeyChanged('val'),
        mergeMap((x: any) => of(x))
      );

      expectObservable(result, unsub).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should emit once if source elements are all same', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const values = { a: { val: 1 } };
      const e1 = hot('  --a--a--a--a--a--a--|', values);
      const e1subs = '  ^-------------------!';
      const expected = '--a-----------------|';

      expectObservable(e1.pipe(distinctUntilKeyChanged('val'))).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should emit once if comparer returns true always regardless of source emits', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const values = { a: { val: 1 }, b: { val: 2 }, c: { val: 3 }, d: { val: 4 }, e: { val: 5 } };
      const e1 = hot('  --a--b--c--d--e--|', values);
      const e1subs = '  ^----------------!';
      const expected = '--a--------------|';

      expectObservable(e1.pipe(distinctUntilKeyChanged('val', () => true))).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should emit all if comparer returns false always regardless of source emits', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const values = { a: { val: 1 } };
      const e1 = hot('  --a--a--a--a--a--a--|', values);
      const e1subs = '  ^-------------------!';
      const expected = '--a--a--a--a--a--a--|';

      expectObservable(e1.pipe(distinctUntilKeyChanged('val', () => false))).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should distinguish values by selector', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const values = { a: { val: 1 }, b: { val: 2 }, c: { val: 3 }, d: { val: 4 }, e: { val: 5 } };
      const e1 = hot('  --a--b--c--d--e--|', values);
      const e1subs = '  ^----------------!';
      const expected = '--a-----c-----e--|';
      const selector = (x: number, y: number) => y % 2 === 0;

      expectObservable(e1.pipe(distinctUntilKeyChanged('val', selector))).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should raise error when comparer throws', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const values = { a: { val: 1 }, b: { val: 2 }, c: { val: 3 }, d: { val: 4 }, e: { val: 5 } };
      const e1 = hot('  --a--b--c--d--e--|', values);
      const e1subs = '  ^----------!      ';
      const expected = '--a--b--c--#      ';
      const selector = (x: number, y: number) => {
        if (y === 4) {
          throw 'error';
        }
        return x === y;
      };

      expectObservable(e1.pipe(distinctUntilKeyChanged('val', selector))).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
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

    synchronousObservable
      .pipe(
        map((value) => ({ value })),
        distinctUntilKeyChanged('value'),
        take(3)
      )
      .subscribe(() => {
        /* noop */
      });

    expect(sideEffects).to.deep.equal([0, 1, 2]);
  });
});
