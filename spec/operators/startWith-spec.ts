/** @prettier */
import { expect } from 'chai';
import { startWith, mergeMap, take } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { of, Observable } from 'rxjs';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {startWith} */
describe('startWith', () => {
  const defaultStartValue = 'x';
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(observableMatcher);
  });

  it('should prepend to a cold Observable', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' ---a--b--c--|');
      const e1subs = '  ^-----------!';
      const expected = 's--a--b--c--|';

      const result = e1.pipe(startWith('s'));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should start an observable with given value', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--|');
      const e1subs = '  ^----!';
      const expected = 'x-a--|';

      const result = e1.pipe(startWith(defaultStartValue));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should start with given value and does not completes if source does not completes', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ----a-');
      const e1subs = '  ^-----';
      const expected = 'x---a-';

      const result = e1.pipe(startWith(defaultStartValue));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should start with given value and does not completes if source never emits', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' - ');
      const e1subs = '  ^ ';
      const expected = 'x-';

      const result = e1.pipe(startWith(defaultStartValue));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should start with given value and completes if source does not emits', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ---|');
      const e1subs = '  ^--!';
      const expected = 'x--|';

      const result = e1.pipe(startWith(defaultStartValue));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should start with given value and complete immediately if source is empty', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' |   ');
      const e1subs = '  (^!)';
      const expected = '(x|)';

      const result = e1.pipe(startWith(defaultStartValue));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should start with given value and source both if source emits single value', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' (a|)');
      const e1subs = '  (^!)';
      const expected = '(xa|)';

      const result = e1.pipe(startWith(defaultStartValue));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should start with given values when given value is more than one', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -----a--|');
      const e1subs = '  ^-------!';
      const expected = '(yz)-a--|';

      const result = e1.pipe(startWith('y', 'z'));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should start with given value and raises error if source raises error', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --#');
      const e1subs = '  ^-!';
      const expected = 'x-#';

      const result = e1.pipe(startWith(defaultStartValue));

      expectObservable(result).toBe(expected, defaultStartValue);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should start with given value and raises error immediately if source throws error', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' #   ');
      const e1subs = '  (^!)';
      const expected = '(x#)';

      const result = e1.pipe(startWith(defaultStartValue));

      expectObservable(result).toBe(expected, defaultStartValue);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should allow unsubscribing explicitly and early', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ---a--b----c--d--|');
      const unsub = '   ---------!        ';
      const e1subs = '  ^--------!        ';
      const expected = 's--a--b---        ';
      const values = { s: 's', a: 'a', b: 'b' };

      const result = e1.pipe(startWith('s', testScheduler));

      expectObservable(result, unsub).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ---a--b----c--d--|');
      const e1subs = '  ^--------!        ';
      const expected = 's--a--b---        ';
      const unsub = '   ---------!        ';
      const values = { s: 's', a: 'a', b: 'b' };

      const result = e1.pipe(
        mergeMap((x: string) => of(x)),
        startWith('s', testScheduler),
        mergeMap((x: string) => of(x))
      );

      expectObservable(result, unsub).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should start with empty if given value is not specified', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -a-|');
      const e1subs = '  ^--!';
      const expected = '-a-|';

      const result = e1.pipe(startWith(testScheduler));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should accept scheduler as last argument with single value', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--|');
      const e1subs = '  ^----!';
      const expected = 'x-a--|';

      const result = e1.pipe(startWith(defaultStartValue, testScheduler));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should accept scheduler as last argument with multiple value', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -----a--|');
      const e1subs = '  ^-------!';
      const expected = '(yz)-a--|';

      const result = e1.pipe(startWith('y', 'z', testScheduler));

      expectObservable(result).toBe(expected);
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

    synchronousObservable.pipe(startWith(-1), take(4)).subscribe(() => {
      /* noop */
    });

    expect(sideEffects).to.deep.equal([0, 1, 2]);
  });
});
