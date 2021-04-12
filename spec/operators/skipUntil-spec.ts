/** @prettier */
import { expect } from 'chai';
import { concat, defer, of, Subject, Observable } from 'rxjs';
import { skipUntil, mergeMap, take } from 'rxjs/operators';
import { asInteropObservable } from '../helpers/interop-helper';
import { TestScheduler } from 'rxjs/testing';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {skipUntil} */
describe('skipUntil', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(observableMatcher);
  });

  it('should skip values until another observable notifies', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('    --a--b--c--d--e----|');
      const e1subs = '    ^------------------!';
      const skip = hot('  ---------x------|   ');
      const skipSubs = '  ^--------!          ';
      const expected = '  -----------d--e----|';

      expectObservable(e1.pipe(skipUntil(skip))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(skip.subscriptions).toBe(skipSubs);
    });
  });

  it('should emit elements after notifier emits', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('    --a--b--c--d--e--|');
      const e1subs = '    ^----------------!';
      const skip = hot('  ---------x----|   ');
      const skipSubs = '  ^--------!        ';
      const expected = '  -----------d--e--|';

      expectObservable(e1.pipe(skipUntil(skip))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(skip.subscriptions).toBe(skipSubs);
    });
  });

  it('should emit elements after a synchronous notifier emits', () => {
    const values: string[] = [];

    of('a', 'b')
      .pipe(skipUntil(of('x')))
      .subscribe({
        next(value) {
          values.push(value);
        },
        error(err) {
          throw err;
        },
        complete() {
          expect(values).to.deep.equal(['a', 'b']);
        },
      });
  });

  it('should raise an error if notifier throws and source is hot', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--d--e--|');
      const e1subs = '  ^------------!    ';
      const skip = hot('-------------#    ');
      const skipSubs = '^------------!    ';
      const expected = '-------------#    ';

      expectObservable(e1.pipe(skipUntil(skip))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(skip.subscriptions).toBe(skipSubs);
    });
  });

  it('should skip all elements when notifier does not emit and completes early', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--d--e--|');
      const e1subs = '  ^----------------!';
      const skip = hot('------------|     ');
      const skipSubs = '^-----------!     ';
      const expected = '-----------------|';

      expectObservable(e1.pipe(skipUntil(skip))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(skip.subscriptions).toBe(skipSubs);
    });
  });

  it('should allow unsubscribing explicitly and early', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('    --a--b--c--d--e----|');
      const unsub = '     ---------!          ';
      const e1subs = '    ^--------!          ';
      const skip = hot('  -------------x--|   ');
      const skipSubs = '  ^--------!          ';
      const expected = '  ----------          ';

      expectObservable(e1.pipe(skipUntil(skip)), unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(skip.subscriptions).toBe(skipSubs);
    });
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('    --a--b--c--d--e----|');
      const e1subs = '    ^--------!          ';
      const skip = hot('  -------------x--|   ');
      const skipSubs = '  ^--------!          ';
      const expected = '  ----------          ';
      const unsub = '     ---------!          ';

      const result = e1.pipe(
        mergeMap((x) => of(x)),
        skipUntil(skip),
        mergeMap((x) => of(x))
      );

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(skip.subscriptions).toBe(skipSubs);
    });
  });

  it('should not break unsubscription chains with interop inners when result is unsubscribed explicitly', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('    --a--b--c--d--e----|');
      const e1subs = '    ^--------!          ';
      const skip = hot('  -------------x--|   ');
      const skipSubs = '  ^--------!          ';
      const expected = '  ----------          ';
      const unsub = '     ---------!          ';

      // This test is the same as the previous test, but the observable is
      // manipulated to make it look like an interop observable - an observable
      // from a foreign library. Interop subscribers are treated differently:
      // they are wrapped in a safe subscriber. This test ensures that
      // unsubscriptions are chained all the way to the interop subscriber.

      const result = e1.pipe(
        mergeMap((x) => of(x)),
        skipUntil(asInteropObservable(skip)),
        mergeMap((x) => of(x))
      );

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(skip.subscriptions).toBe(skipSubs);
    });
  });

  it('should skip all elements when notifier is empty', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('   --a--b--c--d--e--|');
      const e1subs = '   ^----------------!';
      const skip = cold('|                 ');
      const skipSubs = ' (^!)              ';
      const expected = ' -----------------|';

      expectObservable(e1.pipe(skipUntil(skip))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(skip.subscriptions).toBe(skipSubs);
    });
  });

  it('should keep subscription to source, to wait for its eventual completion', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ------------------------------|');
      const e1subs = '  ^-----------------------------!';
      const skip = hot('-------|                       ');
      const skipSubs = '^------!                       ';
      const expected = '------------------------------|';

      expectObservable(e1.pipe(skipUntil(skip))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(skip.subscriptions).toBe(skipSubs);
    });
  });

  it('should not complete if hot source observable does not complete', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -                ');
      const e1subs = '  ^                ';
      const skip = hot('-------------x--|');
      const skipSubs = '^------------!   ';
      const expected = '-                ';

      expectObservable(e1.pipe(skipUntil(skip))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(skip.subscriptions).toBe(skipSubs);
    });
  });

  it('should not complete if cold source observable never completes', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' -                ');
      const e1subs = '  ^                ';
      const skip = hot('-------------x--|');
      const skipSubs = '^------------!   ';
      const expected = '-                ';

      expectObservable(e1.pipe(skipUntil(skip))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(skip.subscriptions).toBe(skipSubs);
    });
  });

  it('should raise error if cold source is never and notifier errors', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' -             ');
      const e1subs = '  ^------------!';
      const skip = hot('-------------#');
      const skipSubs = '^------------!';
      const expected = '-------------#';

      expectObservable(e1.pipe(skipUntil(skip))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(skip.subscriptions).toBe(skipSubs);
    });
  });

  it('should skip all elements and complete if notifier is cold never', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('   --a--b--c--d--e--|');
      const e1subs = '   ^----------------!';
      const skip = cold('-                 ');
      const skipSubs = ' ^----------------!';
      const expected = ' -----------------|';

      expectObservable(e1.pipe(skipUntil(skip))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(skip.subscriptions).toBe(skipSubs);
    });
  });

  it('should skip all elements and complete if notifier is a hot never', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--d--e--|');
      const e1subs = '  ^----------------!';
      const skip = hot('-                 ');
      const skipSubs = '^----------------!';
      const expected = '-----------------|';

      expectObservable(e1.pipe(skipUntil(skip))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(skip.subscriptions).toBe(skipSubs);
    });
  });

  it('should skip all elements and complete, even if notifier would not complete until later', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ^-a--b--c--d--e--|       ');
      const e1subs = '  ^----------------!       ';
      const skip = hot('^-----------------------|');
      const skipSubs = '^----------------!       ';
      const expected = '-----------------|       ';

      expectObservable(e1.pipe(skipUntil(skip))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(skip.subscriptions).toBe(skipSubs);
    });
  });

  it('should not complete if source does not complete if notifier completes without emission', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -              ');
      const e1subs = '  ^              ';
      const skip = hot('--------------|');
      const skipSubs = '^-------------!';
      const expected = '-              ';

      expectObservable(e1.pipe(skipUntil(skip))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(skip.subscriptions).toBe(skipSubs);
    });
  });

  it('should not complete if source and notifier are both hot never', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -');
      const e1subs = '  ^';
      const skip = hot('-');
      const skipSubs = '^';
      const expected = '-';

      expectObservable(e1.pipe(skipUntil(skip))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(skip.subscriptions).toBe(skipSubs);
    });
  });

  it('should skip skip all elements if notifier is unsubscribed explicitly before the notifier emits', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--d--e--|');
      const e1subs = [
        '               ^----------------!',
        '               ^----------------!', // for the explicit subscribe some lines below
      ];
      const skip = new Subject<string>();
      const expected = '-----------------|';

      e1.subscribe((x: string) => {
        if (x === 'd' && !skip.closed) {
          skip.next('x');
        }

        skip.unsubscribe();
      });

      expectObservable(e1.pipe(skipUntil(skip))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should unsubscribe the notifier after its first nexted value', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('  -^-o---o---o---o---o---o---|');
      const notifier = hot('-^--------n--n--n--n--n--n-|');
      const nSubs = '        ^--------!                 ';
      const expected = '    -^---------o---o---o---o---|';
      const result = source.pipe(skipUntil(notifier));

      expectObservable(result).toBe(expected);
      expectSubscriptions(notifier.subscriptions).toBe(nSubs);
    });
  });

  it('should stop listening to a synchronous notifier after its first nexted value', () => {
    const sideEffects: number[] = [];
    const synchronousNotifer = concat(
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
    of(null)
      .pipe(skipUntil(synchronousNotifer))
      .subscribe(() => {
        /* noop */
      });
    expect(sideEffects).to.deep.equal([1]);
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

    synchronousObservable.pipe(skipUntil(of(0)), take(3)).subscribe(() => {
      /* noop */
    });

    expect(sideEffects).to.deep.equal([0, 1, 2]);
  });
});
