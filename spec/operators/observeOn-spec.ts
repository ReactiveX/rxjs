/** @prettier */
import { observeOn, mergeMap, take } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { expect } from 'chai';
import { of, Observable, queueScheduler } from 'rxjs';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {observeOn} */
describe('observeOn', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(observableMatcher);
  });

  it('should observe on specified scheduler', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--|');
      const e1subs = '  ^-------!';
      const expected = '--a--b--|';

      expectObservable(e1.pipe(observeOn(testScheduler))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should observe after specified delay', () => {
    testScheduler.run(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('    --a----b-|   ');
      const e1subs = '    ^--------!   ';
      const delay = time('  ---|       ');
      //                         ---|
      //                           ---|
      const expected = '  -----a----b-|';

      expectObservable(e1.pipe(observeOn(testScheduler, delay))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should observe when source raises error', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--#');
      const e1subs = '  ^----!';
      const expected = '--a--#';

      expectObservable(e1.pipe(observeOn(testScheduler))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should observe when source is empty', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -----|');
      const e1subs = '  ^----!';
      const expected = '-----|';

      expectObservable(e1.pipe(observeOn(testScheduler))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should observe when source does not complete', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -----');
      const e1subs = '  ^----';
      const expected = '-----';

      expectObservable(e1.pipe(observeOn(testScheduler))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should allow unsubscribing early and explicitly', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--|');
      const e1subs = '  ^---!    ';
      const expected = '--a--    ';
      const unsub = '   ----!    ';

      const result = e1.pipe(observeOn(testScheduler));

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not break unsubscription chains when the result is unsubscribed explicitly', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--|');
      const e1subs = '  ^---!    ';
      const expected = '--a--    ';
      const unsub = '   ----!    ';

      const result = e1.pipe(
        mergeMap((x) => of(x)),
        observeOn(testScheduler),
        mergeMap((x) => of(x))
      );

      expectObservable(result, unsub).toBe(expected);
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

    synchronousObservable.pipe(observeOn(queueScheduler), take(3)).subscribe(() => {
      /* noop */
    });

    expect(sideEffects).to.deep.equal([0, 1, 2]);
  });
});
