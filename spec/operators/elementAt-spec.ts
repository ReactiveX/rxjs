/** @prettier */
import { expect } from 'chai';
import { elementAt, mergeMap } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { ArgumentOutOfRangeError, of, range, Observable } from 'rxjs';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {elementAt} */
describe('elementAt', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(observableMatcher);
  });

  it('should return next to last element by zero-based index', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c-d---|');
      const e1subs = '  ^-------!      ';
      const expected = '--------(c|)   ';

      expectObservable(e1.pipe(elementAt(2))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should return first element by zero-based index', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--|');
      const e1subs = '  ^-!';
      const expected = '--(a|)';

      expectObservable(e1.pipe(elementAt(0))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should allow undefined as a default value', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -----a--a---a-|   ');
      const e1subs = '  ^-------------!   ';
      const expected = '--------------(U|)';

      expectObservable(e1.pipe(elementAt(100, undefined))).toBe(expected, { U: undefined });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should return non-first element by zero-based index', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--d--e--f--|');
      const e1subs = '  ^----------!         ';
      const expected = '-----------(d|)      ';

      expectObservable(e1.pipe(elementAt(3))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should return last element by zero-based index', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--|');
      const e1subs = '  ^-------!   ';
      const expected = '--------(c|)';

      expectObservable(e1.pipe(elementAt(2))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should raise error if e1 is Empty Observable', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' |   ');
      const e1subs = '  (^!)';
      const expected = '#   ';

      expectObservable(e1.pipe(elementAt(0))).toBe(expected, undefined, new ArgumentOutOfRangeError());
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should raise error if source throws', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' #   ');
      const e1subs = '  (^!)';
      const expected = '#   ';

      expectObservable(e1.pipe(elementAt(0))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not complete if source never completes', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' -');
      const expected = '-';
      const e1subs = '  ^';

      expectObservable(e1.pipe(elementAt(0))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should allow unsubscribing early and explicitly', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--|');
      const e1subs = '  ^-----!     ';
      const expected = '-------     ';
      const unsub = '   ------!     ';

      const result = e1.pipe(elementAt(2));

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not break unsubscription chains when result Observable is unsubscribed', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--|');
      const e1subs = '  ^-----!     ';
      const expected = '-------     ';
      const unsub = '   ------!     ';

      const result = e1.pipe(
        mergeMap((x: any) => of(x)),
        elementAt(2),
        mergeMap((x: any) => of(x))
      );

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should throw if index is smaller than zero', () => {
    expect(() => {
      range(0, 10).pipe(elementAt(-1));
    }).to.throw(ArgumentOutOfRangeError);
  });

  it('should raise error if index is out of range but does not have default value', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--|');
      const e1subs = '  ^----!';
      const expected = '-----#';

      expectObservable(e1.pipe(elementAt(3))).toBe(expected, null, new ArgumentOutOfRangeError());
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should return default value if index is out of range', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--|   ');
      const e1subs = '  ^----!   ';
      const expected = '-----(x|)';
      const defaultValue = '42';

      expectObservable(e1.pipe(elementAt(3, defaultValue))).toBe(expected, { x: defaultValue });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should stop listening to a synchronous observable when unsubscribed', () => {
    const sideEffects: number[] = [];
    const synchronousObservable = new Observable<number>((subscriber) => {
      // This will check to see if the subscriber was closed on each loop
      // when the unsubscribe hits, it should be closed
      for (let i = 0; !subscriber.closed && i < 10; i++) {
        sideEffects.push(i);
        subscriber.next(i);
      }
    });

    synchronousObservable.pipe(elementAt(2)).subscribe(() => {
      /* noop */
    });

    expect(sideEffects).to.deep.equal([0, 1, 2]);
  });
});
