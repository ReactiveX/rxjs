import { expect } from 'chai';
import { concat, defer, Observable, of, throwError, EMPTY, from } from 'rxjs';
import { catchError, map, mergeMap, takeWhile } from 'rxjs/operators';
import * as sinon from 'sinon';
import { createObservableInputs } from '../helpers/test-helper';
import { TestScheduler } from 'rxjs/testing';
import { observableMatcher } from '../helpers/observableMatcher';
import { asInteropObservable } from '../helpers/interop-helper';

declare function asDiagram(arg: string): Function;

/** @test {catch} */
describe('catchError operator', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(observableMatcher);
  });

  asDiagram('catch')('should catch error and replace with a cold Observable', () => {
    testScheduler.run(({ hot, cold, expectObservable }) => {
      const e1 = hot('  --a--b--#       ');
      const e2 = cold('         -1-2-3-|');
      const expected = '--a--b---1-2-3-|';

      const result = e1.pipe(catchError((err: any) => e2));

      expectObservable(result).toBe(expected);
    });
  });

  it('should catch error and replace it with Observable.of()', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--------|');
      const subs = '    ^-------!';
      const expected = '--a--b--(XYZ|)';

      const result = e1.pipe(
        map((n: string) => {
          if (n === 'c') {
            throw 'bad';
          }
          return n;
        }),
        catchError((err: any) => {
          return of('X', 'Y', 'Z');
        })
      );

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });

  it('should catch error and replace it with a cold Observable', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--#          ');
      const e1subs = '  ^-------!          ';
      const e2 = cold('         1-2-3-4-5-|');
      const e2subs = '  --------^---------!';
      const expected = '--a--b--1-2-3-4-5-|';

      const result = e1.pipe(catchError((err: any) => e2));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should allow unsubscribing explicitly and early', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --1-2-3-4-5-6---#');
      const e1subs = '  ^------!         ';
      const expected = '--1-2-3-         ';
      const unsub = '   -------!         ';

      const result = e1.pipe(
        catchError(() => {
          return of('X', 'Y', 'Z');
        })
      );

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not break unsubscription chain when unsubscribed explicitly', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --1-2-3-4-5-6---#');
      const e1subs = '  ^------!         ';
      const expected = '--1-2-3-         ';
      const unsub = '   -------!         ';

      const result = e1.pipe(
        mergeMap((x: any) => of(x)),
        catchError(() => {
          return of('X', 'Y', 'Z');
        }),
        mergeMap((x: any) => of(x))
      );

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should unsubscribe from a caught hot caught observable when unsubscribed explicitly', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -1-2-3-#          ');
      const e1subs = '  ^------!          ';
      const e2 = hot('  ---3-4-5-6-7-8-9-|');
      const e2subs = '  -------^----!     ';
      const expected = '-1-2-3-5-6-7-     ';
      const unsub = '   ------------!     ';

      const result = e1.pipe(catchError(() => e2));

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should unsubscribe from a caught cold caught observable when unsubscribed explicitly', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -1-2-3-#          ');
      const e1subs = '  ^------!          ';
      const e2 =  cold('       5-6-7-8-9-|');
      const e2subs = '  -------^----!     ';
      const expected = '-1-2-3-5-6-7-     ';
      const unsub = '   ------------!     ';

      const result = e1.pipe(catchError(() => e2));

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should unsubscribe from a caught cold caught interop observable when unsubscribed explicitly', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -1-2-3-#          ');
      const e1subs = '  ^------!          ';
      const e2 =  cold('       5-6-7-8-9-|');
      const e2subs = '  -------^----!     ';
      const expected = '-1-2-3-5-6-7-     ';
      const unsub = '   ------------!     ';

      // This test is the same as the previous test, but the observable is
      // manipulated to make it look like an interop observable - an observable
      // from a foreign library. Interop subscribers are treated differently:
      // they are wrapped in a safe subscriber. This test ensures that
      // unsubscriptions are chained all the way to the interop subscriber.

      const result = e1.pipe(catchError(() => asInteropObservable(e2)));

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should stop listening to a synchronous observable when unsubscribed', () => {
    const sideEffects: number[] = [];
    const synchronousObservable = concat(
      defer(() => {
        sideEffects.push(1);
        return of(1);
      }),
      defer(() => {
        sideEffects.push(2);
        return of(2);
      }),
      defer(() => {
        sideEffects.push(3);
        return of(3);
      })
    );

    throwError(new Error('Some error')).pipe(
      catchError(() => synchronousObservable),
      takeWhile((x) => x != 2) // unsubscribe at the second side-effect
    ).subscribe(() => { /* noop */ });

    expect(sideEffects).to.deep.equal([1, 2]);
  });

  it('should catch error and replace it with a hot Observable', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--#          ');
      const e1subs = '  ^-------!          ';
      const e2 = hot('  1-2-3-4-5-6-7-8-9-|');
      const e2subs = '  --------^---------!';
      const expected = '--a--b--5-6-7-8-9-|';

      const result = e1.pipe(catchError((err: any) => e2));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should catch and allow the cold observable to be repeated with the third ' +
  '(caught) argument', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 =  cold('--a--b--c--------|       ');
      const subs = [
        '               ^-------!                ',
        '              --------^-------!         ',
        '              ----------------^-------! '
      ];
      const expected = '--a--b----a--b----a--b--#';

      let retries = 0;
      const result = e1.pipe(
        map((n: any) => {
          if (n === 'c') {
            throw 'bad';
          }
          return n;
        }),
        catchError((err: any, caught: any) => {
          if (retries++ === 2) {
            throw 'done';
          }
          return caught;
        })
      );

      expectObservable(result).toBe(expected, undefined, 'done');
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });

  it('should catch and allow the hot observable to proceed with the third ' +
  '(caught) argument', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c----d---|');
      const subs = [
        '               ^-------!         ',
        '              --------^--------! '];
      const expected = '--a--b-------d---|';

      let retries = 0;
      const result = e1.pipe(
        map((n: any) => {
          if (n === 'c') {
            throw 'bad';
          }
          return n;
        }),
        catchError((err: any, caught: any) => {
          if (retries++ === 2) {
            throw 'done';
          }
          return caught;
        })
      );

      expectObservable(result).toBe(expected, undefined, 'done');
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });

  it('should catch and replace a Observable.throw() as the source', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' #');
      const subs = '    (^!)';
      const expected = '(abc|)';

      const result = e1.pipe(catchError((err: any) => of('a', 'b', 'c')));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });

  it('should mirror the source if it does not raise errors', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' --a--b--c--|');
      const subs = '    ^----------!';
      const expected = '--a--b--c--|';

      const result = e1.pipe(catchError((err: any) => of('x', 'y', 'z')));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });

  it('should complete if you return Observable.empty()', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--#');
      const e1subs = '  ^-------!';
      const e2 = cold('         |');
      const e2subs = '  --------(^!)';
      const expected = '--a--b--|';

      const result = e1.pipe(catchError(() => e2));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should raise error if you return Observable.throw()', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--#');
      const e1subs = '  ^-------!';
      const e2 = cold('         #');
      const e2subs = '  --------(^!)';
      const expected = '--a--b--#';

      const result = e1.pipe(catchError(() => e2));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should never terminate if you return NEVER', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--#');
      const e1subs = '  ^-------!';
      const e2 = cold('         -');
      const e2subs = '  --------^';
      const expected = '--a--b---';

      const result = e1.pipe(catchError(() => e2));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should pass the error as the first argument', (done: MochaDone) => {
    throwError('bad').pipe(
      catchError((err: any) => {
        expect(err).to.equal('bad');
        return EMPTY;
      })
    ).subscribe(() => {
    //noop
    }, (err: any) => {
      done(new Error('should not be called'));
    }, () => {
      done();
    });
  });

  it('should accept selector returns any ObservableInput', (done: MochaDone) => {
    const input$ = createObservableInputs(42);

    input$.pipe(
      mergeMap(input =>
        throwError('bad').pipe(catchError(err => input))
      )
    ).subscribe(x => {
      expect(x).to.be.equal(42);
    }, (err: any) => {
      done(new Error('should not be called'));
    }, () => {
      done();
    });
  });

  it('should catch errors throw from within the constructor', () => {
    // See https://github.com/ReactiveX/rxjs/issues/3740
    testScheduler.run(({ expectObservable }) => {
      const source = concat(
        new Observable<string>(o => {
          o.next('a');
          throw 'kaboom';
        }).pipe(
          catchError(_ => of('b'))
        ),
        of('c')
      );
      const expected = '(abc|)';
      expectObservable(source).toBe(expected);
    });
  });

  context('fromPromise', () => {
    type SetTimeout = (callback: (...args: any[]) => void, ms: number, ...args: any[]) => NodeJS.Timer;

    let trueSetTimeout: SetTimeout;
    let sandbox: sinon.SinonSandbox;
    let timers: sinon.SinonFakeTimers;

    beforeEach(() => {
      trueSetTimeout = global.setTimeout;
      sandbox = sinon.createSandbox();
      timers = sandbox.useFakeTimers();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should chain a throw from a promise using Observable.throw', (done: MochaDone) => {
      const subscribeSpy = sinon.spy();
      const errorSpy = sinon.spy();
      const thrownError = new Error('BROKEN THROW');
      const testError = new Error('BROKEN PROMISE');
      from(Promise.reject(testError)).pipe(
        catchError(err =>
          throwError(thrownError)
        )
      ).subscribe(subscribeSpy, errorSpy);

      trueSetTimeout(() => {
        try {
          timers.tick(1);
        } catch (e) {
          return done(new Error('This should not have thrown an error'));
        }
        expect(subscribeSpy).not.to.be.called;
        expect(errorSpy).to.have.been.called;
        expect(errorSpy).to.have.been.calledWith(thrownError);
        done();
      }, 0);
    });
  });

  // TODO(v8): see https://github.com/ReactiveX/rxjs/issues/5115
  // The re-implementation in version 8 should fix the problem in the
  // referenced issue. Closed subscribers should remain closed.
  /*
  it('issue #5115', (done: MochaDone) => {
    const source = new Observable<string>(observer => {
      observer.error(new Error('kaboom!'));
      observer.complete();
    });

    const sourceWithDelay = new Observable<string>(observer => {
      observer.next('delayed');
      observer.complete();
    }).pipe(delay(0));

    const values: string[] = [];
    source.pipe(
      catchError(err => sourceWithDelay)
    )
    .subscribe(
      value => values.push(value),
      err => done(err),
      () => {
        expect(values).to.deep.equal(['delayed']);
        done();
      }
    );
  });
  */
});
