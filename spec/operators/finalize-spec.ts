/** @prettier */
import { expect } from 'chai';
import { finalize, map, share, take } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { observableMatcher } from '../helpers/observableMatcher';
import { of, timer, interval, NEVER, Observable, noop } from 'rxjs';
import { asInteropObservable } from '../helpers/interop-helper';

/** @test {finalize} */
describe('finalize', () => {
  it('should call finalize after complete', (done) => {
    let completed = false;
    of(1, 2, 3)
      .pipe(
        finalize(() => {
          expect(completed).to.be.true;
          done();
        })
      )
      .subscribe(null, null, () => {
        completed = true;
      });
  });

  it('should call finalize after error', (done) => {
    let thrown = false;
    of(1, 2, 3)
      .pipe(
        map(function (x) {
          if (x === 3) {
            throw x;
          }
          return x;
        }),
        finalize(() => {
          expect(thrown).to.be.true;
          done();
        })
      )
      .subscribe(null, () => {
        thrown = true;
      });
  });

  it('should call finalize upon disposal', (done) => {
    let disposed = false;
    const subscription = timer(100)
      .pipe(
        finalize(() => {
          expect(disposed).to.be.true;
          done();
        })
      )
      .subscribe();
    disposed = true;
    subscription.unsubscribe();
  });

  it('should call finalize when synchronously subscribing to and unsubscribing from a shared Observable', (done) => {
    interval(50).pipe(finalize(done), share()).subscribe().unsubscribe();
  });

  it('should call two finalize instances in succession on a shared Observable', (done) => {
    let invoked = 0;
    function checkFinally() {
      invoked += 1;
      if (invoked === 2) {
        done();
      }
    }

    of(1, 2, 3).pipe(finalize(checkFinally), finalize(checkFinally), share()).subscribe();
  });

  it('should handle empty', () => {
    const testScheduler = new TestScheduler(observableMatcher);
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      let executed = false;
      const e1 = hot('  |   ');
      const e1subs = '  (^!)';
      const expected = '|   ';

      const result = e1.pipe(finalize(() => (executed = true)));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);

      // manually flush so `finalize()` has chance to execute before the test is over.
      testScheduler.flush();
      expect(executed).to.be.true;
    });
  });

  it('should handle never', () => {
    const testScheduler = new TestScheduler(observableMatcher);
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      let executed = false;
      const e1 = hot('  -');
      const e1subs = '  ^';
      const expected = '-';

      const result = e1.pipe(finalize(() => (executed = true)));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);

      // manually flush so `finalize()` has chance to execute before the test is over.
      testScheduler.flush();
      expect(executed).to.be.false;
    });
  });

  it('should handle throw', () => {
    const testScheduler = new TestScheduler(observableMatcher);
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      let executed = false;
      const e1 = hot('  #   ');
      const e1subs = '  (^!)';
      const expected = '#   ';

      const result = e1.pipe(finalize(() => (executed = true)));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);

      // manually flush so `finalize()` has chance to execute before the test is over.
      testScheduler.flush();
      expect(executed).to.be.true;
    });
  });

  it('should handle basic hot observable', () => {
    const testScheduler = new TestScheduler(observableMatcher);
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      let executed = false;
      const e1 = hot('  --a--b--c--|');
      const e1subs = '  ^----------!';
      const expected = '--a--b--c--|';

      const result = e1.pipe(finalize(() => (executed = true)));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);

      // manually flush so `finalize()` has chance to execute before the test is over.
      testScheduler.flush();
      expect(executed).to.be.true;
    });
  });

  it('should handle basic cold observable', () => {
    const testScheduler = new TestScheduler(observableMatcher);
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      let executed = false;
      const e1 = cold(' --a--b--c--|');
      const e1subs = '  ^----------!';
      const expected = '--a--b--c--|';

      const result = e1.pipe(finalize(() => (executed = true)));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);

      // manually flush so `finalize()` has chance to execute before the test is over.
      testScheduler.flush();
      expect(executed).to.be.true;
    });
  });

  it('should handle basic error', () => {
    const testScheduler = new TestScheduler(observableMatcher);
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      let executed = false;
      const e1 = hot('  --a--b--c--#');
      const e1subs = '  ^----------!';
      const expected = '--a--b--c--#';

      const result = e1.pipe(finalize(() => (executed = true)));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);

      // manually flush so `finalize()` has chance to execute before the test is over.
      testScheduler.flush();
      expect(executed).to.be.true;
    });
  });

  it('should handle unsubscription', () => {
    const testScheduler = new TestScheduler(observableMatcher);
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      let executed = false;
      const e1 = hot('  --a--b--c--|');
      const e1subs = '  ^-----!     ';
      const expected = '--a--b-';
      const unsub = '   ------!';

      const result = e1.pipe(finalize(() => (executed = true)));

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);

      // manually flush so `finalize()` has chance to execute before the test is over.
      testScheduler.flush();
      expect(executed).to.be.true;
    });
  });

  it('should handle interop source observables', () => {
    // https://github.com/ReactiveX/rxjs/issues/5237
    let finalized = false;
    const subscription = asInteropObservable(NEVER)
      .pipe(finalize(() => (finalized = true)))
      .subscribe();
    subscription.unsubscribe();
    expect(finalized).to.be.true;
  });

  it('should finalize sources before sinks', () => {
    const finalized: string[] = [];
    of(42)
      .pipe(
        finalize(() => finalized.push('source')),
        finalize(() => finalized.push('sink'))
      )
      .subscribe();
    expect(finalized).to.deep.equal(['source', 'sink']);
  });

  it('should finalize after the teardown', () => {
    const order: string[] = [];
    const source = new Observable<void>(() => {
      return () => order.push('teardown');
    });
    const subscription = source.pipe(finalize(() => order.push('finalize'))).subscribe();
    subscription.unsubscribe();
    expect(order).to.deep.equal(['teardown', 'finalize']);
  });

  it('should finalize after the teardown with synchronous completion', () => {
    const order: string[] = [];
    const source = new Observable<void>((subscriber) => {
      subscriber.complete();
      return () => order.push('teardown');
    });
    source.pipe(finalize(() => order.push('finalize'))).subscribe();
    expect(order).to.deep.equal(['teardown', 'finalize']);
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

    synchronousObservable
      .pipe(
        finalize(() => {
          /* noop */
        }),
        take(3)
      )
      .subscribe(() => {
        /* noop */
      });

    expect(sideEffects).to.deep.equal([0, 1, 2]);
  });

  it('should execute finalize even with a sync thrown error', () => {
    let called = false;
    const badObservable = new Observable(() => {
      throw new Error('bad');
    }).pipe(
      finalize(() => {
        called = true;
      })
    );

    badObservable.subscribe({
      error: noop,
    });

    expect(called).to.be.true;
  });

  it('should execute finalize in order even with a sync error', () => {
    const results: any[] = [];
    const badObservable = new Observable((subscriber) => {
      subscriber.error(new Error('bad'));
    }).pipe(
      finalize(() => {
        results.push(1);
      }),
      finalize(() => {
        results.push(2);
      })
    );

    badObservable.subscribe({
      error: noop,
    });

    expect(results).to.deep.equal([1, 2]);
  });

  it('should execute finalize in order even with a sync thrown error', () => {
    const results: any[] = [];
    const badObservable = new Observable(() => {
      throw new Error('bad');
    }).pipe(
      finalize(() => {
        results.push(1);
      }),
      finalize(() => {
        results.push(2);
      })
    );

    badObservable.subscribe({
      error: noop,
    });
    expect(results).to.deep.equal([1, 2]);
  });

  it('should finalize in the proper order', () => {
    const results: any[] = [];
    of(1)
      .pipe(
        finalize(() => results.push(1)),
        finalize(() => results.push(2)),
        finalize(() => results.push(3)),
        finalize(() => results.push(4))
      )
      .subscribe();

    expect(results).to.deep.equal([1, 2, 3, 4]);
  });
});
