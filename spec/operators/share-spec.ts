/** @prettier */
import { expect } from 'chai';
import {
  share,
  retry,
  mergeMapTo,
  mergeMap,
  tap,
  repeat,
  take,
  takeUntil,
  takeWhile,
  map,
  startWith,
  withLatestFrom,
} from 'rxjs/operators';
import { Observable, EMPTY, NEVER, of, Subject, defer } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { observableMatcher } from '../helpers/observableMatcher';
import sinon = require('sinon');

/** @test {share} */
describe('share', () => {
  let rxTest: TestScheduler;

  beforeEach(() => {
    rxTest = new TestScheduler(observableMatcher);
  });

  describe('share()', () => {
    it('should mirror a simple source Observable', () => {
      rxTest.run(({ cold, expectObservable, expectSubscriptions }) => {
        const source = cold('--1-2---3-4--5-|');
        const sourceSubs = ' ^--------------!';
        const expected = '   --1-2---3-4--5-|';

        const shared = source.pipe(share());

        expectObservable(shared).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      });
    });

    it('should share a single subscription', () => {
      let subscriptionCount = 0;
      const obs = new Observable<never>(() => {
        subscriptionCount++;
      });

      const source = obs.pipe(share());

      expect(subscriptionCount).to.equal(0);

      source.subscribe();
      source.subscribe();

      expect(subscriptionCount).to.equal(1);
    });

    it('should not change the output of the observable when error', () => {
      rxTest.run(({ hot, expectObservable, expectSubscriptions }) => {
        const e1 = hot('---a--^--b--c--d--e--#');
        const e1subs = '      ^--------------!';
        const expected = '    ---b--c--d--e--#';

        expectObservable(e1.pipe(share())).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
      });
    });

    it('should not change the output of the observable when successful with cold observable', () => {
      rxTest.run(({ cold, expectObservable, expectSubscriptions }) => {
        const e1 = cold(' ---a--b--c--d--e--|');
        const e1subs = '  ^-----------------!';
        const expected = '---a--b--c--d--e--|';

        expectObservable(e1.pipe(share())).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
      });
    });

    it('should not change the output of the observable when error with cold observable', () => {
      rxTest.run(({ cold, expectObservable, expectSubscriptions }) => {
        const e1 = cold(' ---a--b--c--d--e--#');
        const e1subs = '  ^-----------------!';
        const expected = '---a--b--c--d--e--#';

        expectObservable(e1.pipe(share())).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
      });
    });

    it('should retry just fine', () => {
      rxTest.run(({ cold, expectObservable, expectSubscriptions }) => {
        const e1 = cold(' ---a--b--c--d--e--#                  ');
        // prettier-ignore
        const e1subs = [
          '               ^-----------------!                  ', 
          '               ------------------^-----------------!'
        ];
        const expected = '---a--b--c--d--e-----a--b--c--d--e--#';

        expectObservable(e1.pipe(share(), retry(1))).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
      });
    });

    it('should share the same values to multiple observers', () => {
      rxTest.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
        const source = cold('    -1-2-3----4-|');
        const sourceSubs = '     ^-----------!';
        const subscriber1 = hot('a|           ');
        const expected1 = '      -1-2-3----4-|';
        const subscriber2 = hot('----b|       ');
        const expected2 = '      -----3----4-|';
        const subscriber3 = hot('--------c|   ');
        const expected3 = '      ----------4-|';

        const shared = source.pipe(share());

        expectObservable(subscriber1.pipe(mergeMapTo(shared))).toBe(expected1);
        expectObservable(subscriber2.pipe(mergeMapTo(shared))).toBe(expected2);
        expectObservable(subscriber3.pipe(mergeMapTo(shared))).toBe(expected3);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      });
    });

    it('should share an error from the source to multiple observers', () => {
      rxTest.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
        const source = cold('    -1-2-3----4-#');
        const sourceSubs = '     ^-----------!';
        const subscriber1 = hot('a|           ');
        const expected1 = '      -1-2-3----4-#';
        const subscriber2 = hot('----b|       ');
        const expected2 = '      -----3----4-#';
        const subscriber3 = hot('--------c|   ');
        const expected3 = '      ----------4-#';

        const shared = source.pipe(share());

        expectObservable(subscriber1.pipe(mergeMapTo(shared))).toBe(expected1);
        expectObservable(subscriber2.pipe(mergeMapTo(shared))).toBe(expected2);
        expectObservable(subscriber3.pipe(mergeMapTo(shared))).toBe(expected3);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      });
    });

    it('should share the same values to multiple observers, but is unsubscribed explicitly and early', () => {
      rxTest.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
        const source = cold('    -1-2-3----4-|');
        const sourceSubs = '     ^--------!   ';
        const unsub = '          ---------!   ';
        const subscriber1 = hot('a|           ');
        const expected1 = '      -1-2-3----   ';
        const subscriber2 = hot('----b|       ');
        const expected2 = '      -----3----   ';
        const subscriber3 = hot('--------c|   ');
        const expected3 = '      ----------   ';

        const shared = source.pipe(share());

        expectObservable(subscriber1.pipe(mergeMapTo(shared)), unsub).toBe(expected1);
        expectObservable(subscriber2.pipe(mergeMapTo(shared)), unsub).toBe(expected2);
        expectObservable(subscriber3.pipe(mergeMapTo(shared)), unsub).toBe(expected3);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      });
    });

    it('should share an empty source', () => {
      rxTest.run(({ cold, expectObservable, expectSubscriptions }) => {
        const source = cold('|   ');
        const sourceSubs = ' (^!)';
        const expected = '   |   ';

        const shared = source.pipe(share());

        expectObservable(shared).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      });
    });

    it('should share a never source', () => {
      rxTest.run(({ cold, expectObservable, expectSubscriptions }) => {
        const source = cold('-');
        const sourceSubs = ' ^';
        const expected = '   -';

        const shared = source.pipe(share());

        expectObservable(shared).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      });
    });

    it('should share a throw source', () => {
      rxTest.run(({ cold, expectObservable, expectSubscriptions }) => {
        const source = cold('#   ');
        const sourceSubs = ' (^!)';
        const expected = '   #   ';

        const shared = source.pipe(share());

        expectObservable(shared).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      });
    });

    it('should connect when first subscriber subscribes', () => {
      rxTest.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
        const source = cold('       -1-2-3----4-|');
        const sourceSubs = '     ---^-----------!';
        const subscriber1 = hot('---a|           ');
        const expected1 = '      ----1-2-3----4-|';
        const subscriber2 = hot('-------b|       ');
        const expected2 = '      --------3----4-|';
        const subscriber3 = hot('-----------c|   ');
        const expected3 = '      -------------4-|';

        const shared = source.pipe(share());

        expectObservable(subscriber1.pipe(mergeMapTo(shared))).toBe(expected1);
        expectObservable(subscriber2.pipe(mergeMapTo(shared))).toBe(expected2);
        expectObservable(subscriber3.pipe(mergeMapTo(shared))).toBe(expected3);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      });
    });

    it('should disconnect when last subscriber unsubscribes', () => {
      rxTest.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
        const source = cold('       -1-2-3----4-|');
        const sourceSubs = '     ---^--------!   ';
        const subscriber1 = hot('---a|           ');
        const unsub1 = '         ----------!     ';
        const expected1 = '      ----1-2-3--     ';
        const subscriber2 = hot('-------b|       ');
        const unsub2 = '         ------------!   ';
        const expected2 = '      --------3----   ';

        const shared = source.pipe(share());

        expectObservable(subscriber1.pipe(mergeMapTo(shared)), unsub1).toBe(expected1);
        expectObservable(subscriber2.pipe(mergeMapTo(shared)), unsub2).toBe(expected2);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      });
    });

    it('should not break unsubscription chain when last subscriber unsubscribes', () => {
      rxTest.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
        const source = cold('       -1-2-3----4-|');
        const sourceSubs = '     ---^--------!   ';
        const subscriber1 = hot('---a|           ');
        const unsub1 = '         ----------!     ';
        const expected1 = '      ----1-2-3--     ';
        const subscriber2 = hot('-------b|       ');
        const unsub2 = '         ------------!   ';
        const expected2 = '      --------3----   ';

        const shared = source.pipe(
          mergeMap((x: string) => of(x)),
          share(),
          mergeMap((x: string) => of(x))
        );

        expectObservable(subscriber1.pipe(mergeMapTo(shared)), unsub1).toBe(expected1);
        expectObservable(subscriber2.pipe(mergeMapTo(shared)), unsub2).toBe(expected2);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      });
    });

    it('should be retryable when cold source is synchronous', () => {
      rxTest.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
        const source = cold('(123#)    ');
        const subscribe1 = ' s         ';
        const expected1 = '  (123123#) ';
        const subscribe2 = ' -s        ';
        const expected2 = '  -(123123#)';
        const sourceSubs = [
          '                  (^!)      ',
          '                  (^!)      ',
          '                  -(^!)     ',
          '                  -(^!)     ',
        ];

        const shared = source.pipe(share());

        expectObservable(
          hot(subscribe1).pipe(
            tap(() => {
              expectObservable(shared.pipe(retry(1))).toBe(expected1);
            })
          )
        ).toBe(subscribe1);

        expectObservable(
          hot(subscribe2).pipe(
            tap(() => {
              expectObservable(shared.pipe(retry(1))).toBe(expected2);
            })
          )
        ).toBe(subscribe2);

        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      });
    });

    it('should be repeatable when cold source is synchronous', () => {
      rxTest.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
        const source = cold('(123|)    ');
        const subscribe1 = ' s         ';
        const expected1 = '  (123123|) ';
        const subscribe2 = ' -s        ';
        const expected2 = '  -(123123|)';
        const sourceSubs = [
          '                  (^!)      ',
          '                  (^!)      ',
          '                  -(^!)     ',
          '                  -(^!)     ',
        ];

        const shared = source.pipe(share());

        expectObservable(
          hot(subscribe1).pipe(
            tap(() => {
              expectObservable(shared.pipe(repeat(2))).toBe(expected1);
            })
          )
        ).toBe(subscribe1);

        expectObservable(
          hot(subscribe2).pipe(
            tap(() => {
              expectObservable(shared.pipe(repeat(2))).toBe(expected2);
            })
          )
        ).toBe(subscribe2);

        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      });
    });

    it('should be retryable', () => {
      rxTest.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
        const source = cold('-1-2-3----4-#                        ');
        const sourceSubs = [
          '                  ^-----------!                        ',
          '                  ------------^-----------!            ',
          '                  ------------------------^-----------!',
        ];
        const subscribe1 = ' s------------------------------------';
        const expected1 = '  -1-2-3----4--1-2-3----4--1-2-3----4-#';
        const subscribe2 = ' ----s--------------------------------';
        const expected2 = '  -----3----4--1-2-3----4--1-2-3----4-#';

        const shared = source.pipe(share());

        expectObservable(
          hot(subscribe1).pipe(
            tap(() => {
              expectObservable(shared.pipe(retry(2))).toBe(expected1);
            })
          )
        ).toBe(subscribe1);

        expectObservable(
          hot(subscribe2).pipe(
            tap(() => {
              expectObservable(shared.pipe(retry(2))).toBe(expected2);
            })
          )
        ).toBe(subscribe2);

        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      });
    });

    it('should be repeatable', () => {
      rxTest.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
        const source = cold('-1-2-3----4-|                        ');
        const sourceSubs = [
          '                  ^-----------!                        ',
          '                  ------------^-----------!            ',
          '                  ------------------------^-----------!',
        ];
        const subscribe1 = ' s------------------------------------';
        const expected1 = '  -1-2-3----4--1-2-3----4--1-2-3----4-|';
        const subscribe2 = ' ----s--------------------------------';
        const expected2 = '  -----3----4--1-2-3----4--1-2-3----4-|';

        const shared = source.pipe(share());

        expectObservable(
          hot(subscribe1).pipe(
            tap(() => {
              expectObservable(shared.pipe(repeat(3))).toBe(expected1);
            })
          )
        ).toBe(subscribe1);

        expectObservable(
          hot(subscribe2).pipe(
            tap(() => {
              expectObservable(shared.pipe(repeat(3))).toBe(expected2);
            })
          )
        ).toBe(subscribe2);

        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      });
    });

    it('should not change the output of the observable when never', () => {
      rxTest.run(({ expectObservable }) => {
        const e1 = NEVER;
        const expected = '-';

        expectObservable(e1.pipe(share())).toBe(expected);
      });
    });

    it('should not change the output of the observable when empty', () => {
      rxTest.run(({ expectObservable }) => {
        const e1 = EMPTY;
        const expected = '|';

        expectObservable(e1.pipe(share())).toBe(expected);
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

      synchronousObservable.pipe(share(), take(3)).subscribe(() => {
        /* noop */
      });

      expect(sideEffects).to.deep.equal([0, 1, 2]);
    });

    it('should not fail on reentrant subscription', () => {
      rxTest.run(({ cold, expectObservable, expectSubscriptions }) => {
        // https://github.com/ReactiveX/rxjs/issues/6144
        const source = cold('(123|)');
        const subs = '       (^!)  ';
        const expected = '   (136|)';

        const deferred = defer(() => shared).pipe(startWith(0));
        const shared: Observable<string> = source.pipe(
          withLatestFrom(deferred),
          map(([a, b]) => String(Number(a) + Number(b))),
          share()
        );

        expectObservable(shared).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(subs);
      });
    });
  });

  describe('share(config)', () => {
    it('should not reset on error if configured to do so', () => {
      rxTest.run(({ hot, expectObservable, expectSubscriptions }) => {
        const source = hot('---a---b---c---d---e---f----#');
        const expected = '  ---a---b---c---d---e---f----#';
        const sourceSubs = [
          '                 ^----------!                 ',
          '                 -----------^-----------!     ',
          '                 -----------------------^----!',
        ];
        const result = source.pipe(
          // takes a, b, c... then repeat causes it to take d, e, f
          take(3),
          share({
            resetOnError: false,
          }),
          repeat()
        );

        expectObservable(result).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      });
    });

    it('should not reset on complete if configured to do so', () => {
      rxTest.run(({ cold, expectObservable, expectSubscriptions }) => {
        const source = cold('---a---b---c---#                          ');
        const expected = '   ---a---b---c------a---b---c------a---b---|';
        const sourceSubs = [
          '                  ^--------------!                          ',
          '                  ---------------^--------------!           ',
          '                  ------------------------------^----------!',
        ];

        // Used to trigger the source to complete at a given moment.
        const triggerComplete = new Subject<void>();

        // just used to count how many values have made it through the share.
        let count = 0;

        const result = source.pipe(
          takeUntil(triggerComplete),
          share({
            resetOnComplete: false,
          }),
          // Retry on any error.
          retry(),
          tap(() => {
            if (++count === 9) {
              // If we see the ninth value, complete the source this time.
              triggerComplete.next();
            }
          })
        );

        expectObservable(result).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      });
    });

    it('should not reset on refCount 0 if configured to do so', () => {
      rxTest.run(({ hot, expectObservable, expectSubscriptions }) => {
        const source = hot('  ---v---v---v---E--v---v---v---C---v----v------v---');
        const expected = '    ---v---v---v------v---v---v-------v----v----      ';
        const subscription = '^-------------------------------------------!     ';
        const sourceSubs = [
          '                   ^--------------!',
          '                   ---------------^--------------!',
          // Note this last subscription never ends, because refCount hitting zero isn't going to reset.
          '                   ------------------------------^--------------     ',
        ];

        const result = source.pipe(
          tap((value) => {
            if (value === 'E') {
              throw new Error('E');
            }
          }),
          takeWhile((value) => value !== 'C'),
          share({
            resetOnRefCountZero: false,
          }),
          retry(),
          repeat()
        );

        expectObservable(result, subscription).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      });
    });

    it('should use the connector function provided', () => {
      const connector = sinon.spy(() => new Subject());

      rxTest.run(({ hot, expectObservable }) => {
        const source = hot('  ---v---v---v---E--v---v---v---C---v----v--------v----v---');
        const subs1 = '       ^-------------------------------------------!            ';
        const expResult1 = '  ---v---v---v------v---v---v-------v----v-----            ';
        const subs2 = '       ----------------------------------------------^---------!';
        const expResult2 = '  ------------------------------------------------v----v---';

        const result = source.pipe(
          tap((value) => {
            if (value === 'E') {
              throw new Error('E');
            }
          }),
          takeWhile((value) => value !== 'C'),
          share({
            connector,
          }),
          retry(),
          repeat()
        );

        expectObservable(result, subs1).toBe(expResult1);
        expectObservable(result, subs2).toBe(expResult2);
      });

      expect(connector).to.have.callCount(4);
    });
  });
});
