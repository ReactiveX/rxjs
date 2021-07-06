/** @prettier */
import { expect } from 'chai';
import { TestScheduler } from 'rxjs/testing';
import { onErrorResumeNext, take, finalize } from 'rxjs/operators';
import { concat, throwError, of, Observable } from 'rxjs';
import { asInteropObservable } from '../helpers/interop-helper';
import { observableMatcher } from '../helpers/observableMatcher';

describe('onErrorResumeNext', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(observableMatcher);
  });

  it('should continue observable sequence with next observable', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--#        ');
      const e1subs = '  ^-------!        ';
      const e2 = cold('         --c--d--|');
      const e2subs = '  --------^-------!';
      const expected = '--a--b----c--d--|';

      expectObservable(e1.pipe(onErrorResumeNext(e2))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should continue with hot observables', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--#        ');
      const e1subs = '  ^-------!        ';
      const e2 = hot('  -----x----c--d--|');
      const e2subs = '  --------^-------!';
      const expected = '--a--b----c--d--|';

      expectObservable(e1.pipe(onErrorResumeNext(e2))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should continue with array of multiple observables that throw errors', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--#                     ');
      const e1subs = '  ^-------!                     ';
      const e2 = [
        cold('                  --c--d--#             '),
        cold('                          --e--#        '),
        cold('                               --f--g--|'),
      ];
      const e2subs = [
        '               --------^-------!',
        '               ----------------^----!',
        '               ---------------------^-------!',
      ];
      const expected = '--a--b----c--d----e----f--g--|';

      expectObservable(e1.pipe(onErrorResumeNext(e2))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2[0].subscriptions).toBe(e2subs[0]);
      expectSubscriptions(e2[1].subscriptions).toBe(e2subs[1]);
      expectSubscriptions(e2[2].subscriptions).toBe(e2subs[2]);
    });
  });

  it('should continue with multiple observables that throw errors', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--#                     ');
      const e1subs = '  ^-------!                     ';
      const e2 = cold('         --c--d--#             ');
      const e2subs = '  --------^-------!             ';
      const e3 = cold('                 --e--#        ');
      const e3subs = '  ----------------^----!        ';
      const e4 = cold('                      --f--g--|');
      const e4subs = '  ---------------------^-------!';
      const expected = '--a--b----c--d----e----f--g--|';

      expectObservable(e1.pipe(onErrorResumeNext(e2, e3, e4))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
      expectSubscriptions(e3.subscriptions).toBe(e3subs);
      expectSubscriptions(e4.subscriptions).toBe(e4subs);
    });
  });

  it("should continue with multiple observables that don't throw error", () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--|                     ');
      const e1subs = '  ^-------!                     ';
      const e2 = cold('         --c--d--|             ');
      const e2subs = '  --------^-------!             ';
      const e3 = cold('                 --e--|        ');
      const e3subs = '  ----------------^----!        ';
      const e4 = cold('                      --f--g--|');
      const e4subs = '  ---------------------^-------!';
      const expected = '--a--b----c--d----e----f--g--|';

      expectObservable(e1.pipe(onErrorResumeNext(e2, e3, e4))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
      expectSubscriptions(e3.subscriptions).toBe(e3subs);
      expectSubscriptions(e4.subscriptions).toBe(e4subs);
    });
  });

  it('should continue after empty observable', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  |                     ');
      const e1subs = '  (^!)                  ';
      const e2 = cold(' --c--d--|             ');
      const e2subs = '  ^-------!             ';
      const e3 = cold('         --e--#        ');
      const e3subs = '  --------^----!        ';
      const e4 = cold('              --f--g--|');
      const e4subs = '  -------------^-------!';
      const expected = '--c--d----e----f--g--|';

      expectObservable(e1.pipe(onErrorResumeNext(e2, e3, e4))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
      expectSubscriptions(e3.subscriptions).toBe(e3subs);
      expectSubscriptions(e4.subscriptions).toBe(e4subs);
    });
  });

  it('should not complete with observable that does not complete', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--| ');
      const e1subs = '  ^-------! ';
      const e2 = cold('         --');
      const e2subs = '  --------^-';
      const expected = '--a--b----';

      expectObservable(e1.pipe(onErrorResumeNext(e2))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should not continue when source observable does not complete', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--');
      const e1subs = '  ^----';
      const e2 = cold('-b--c-');
      const e2subs: string[] = [];
      const expected = '--a--';

      expectObservable(e1.pipe(onErrorResumeNext(e2))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should complete observable when next observable throws', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--#        ');
      const e1subs = '  ^-------!        ';
      const e2 = cold('         --c--d--#');
      const e2subs = '  --------^-------!';
      const expected = '--a--b----c--d--|';

      expectObservable(e1.pipe(onErrorResumeNext(e2))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should stop listening to a synchronous observable when unsubscribed', () => {
    const sideEffects: number[] = [];
    const synchronousObservable = new Observable((subscriber) => {
      // This will check to see if the subscriber was closed on each loop
      // when the unsubscribe hits (from the `take`), it should be closed
      for (let i = 0; !subscriber.closed && i < 10; i++) {
        sideEffects.push(i);
        subscriber.next(i);
      }
    });

    throwError(() => new Error('Some error'))
      .pipe(onErrorResumeNext(synchronousObservable), take(3))
      .subscribe(() => {
        /* noop */
      });

    expect(sideEffects).to.deep.equal([0, 1, 2]);
  });

  it('should unsubscribe from an interop observable upon explicit unsubscription', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--#       ');
      const e1subs = '  ^-------!       ';
      const e2 = cold('         --c--d--');
      const e2subs = '  --------^---!   ';
      const unsub = '   ------------!   ';
      const expected = '--a--b----c--   ';

      // This test manipulates the observable to make it look like an interop
      // observable - an observable from a foreign library. Interop subscribers
      // are treated differently: they are wrapped in a safe subscriber. This
      // test ensures that unsubscriptions are chained all the way to the
      // interop subscriber.

      expectObservable(e1.pipe(onErrorResumeNext(asInteropObservable(e2))), unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should work with promise', (done) => {
    const expected = [1, 2];
    const source = concat(
      of(1),
      throwError(() => 'meh')
    );

    source.pipe(onErrorResumeNext(Promise.resolve(2))).subscribe(
      (x) => {
        expect(expected.shift()).to.equal(x);
      },
      () => {
        done(new Error('should not be called'));
      },
      () => {
        expect(expected).to.be.empty;
        done();
      }
    );
  });

  it('should skip invalid sources and move on', () => {
    const results: any[] = [];

    of(1)
      .pipe(onErrorResumeNext([2, 3, 4], { notValid: 'LOL' } as any, of(5, 6)))
      .subscribe({
        next: (value) => results.push(value),
        complete: () => results.push('complete'),
      });

    expect(results).to.deep.equal([1, 2, 3, 4, 5, 6, 'complete']);
  });

  it('should call finalize after each sync observable', () => {
    const results: any[] = [];

    of(1)
      .pipe(
        finalize(() => results.push('finalize 1')),
        onErrorResumeNext(
          of(2).pipe(finalize(() => results.push('finalize 2'))),
          of(3).pipe(finalize(() => results.push('finalize 3'))),
          of(4).pipe(finalize(() => results.push('finalize 4')))
        )
      )
      .subscribe({
        next: (value) => results.push(value),
        complete: () => results.push('complete'),
      });

    expect(results).to.deep.equal([1, 'finalize 1', 2, 'finalize 2', 3, 'finalize 3', 4, 'finalize 4', 'complete']);
  });
});
