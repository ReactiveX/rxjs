/** @prettier */
import { expect } from 'chai';
import { timeInterval, map, mergeMap, take } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { of, Observable } from 'rxjs';
import { TimeInterval } from 'rxjs/internal/operators/timeInterval';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {timeInterval} */
describe('timeInterval', () => {
  let rxTestScheduler: TestScheduler;

  beforeEach(() => {
    rxTestScheduler = new TestScheduler(observableMatcher);
  });

  it('should record the time interval between source elements', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^b-c-----d--e--|');
      const e1subs = '     ^--------------!';
      const expected = '   -w-x-----y--z--|';
      const expectedValue = { w: 1, x: 2, y: 6, z: 3 };

      const result = e1.pipe(
        timeInterval(rxTestScheduler),
        map((x) => x.interval)
      );

      expectObservable(result).toBe(expected, expectedValue);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should record interval if source emit elements', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^b--c----d---e--|');
      const e1subs = '     ^---------------!';
      const expected = '   -w--x----y---z--|';

      const expectedValue = {
        w: new TimeInterval('b', 1),
        x: new TimeInterval('c', 3),
        y: new TimeInterval('d', 5),
        z: new TimeInterval('e', 4),
      };

      expectObservable(e1.pipe(timeInterval(rxTestScheduler))).toBe(expected, expectedValue);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should completes without record interval if source does not emits', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ---------|');
      const e1subs = '  ^--------!';
      const expected = '---------|';

      expectObservable(e1.pipe(timeInterval(rxTestScheduler))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should complete immediately if source is empty', () => {
    rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' |   ');
      const e1subs = '  (^!)';
      const expected = '|   ';

      expectObservable(e1.pipe(timeInterval(rxTestScheduler))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should record interval then does not completes if source emits but not completes', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -a--b--');
      const e1subs = '  ^------';
      const expected = '-y--z--';

      const expectedValue = {
        y: new TimeInterval('a', 1),
        z: new TimeInterval('b', 3),
      };

      expectObservable(e1.pipe(timeInterval(rxTestScheduler))).toBe(expected, expectedValue);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should allow unsubscribing explicitly and early', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -a--b-----c---d---|');
      const unsub = '   -------!           ';
      const e1subs = '  ^------!           ';
      const expected = '-y--z---           ';

      const expectedValue = {
        y: new TimeInterval('a', 1),
        z: new TimeInterval('b', 3),
      };

      const result = e1.pipe(timeInterval(rxTestScheduler));

      expectObservable(result, unsub).toBe(expected, expectedValue);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -a--b-----c---d---|');
      const e1subs = '  ^------!           ';
      const expected = '-y--z---           ';
      const unsub = '   -------!           ';

      const expectedValue = {
        y: new TimeInterval('a', 1),
        z: new TimeInterval('b', 3),
      };

      const result = e1.pipe(
        mergeMap((x: string) => of(x)),
        timeInterval(rxTestScheduler),
        mergeMap((x) => of(x))
      );

      expectObservable(result, unsub).toBe(expected, expectedValue);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not completes if source never completes', () => {
    rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' -');
      const e1subs = '  ^';
      const expected = '-';

      expectObservable(e1.pipe(timeInterval(rxTestScheduler))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('raise error if source raises error', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ---#');
      const e1subs = '  ^--!';
      const expected = '---#';

      expectObservable(e1.pipe(timeInterval(rxTestScheduler))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should record interval then raise error if source raises error after emit', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -a--b--#');
      const e1subs = '  ^------!';
      const expected = '-y--z--#';

      const expectedValue = {
        y: new TimeInterval('a', 1),
        z: new TimeInterval('b', 3),
      };

      expectObservable(e1.pipe(timeInterval(rxTestScheduler))).toBe(expected, expectedValue);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should raise error if source immediately throws', () => {
    rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' #   ');
      const e1subs = '  (^!)';
      const expected = '#   ';

      expectObservable(e1.pipe(timeInterval(rxTestScheduler))).toBe(expected);
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

    synchronousObservable.pipe(timeInterval(), take(3)).subscribe(() => {
      /* noop */
    });

    expect(sideEffects).to.deep.equal([0, 1, 2]);
  });
});
