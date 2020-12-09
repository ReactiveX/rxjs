/** @prettier */
import { expect } from 'chai';
import { findIndex, mergeMap, delay } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { observableMatcher } from '../helpers/observableMatcher';
import { of, Observable } from 'rxjs';

/** @test {findIndex} */
describe('findIndex', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(observableMatcher);
  });

  function truePredicate(x: any) {
    return true;
  }

  it('should return matching element from source emits single element', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const values = { a: 3, b: 9, c: 15, d: 20 };
      const e1 = hot('  ---a--b--c--d---|', values);
      const e1subs = '  ^--------!       ';
      const expected = '---------(x|)    ';

      const predicate = function (x: number) {
        return x % 5 === 0;
      };

      expectObservable(e1.pipe(findIndex(predicate))).toBe(expected, { x: 2 });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not emit if source does not emit', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -');
      const e1subs = '  ^';
      const expected = '-';

      expectObservable(e1.pipe(findIndex(truePredicate))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should return negative index if source is empty to match predicate', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' |   ');
      const e1subs = '  (^!)';
      const expected = '(x|)';

      const result = e1.pipe(findIndex(truePredicate));

      expectObservable(result).toBe(expected, { x: -1 });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should return index of element from source emits single element', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--|', { a: 1 });
      const e1subs = '  ^-!   ';
      const expected = '--(x|)';

      const predicate = function (value: number) {
        return value === 1;
      };

      expectObservable(e1.pipe(findIndex(predicate))).toBe(expected, { x: 0 });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should return index of matching element from source emits multiple elements', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b---c-|', { b: 7 });
      const e1subs = '  ^----!      ';
      const expected = '-----(x|)   ';

      const predicate = function (value: number) {
        return value === 7;
      };

      expectObservable(e1.pipe(findIndex(predicate))).toBe(expected, { x: 1 });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should work with a custom thisArg', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const sourceValues = { b: 7 };
      const e1 = hot('  --a--b---c-|', sourceValues);
      const e1subs = '  ^----!      ';
      const expected = '-----(x|)   ';

      const predicate = function (this: typeof sourceValues, value: number) {
        return value === this.b;
      };
      const result = e1.pipe(findIndex(predicate, sourceValues));

      expectObservable(result).toBe(expected, { x: 1 });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should return negative index if element does not match with predicate', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--|   ');
      const e1subs = '  ^----------!   ';
      const expected = '-----------(x|)';

      const predicate = function (value: string) {
        return value === 'z';
      };

      expectObservable(e1.pipe(findIndex(predicate))).toBe(expected, { x: -1 });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should allow unsubscribing early and explicitly', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--|');
      const e1subs = '  ^-----!     ';
      const expected = '-------     ';
      const unsub = '   ------!     ';

      const result = e1.pipe(findIndex((value: string) => value === 'z'));

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--|');
      const e1subs = '  ^-----!     ';
      const expected = '-------     ';
      const unsub = '   ------!     ';

      const result = e1.pipe(
        mergeMap((x: string) => of(x)),
        findIndex((value: string) => value === 'z'),
        mergeMap((x: number) => of(x))
      );

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should unsubscribe when the predicate is matched', () => {
    testScheduler.run(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b---c-|');
      const e1subs = '  ^----!      ';
      const t = time('    --|       ');
      //                     --|
      const expected = '-------(x|) ';

      const result = e1.pipe(
        findIndex((value: string) => value === 'b'),
        delay(t)
      );

      expectObservable(result).toBe(expected, { x: 1 });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should raise if source raise error while element does not match with predicate', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--#');
      const e1subs = '  ^-------!';
      const expected = '--------#';

      const predicate = function (value: string) {
        return value === 'z';
      };

      expectObservable(e1.pipe(findIndex(predicate))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should raise error if predicate throws error', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--|');
      const e1subs = '  ^-!         ';
      const expected = '--#         ';

      const predicate = function (value: string) {
        throw 'error';
      };

      expectObservable(e1.pipe(findIndex(predicate))).toBe(expected);
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

    synchronousObservable.pipe(findIndex((value) => value === 2)).subscribe(() => {
      /* noop */
    });

    expect(sideEffects).to.deep.equal([0, 1, 2]);
  });
});
