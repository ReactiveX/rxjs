/** @prettier */
import { expect } from 'chai';
import { distinctUntilChanged, mergeMap, take } from 'rxjs/operators';
import { of, Observable, Subject } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {distinctUntilChanged} */
describe('distinctUntilChanged', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(observableMatcher);
  });

  it('should distinguish between values', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -1--2-2----1-3-|');
      const e1subs = '  ^--------------!';
      const expected = '-1--2------1-3-|';

      expectObservable(e1.pipe(distinctUntilChanged())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should distinguish between values', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--a--a--b--b--a--|');
      const e1subs = '  ^-------------------!';
      const expected = '--a--------b-----a--|';

      expectObservable(e1.pipe(distinctUntilChanged())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should distinguish between values and does not complete', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--a--a--b--b--a-');
      const e1subs = '  ^------------------';
      const expected = '--a--------b-----a-';

      expectObservable(e1.pipe(distinctUntilChanged())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not complete if source never completes', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' -');
      const e1subs = '  ^';
      const expected = '-';

      expectObservable(e1.pipe(distinctUntilChanged())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not complete if source does not complete', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -');
      const e1subs = '  ^';
      const expected = '-';

      expectObservable(e1.pipe(distinctUntilChanged())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should complete if source is empty', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' |   ');
      const e1subs = '  (^!)';
      const expected = '|   ';

      expectObservable(e1.pipe(distinctUntilChanged())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should complete if source does not emit', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ------|');
      const e1subs = '  ^-----!';
      const expected = '------|';

      expectObservable(e1.pipe(distinctUntilChanged())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should emit if source emits single element only', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--|');
      const e1subs = '  ^----!';
      const expected = '--a--|';

      expectObservable(e1.pipe(distinctUntilChanged())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should emit if source is scalar', () => {
    testScheduler.run(({ expectObservable }) => {
      const e1 = of('a');
      const expected = '(a|)';

      expectObservable(e1.pipe(distinctUntilChanged())).toBe(expected);
    });
  });

  it('should raise error if source raises error', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--a--#');
      const e1subs = '  ^-------!';
      const expected = '--a-----#';

      expectObservable(e1.pipe(distinctUntilChanged())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should raise error if source throws', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' #   ');
      const e1subs = '  (^!)';
      const expected = '#   ';

      expectObservable(e1.pipe(distinctUntilChanged())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not omit if source elements are all different', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--d--e--f--|');
      const e1subs = '  ^-------------------!';
      const expected = '--a--b--c--d--e--f--|';

      expectObservable(e1.pipe(distinctUntilChanged())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should allow unsubscribing early and explicitly', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--b--d--a--f--|');
      const e1subs = '  ^---------!          ';
      const expected = '--a--b-----          ';
      const unsub = '   ----------!          ';

      const result = e1.pipe(distinctUntilChanged());

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
        distinctUntilChanged(),
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

      expectObservable(e1.pipe(distinctUntilChanged())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should emit once if comparator returns true always regardless of source emits', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--d--e--f--|');
      const e1subs = '  ^-------------------!';
      const expected = '--a-----------------|';
      const comparator = () => true;

      expectObservable(e1.pipe(distinctUntilChanged(comparator))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should emit all if comparator returns false always regardless of source emits', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--a--a--a--a--a--|');
      const e1subs = '  ^-------------------!';
      const expected = '--a--a--a--a--a--a--|';
      const comparator = () => false;

      expectObservable(e1.pipe(distinctUntilChanged(comparator))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should distinguish values by comparator', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--d--e--f--|', { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 });
      const e1subs = '  ^-------------------!';
      const expected = '--a-----c-----e-----|';
      const comparator = (x: number, y: number) => y % 2 === 0;

      expectObservable(e1.pipe(distinctUntilChanged(comparator))).toBe(expected, { a: 1, c: 3, e: 5 });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should raise error when comparator throws', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--d--e--f--|');
      const e1subs = '  ^----------!         ';
      const expected = '--a--b--c--#         ';
      const comparator = (x: string, y: string) => {
        if (y === 'd') {
          throw 'error';
        }
        return x === y;
      };

      expectObservable(e1.pipe(distinctUntilChanged(comparator))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should use the keySelector to pick comparator values', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--d--e--f--|', { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 });
      const e1subs = '  ^-------------------!';
      const expected = '--a--b-----d-----f--|';
      const comparator = (x: number, y: number) => y % 2 === 1;
      const keySelector = (x: number) => x % 2;

      expectObservable(e1.pipe(distinctUntilChanged(comparator, keySelector))).toBe(expected, { a: 1, b: 2, d: 4, f: 6 });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should use the keySelector even for the first emit', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--|', { a: 2, b: 4 });
      const e1subs = '  ^-------!';
      const expected = '--a-----|';
      const keySelector = (x: number) => x % 2;

      expectObservable(e1.pipe(distinctUntilChanged(null!, keySelector))).toBe(expected, { a: 2 });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should raise error when keySelector throws', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--d--e--f--|');
      const e1subs = '  ^----------!         ';
      const expected = '--a--b--c--#         ';
      const keySelector = (x: string) => {
        if (x === 'd') {
          throw 'error';
        }
        return x;
      };

      expectObservable(e1.pipe(distinctUntilChanged(null as any, keySelector))).toBe(expected);
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

    synchronousObservable.pipe(distinctUntilChanged(), take(3)).subscribe(() => {
      /* noop */
    });

    expect(sideEffects).to.deep.equal([0, 1, 2]);
  });

  // This test is to cover a corner case where someone might write
  // synchronous, reentrant code. At the time this test was authored,
  // the operator was written in such a way that it would allow
  // the duplicate non-distinct values to be emitted repeatedly.
  it('should work properly with reentrant streams', () => {
    const subject = new Subject<number | undefined>();
    const results: any[] = [];
    let count = 0;

    subject.pipe(distinctUntilChanged()).subscribe((n) => {
      results.push(n);

      // Protect against an infinite loop in this test.
      // That shouldn't happen.
      if (++count > 2) {
        throw new Error('this should have only been hit once');
      }

      // If we reenter with the same value, it should not
      // emit again.
      subject.next(1);
    });

    // Start with 1.
    subject.next(1);

    // It should only have emitted one value.
    expect(results).to.deep.equal([1]);
  });
});
