/** @prettier */
import { expect } from 'chai';
import { of, Observable } from 'rxjs';
import { endWith, mergeMap, take } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {endWith} */
describe('endWith', () => {
  const defaultEndValue = 'x';
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(observableMatcher);
  });

  it('should append to a cold Observable', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' ---a--b--c--|   ');
      const e1subs = '  ^-----------!   ';
      const expected = '---a--b--c--(s|)';

      expectObservable(e1.pipe(endWith('s'))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should append numbers to a cold Observable', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const values = { a: 1, b: 2, c: 3, s: 4 };
      const e1 = cold(' ---a--b--c--|   ', values);
      const e1subs = '  ^-----------!   ';
      const expected = '---a--b--c--(s|)';

      expectObservable(e1.pipe(endWith(values.s))).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should end an observable with given value', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--|   ');
      const e1subs = '  ^----!   ';
      const expected = '--a--(x|)';

      expectObservable(e1.pipe(endWith(defaultEndValue))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not end with given value if source does not complete', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ----a-');
      const e1subs = '  ^     ';
      const expected = '----a-';

      expectObservable(e1.pipe(endWith(defaultEndValue))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not end with given value if source never emits and does not completes', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' -');
      const e1subs = '  ^';
      const expected = '-';

      expectObservable(e1.pipe(endWith(defaultEndValue))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should end with given value if source does not emit but does complete', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ---|   ');
      const e1subs = '  ^--!   ';
      const expected = '---(x|)';

      expectObservable(e1.pipe(endWith(defaultEndValue))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should emit given value and complete immediately if source is empty', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' |   ');
      const e1subs = '  (^!)';
      const expected = '(x|)';

      expectObservable(e1.pipe(endWith(defaultEndValue))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should end with given value and source both if source emits single value', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' (a|) ');
      const e1subs = '  (^!) ';
      const expected = '(ax|)';

      expectObservable(e1.pipe(endWith(defaultEndValue))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should end with given values when given more than one value', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -----a--|    ');
      const e1subs = '  ^-------!    ';
      const expected = '-----a--(yz|)';

      expectObservable(e1.pipe(endWith('y', 'z'))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should raise error and not end with given value if source raises error', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --#');
      const e1subs = '  ^-!';
      const expected = '--#';

      expectObservable(e1.pipe(endWith(defaultEndValue))).toBe(expected, defaultEndValue);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should raise error immediately and not end with given value if source throws error immediately', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' #   ');
      const e1subs = '  (^!)';
      const expected = '#   ';

      expectObservable(e1.pipe(endWith(defaultEndValue))).toBe(expected, defaultEndValue);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should allow unsubscribing explicitly and early', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ---a--b----c--d--|');
      const e1subs = '  ^--------!        ';
      const expected = '---a--b---        ';
      const unsub = '   ---------!        ';

      const result = e1.pipe(endWith('s'));

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ---a--b----c--d--|');
      const e1subs = '  ^--------!        ';
      const expected = '---a--b---        ';
      const unsub = '   ---------!        ';

      const result = e1.pipe(
        mergeMap((x: string) => of(x)),
        endWith('s'),
        mergeMap((x: string) => of(x))
      );

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should end with empty if given value is not specified', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -a-|');
      const e1subs = '  ^--!';
      const expected = '-a-|';

      expectObservable(e1.pipe(endWith())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should accept scheduler as last argument with single value', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--|   ');
      const e1subs = '  ^----!   ';
      const expected = '--a--(x|)';

      expectObservable(e1.pipe(endWith(defaultEndValue, testScheduler))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should accept scheduler as last argument with multiple value', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -----a--|    ');
      const e1subs = '  ^-------!    ';
      const expected = '-----a--(yz|)';

      expectObservable(e1.pipe(endWith('y', 'z', testScheduler))).toBe(expected);
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

    synchronousObservable.pipe(endWith(0), take(3)).subscribe(() => {
      /* noop */
    });

    expect(sideEffects).to.deep.equal([0, 1, 2]);
  });
});
