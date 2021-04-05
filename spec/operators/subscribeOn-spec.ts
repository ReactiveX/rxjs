/** @prettier */
import { expect } from 'chai';
import { subscribeOn, mergeMap, take } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { of, Observable, queueScheduler } from 'rxjs';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {subscribeOn} */
describe('subscribeOn', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(observableMatcher);
  });

  it('should subscribe on specified scheduler', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--|');
      const expected = '--a--b--|';
      const sub = '     ^-------!';

      const result = e1.pipe(subscribeOn(testScheduler));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(sub);
    });
  });

  it('should start subscribe after specified delay', () => {
    testScheduler.run(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('    --a--b--|');
      const expected = '  -----b--|';
      const delay = time('---|     ');
      const sub = '       ---^----!';

      const result = e1.pipe(subscribeOn(testScheduler, delay));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(sub);
    });
  });

  it('should unsubscribe when source raises error', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--#');
      const expected = '--a--#';
      const sub = '     ^----!';

      const result = e1.pipe(subscribeOn(testScheduler));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(sub);
    });
  });

  it('should subscribe when source is empty', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ----|');
      const expected = '----|';
      const sub = '     ^---!';

      const result = e1.pipe(subscribeOn(testScheduler));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(sub);
    });
  });

  it('should subscribe when source does not complete', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ----');
      const expected = '----';
      const sub = '     ^---';

      const result = e1.pipe(subscribeOn(testScheduler));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(sub);
    });
  });

  it('should allow unsubscribing early and explicitly', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--|');
      const sub = '     ^---!    ';
      const expected = '--a--    ';
      const unsub = '   ----!    ';

      const result = e1.pipe(subscribeOn(testScheduler));

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(sub);
    });
  });

  it('should not break unsubscription chains when the result is unsubscribed explicitly', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--|');
      const sub = '     ^---!    ';
      const expected = '--a--    ';
      const unsub = '   ----!    ';

      const result = e1.pipe(
        mergeMap((x: string) => of(x)),
        subscribeOn(testScheduler),
        mergeMap((x: string) => of(x))
      );

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(sub);
    });
  });

  it('should properly support a delayTime of Infinity', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--|');
      const expected = '---------';

      const result = e1.pipe(subscribeOn(testScheduler, Infinity));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe([]);
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

    synchronousObservable.pipe(subscribeOn(queueScheduler), take(3)).subscribe(() => {
      /* noop */
    });

    expect(sideEffects).to.deep.equal([0, 1, 2]);
  });
});
