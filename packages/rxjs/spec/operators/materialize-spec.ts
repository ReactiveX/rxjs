import { expect } from 'chai';
import { materialize, map, mergeMap, take } from 'rxjs/operators';
import { of, Observable } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { observableMatcher } from '../helpers/observableMatcher';
import { COMPLETE_NOTIFICATION, errorNotification, nextNotification } from '@rxjs/observable';

/** @test {materialize} */
describe('materialize', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(observableMatcher);
  });

  it('should materialize an Observable', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --x--y--z--|   ');
      const e1subs = '  ^----------!   ';
      const expected = '--a--b--c--(d|)';
      const values = { a: '{x}', b: '{y}', c: '{z}', d: '|' };

      const result = e1.pipe(
        materialize(),
        map((x: any) => {
          if (x.kind === 'C') {
            return '|';
          } else {
            return '{' + x.value + '}';
          }
        })
      );

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should materialize a happy stream', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--|   ');
      const e1subs = '  ^----------!   ';
      const expected = '--w--x--y--(z|)';

      const expectedValue = {
        w: nextNotification('a'),
        x: nextNotification('b'),
        y: nextNotification('c'),
        z: COMPLETE_NOTIFICATION,
      };

      expectObservable(e1.pipe(materialize())).toBe(expected, expectedValue);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should materialize a sad stream', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--#   ');
      const e1subs = '  ^----------!   ';
      const expected = '--w--x--y--(z|)';

      const expectedValue = {
        w: nextNotification('a'),
        x: nextNotification('b'),
        y: nextNotification('c'),
        z: errorNotification('error'),
      };

      expectObservable(e1.pipe(materialize())).toBe(expected, expectedValue);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should allow unsubscribing explicitly and early', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--|');
      const e1subs = '  ^-----!     ';
      const expected = '--w--x-     ';
      const unsub = '   ------!     ';

      const expectedValue = {
        w: nextNotification('a'),
        x: nextNotification('b'),
      };

      expectObservable(e1.pipe(materialize()), unsub).toBe(expected, expectedValue);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--|');
      const e1subs = '  ^-----!     ';
      const expected = '--w--x-     ';
      const unsub = '   ------!     ';

      const expectedValue = {
        w: nextNotification('a'),
        x: nextNotification('b'),
      };

      const result = e1.pipe(
        mergeMap((x: string) => of(x)),
        materialize(),
        mergeMap((x) => of(x))
      );

      expectObservable(result, unsub).toBe(expected, expectedValue);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should materialize stream that does not complete', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -');
      const e1subs = '  ^';
      const expected = '-';

      expectObservable(e1.pipe(materialize())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should materialize stream that does not emit', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ----|   ');
      const e1subs = '  ^---!   ';
      const expected = '----(x|)';

      expectObservable(e1.pipe(materialize())).toBe(expected, { x: COMPLETE_NOTIFICATION });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should materialize empty stream', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' |   ');
      const e1subs = '  (^!)';
      const expected = '(x|)';

      expectObservable(e1.pipe(materialize())).toBe(expected, { x: COMPLETE_NOTIFICATION });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should materialize stream that throws', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' #   ');
      const e1subs = '  (^!)';
      const expected = '(x|)';

      expectObservable(e1.pipe(materialize())).toBe(expected, { x: errorNotification('error') });
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

    synchronousObservable.pipe(materialize(), take(3)).subscribe(() => {
      /* noop */
    });

    expect(sideEffects).to.deep.equal([0, 1, 2]);
  });
});
