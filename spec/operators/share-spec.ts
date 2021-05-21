/** @prettier */
import { expect } from 'chai';
import { asapScheduler, concat, config, defer, EMPTY, NEVER, Observable, of, scheduled, Subject, throwError, pipe } from 'rxjs';
import {
  map,
  mergeMap,
  mergeMapTo,
  onErrorResumeNext,
  repeat,
  retry,
  share,
  startWith,
  take,
  takeUntil,
  takeWhile,
  tap,
  toArray,
  withLatestFrom,
} from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { observableMatcher } from '../helpers/observableMatcher';
import { SinonSpy, spy } from 'sinon';

const syncNotify = of(1);
const asapNotify = scheduled(syncNotify, asapScheduler);
const syncError = throwError(() => new Error());

function spyOnUnhandledError(fn: (spy: SinonSpy) => void): void {
  const prevOnUnhandledError = config.onUnhandledError;

  try {
    const onUnhandledError = spy();
    config.onUnhandledError = onUnhandledError;

    fn(onUnhandledError);
  } finally {
    config.onUnhandledError = prevOnUnhandledError;
  }
}

/** @test {share} */
describe('share', () => {
  let rxTest: TestScheduler;

  beforeEach(() => {
    rxTest = new TestScheduler(observableMatcher);
  });

  for (const { title, options } of [
    { title: 'share()', options: {} },
    {
      title: 'share() using sync reset notifiers equivalent to default config',
      options: {
        resetOnError: () => syncNotify,
        resetOnComplete: () => syncNotify,
        resetOnRefCountZero: () => syncNotify,
      },
    },
    {
      title: 'share() using sync reset notifiers equivalent to default config and notifying again after reset is notified',
      options: {
        resetOnError: () => concat(syncNotify, syncNotify),
        resetOnComplete: () => concat(syncNotify, syncNotify),
        resetOnRefCountZero: () => concat(syncNotify, syncNotify),
      },
    },
    {
      title: 'share() using sync reset notifiers equivalent to default config and never completing after reset is notified',
      options: {
        resetOnError: () => concat(syncNotify, NEVER),
        resetOnComplete: () => concat(syncNotify, NEVER),
        resetOnRefCountZero: () => concat(syncNotify, NEVER),
      },
    },
    {
      title: 'share() using sync reset notifiers equivalent to default config and throwing an error after reset is notified',
      options: {
        resetOnError: () => concat(syncNotify, syncError),
        resetOnComplete: () => concat(syncNotify, syncError),
        resetOnRefCountZero: () => concat(syncNotify, syncError),
      },
    },
  ]) {
    describe(title, () => {
      it('should mirror a simple source Observable', () => {
        rxTest.run(({ cold, expectObservable, expectSubscriptions }) => {
          const source = cold('--1-2---3-4--5-|');
          const sourceSubs = ' ^--------------!';
          const expected = '   --1-2---3-4--5-|';

          const shared = source.pipe(share(options));

          expectObservable(shared).toBe(expected);
          expectSubscriptions(source.subscriptions).toBe(sourceSubs);
        });
      });

      it('should share a single subscription', () => {
        let subscriptionCount = 0;
        const obs = new Observable<never>(() => {
          subscriptionCount++;
        });

        const source = obs.pipe(share(options));

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

          expectObservable(e1.pipe(share(options))).toBe(expected);
          expectSubscriptions(e1.subscriptions).toBe(e1subs);
        });
      });

      it('should not change the output of the observable when successful with cold observable', () => {
        rxTest.run(({ cold, expectObservable, expectSubscriptions }) => {
          const e1 = cold(' ---a--b--c--d--e--|');
          const e1subs = '  ^-----------------!';
          const expected = '---a--b--c--d--e--|';

          expectObservable(e1.pipe(share(options))).toBe(expected);
          expectSubscriptions(e1.subscriptions).toBe(e1subs);
        });
      });

      it('should not change the output of the observable when error with cold observable', () => {
        rxTest.run(({ cold, expectObservable, expectSubscriptions }) => {
          const e1 = cold(' ---a--b--c--d--e--#');
          const e1subs = '  ^-----------------!';
          const expected = '---a--b--c--d--e--#';

          expectObservable(e1.pipe(share(options))).toBe(expected);
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

          expectObservable(e1.pipe(share(options), retry(1))).toBe(expected);
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

          const shared = source.pipe(share(options));

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

          const shared = source.pipe(share(options));

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

          const shared = source.pipe(share(options));

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

          const shared = source.pipe(share(options));

          expectObservable(shared).toBe(expected);
          expectSubscriptions(source.subscriptions).toBe(sourceSubs);
        });
      });

      it('should share a never source', () => {
        rxTest.run(({ cold, expectObservable, expectSubscriptions }) => {
          const source = cold('-');
          const sourceSubs = ' ^';
          const expected = '   -';

          const shared = source.pipe(share(options));

          expectObservable(shared).toBe(expected);
          expectSubscriptions(source.subscriptions).toBe(sourceSubs);
        });
      });

      it('should share a throw source', () => {
        rxTest.run(({ cold, expectObservable, expectSubscriptions }) => {
          const source = cold('#   ');
          const sourceSubs = ' (^!)';
          const expected = '   #   ';

          const shared = source.pipe(share(options));

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

          const shared = source.pipe(share(options));

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

          const shared = source.pipe(share(options));

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
            share(options),
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

          const shared = source.pipe(share(options));

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

          const shared = source.pipe(share(options));

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

          const shared = source.pipe(share(options));

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

          const shared = source.pipe(share(options));

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

          expectObservable(e1.pipe(share(options))).toBe(expected);
        });
      });

      it('should not change the output of the observable when empty', () => {
        rxTest.run(({ expectObservable }) => {
          const e1 = EMPTY;
          const expected = '|';

          expectObservable(e1.pipe(share(options))).toBe(expected);
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

        synchronousObservable.pipe(share(options), take(3)).subscribe(() => {
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
            share(options)
          );

          expectObservable(shared).toBe(expected);
          expectSubscriptions(source.subscriptions).toBe(subs);
        });
      });
    });
  }

  for (const { title, resetOnError, resetOnComplete, resetOnRefCountZero } of [
    { title: 'share(config)', resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false },
    {
      title: 'share(config) using EMPTY as sync reset notifier equivalents',
      resetOnError: () => EMPTY,
      resetOnComplete: () => EMPTY,
      resetOnRefCountZero: () => EMPTY,
    },
    {
      title: 'share(config) using NEVER as sync reset notifier equivalents',
      resetOnError: () => NEVER,
      resetOnComplete: () => NEVER,
      resetOnRefCountZero: () => NEVER,
    },
  ]) {
    describe(title, () => {
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
            share({ resetOnError }),
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
            share({ resetOnComplete }),
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
            share({ resetOnRefCountZero }),
            retry(),
            repeat()
          );

          expectObservable(result, subscription).toBe(expected);
          expectSubscriptions(source.subscriptions).toBe(sourceSubs);
        });
      });

      it('should be referentially-transparent', () => {
        rxTest.run(({ cold, expectObservable, expectSubscriptions }) => {
          const source1 = cold('-1-2-3-4-5-|');
          const source1Subs = ' ^----------!';
          const expected1 = '   -1-2-3-4-5-|';
          const source2 = cold('-6-7-8-9-0-|');
          const source2Subs = ' ^----------!';
          const expected2 = '   -6-7-8-9-0-|';

          // Calls to the _operator_ must be referentially-transparent.
          const partialPipeLine = pipe(share({ resetOnRefCountZero }));

          // The non-referentially-transparent sharing occurs within the _operator function_
          // returned by the _operator_ and that happens when the complete pipeline is composed.
          const shared1 = source1.pipe(partialPipeLine);
          const shared2 = source2.pipe(partialPipeLine);

          expectObservable(shared1).toBe(expected1);
          expectSubscriptions(source1.subscriptions).toBe(source1Subs);
          expectObservable(shared2).toBe(expected2);
          expectSubscriptions(source2.subscriptions).toBe(source2Subs);
        });
      });
    });
  }

  describe('share(config)', () => {
    it('should use the connector function provided', () => {
      const connector = spy(() => new Subject());

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

  describe('share(config) with async/deferred reset notifiers', () => {
    it('should reset on refCount 0 when synchronously resubscribing to a firehose and using a sync reset notifier', () => {
      let subscriptionCount = 0;
      const source = new Observable((subscriber) => {
        subscriptionCount++;
        for (let i = 0; i < 3 && !subscriber.closed; i++) {
          subscriber.next(i);
        }
        if (!subscriber.closed) {
          subscriber.complete();
        }
      });

      let result;
      source
        .pipe(share({ resetOnRefCountZero: () => syncNotify }), take(2), repeat(2), toArray())
        .subscribe((numbers) => void (result = numbers));

      expect(subscriptionCount).to.equal(2);
      expect(result).to.deep.equal([0, 1, 0, 1]);
    });

    it('should reset on refCount 0 when synchronously resubscribing and using a sync reset notifier', () => {
      rxTest.run(({ hot, expectObservable, expectSubscriptions }) => {
        const source = hot('  ---1---2---3---(4 )---5---|');
        const sourceSubs = [
          '                   ^------!                   ',
          // break the line, please
          '                   -------^-------(! )        ',
        ];
        const expected = '    ---1---2---3---(4|)        ';
        const subscription = '^--------------(- )        ';

        const sharedSource = source.pipe(share({ resetOnRefCountZero: () => syncNotify }), take(2));

        const result = concat(sharedSource, sharedSource);

        expectObservable(result, subscription).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      });
    });

    it('should not reset on refCount 0 when synchronously resubscribing and using a deferred reset notifier', () => {
      rxTest.run(({ cold, expectObservable, expectSubscriptions }) => {
        const source = cold(' ---1---2---3---4---5---|');
        const sourceSubs = '  ^----------------------!';
        const expected = '    ---1---2---3---4---5---|';
        const subscription = '^-----------------------';

        const sharedSource = source.pipe(share({ resetOnRefCountZero: () => asapNotify }), take(3));

        const result = concat(sharedSource, sharedSource);

        expectObservable(result, subscription).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      });
    });

    it('should reset on refCount 0 only after reset notifier emitted', () => {
      rxTest.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
        const source = hot('      ---1---2---3---4---5---|');
        const sourceSubs = [
          '                       ^----------------!      ',
          // break the line, please
          '                       ------------------^----!',
        ];
        const expected = '        ---1---2---3---4---5---|';
        const subscription = '    ^-----------------------';
        const firstPause = cold('        -|               ');
        const reset = cold('             --r              ');
        const secondPause = cold('               ---|     ');
        // reset: '                              --r      '

        const sharedSource = source.pipe(share({ resetOnRefCountZero: () => reset }), take(2));

        const result = concat(sharedSource, firstPause, sharedSource, secondPause, sharedSource);

        expectObservable(result, subscription).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      });
    });

    it('should reset on error only after reset notifier emitted', () => {
      rxTest.run(({ cold, expectObservable, expectSubscriptions }) => {
        const source = cold('     ---1---2---#                ');
        // source: '                            ---1---2---#  '
        const sourceSubs = [
          '                       ^----------!                ',
          // break the line, please
          '                       --------------^----------!  ',
        ];
        const expected = '        ---1---2---------1---2----# ';
        const subscription = '    ^-------------------------- ';
        const firstPause = cold('        -------|             ');
        const reset = cold('                 --r              ');
        const secondPause = cold('                     -----| ');
        // reset: '                                        --r'

        const sharedSource = source.pipe(share({ resetOnError: () => reset, resetOnRefCountZero: false }), take(2));

        const result = concat(sharedSource, firstPause, sharedSource, secondPause, sharedSource);

        expectObservable(result, subscription).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      });
    });

    it('should reset on complete only after reset notifier emitted', () => {
      rxTest.run(({ cold, expectObservable, expectSubscriptions }) => {
        const source = cold('     ---1---2---|                ');
        // source: '                            ---1---2---|  '
        const sourceSubs = [
          '                       ^----------!                ',
          // break the line, please
          '                       --------------^----------!  ',
        ];
        const expected = '        ---1---2---------1---2----| ';
        const subscription = '    ^-------------------------- ';
        const firstPause = cold('        -------|             ');
        const reset = cold('                 --r              ');
        const secondPause = cold('                     -----| ');
        // reset: '                                        --r'

        const sharedSource = source.pipe(share({ resetOnComplete: () => reset, resetOnRefCountZero: false }), take(2));

        const result = concat(sharedSource, firstPause, sharedSource, secondPause, sharedSource);

        expectObservable(result, subscription).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      });
    });

    it('should not reset on refCount 0 if reset notifier errors before emitting any value', () => {
      spyOnUnhandledError((onUnhandledError) => {
        const error = new Error();

        rxTest.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
          const source = hot('       ---1---2---3---4---(5 )---|');
          const sourceSubs = '       ^------------------(- )---!';
          const expected = '         ---1---2-------4---(5|)    ';
          const subscription = '     ^------------------(- )    ';
          const firstPause = cold('         ------|             ');
          const reset = cold('              --#                 ', undefined, error);
          // reset: '                                   (- )-#  '

          const sharedSource = source.pipe(share({ resetOnRefCountZero: () => reset }), take(2));

          const result = concat(sharedSource, firstPause, sharedSource);

          expectObservable(result, subscription).toBe(expected);
          expectSubscriptions(source.subscriptions).toBe(sourceSubs);
        });

        expect(onUnhandledError).to.have.been.calledTwice;
        expect(onUnhandledError.getCall(0)).to.have.been.calledWithExactly(error);
        expect(onUnhandledError.getCall(1)).to.have.been.calledWithExactly(error);
      });
    });

    it('should not reset on error if reset notifier errors before emitting any value', () => {
      spyOnUnhandledError((onUnhandledError) => {
        const error = new Error();

        rxTest.run(({ cold, expectObservable, expectSubscriptions }) => {
          const source = cold('    ---1---2---#   ');
          const sourceSubs = '     ^----------!   ';
          const expected = '       ---1---2------#';
          const subscription = '   ^--------------';
          const firstPause = cold('       -------|');
          const reset = cold('                --# ', undefined, error);

          const sharedSource = source.pipe(share({ resetOnError: () => reset, resetOnRefCountZero: false }), take(2));

          const result = concat(sharedSource, firstPause, sharedSource);

          expectObservable(result, subscription).toBe(expected);
          expectSubscriptions(source.subscriptions).toBe(sourceSubs);
        });

        expect(onUnhandledError).to.have.been.calledOnce;
        expect(onUnhandledError.getCall(0)).to.have.been.calledWithExactly(error);
      });
    });

    it('should not reset on complete if reset notifier errors before emitting any value', () => {
      spyOnUnhandledError((onUnhandledError) => {
        const error = new Error();

        rxTest.run(({ cold, expectObservable, expectSubscriptions }) => {
          const source = cold('    ---1---2---|   ');
          const sourceSubs = '     ^----------!   ';
          const expected = '       ---1---2------|';
          const subscription = '   ^--------------';
          const firstPause = cold('       -------|');
          const reset = cold('                --# ', undefined, error);

          const sharedSource = source.pipe(share({ resetOnComplete: () => reset, resetOnRefCountZero: false }), take(2));

          const result = concat(sharedSource, firstPause, sharedSource);

          expectObservable(result, subscription).toBe(expected);
          expectSubscriptions(source.subscriptions).toBe(sourceSubs);
        });

        expect(onUnhandledError).to.have.been.calledOnce;
        expect(onUnhandledError.getCall(0)).to.have.been.calledWithExactly(error);
      });
    });

    it('should not call "resetOnRefCountZero" on error', () => {
      rxTest.run(({ cold, expectObservable, expectSubscriptions }) => {
        const resetOnRefCountZero = spy(() => EMPTY);

        const source = cold('    ---1---(2#)                ');
        // source: '                           ---1---(2#)  '
        const sourceSubs = [
          '                      ^------(! )                ',
          // break the line, please
          '                      -------(- )---^------(! )  ',
        ];
        const expected = '       ---1---(2 )------1---(2#)  ';
        const subscription = '   ^------(- )----------(- )  ';
        const firstPause = cold('       (- )---|            ');
        const reset = cold('            (- )-r              ');
        // reset: '                                   (- )-r'

        const sharedSource = source.pipe(share({ resetOnError: () => reset, resetOnRefCountZero }));

        const result = concat(sharedSource.pipe(onErrorResumeNext(firstPause)), sharedSource);

        expectObservable(result, subscription).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
        expect(resetOnRefCountZero).to.not.have.been.called;
      });
    });

    it('should not call "resetOnRefCountZero" on complete', () => {
      rxTest.run(({ cold, expectObservable, expectSubscriptions }) => {
        const resetOnRefCountZero = spy(() => EMPTY);

        const source = cold('    ---1---(2|)                ');
        // source: '                           ---1---(2|)  '
        const sourceSubs = [
          '                      ^------(! )                ',
          // break the line, please
          '                      -------(- )---^------(! )  ',
        ];
        const expected = '       ---1---(2 )------1---(2|)  ';
        const subscription = '   ^------(- )----------(- )  ';
        const firstPause = cold('       (- )---|            ');
        const reset = cold('            (- )-r              ');
        // reset: '                                   (- )-r'

        const sharedSource = source.pipe(share({ resetOnComplete: () => reset, resetOnRefCountZero }));

        const result = concat(sharedSource, firstPause, sharedSource);

        expectObservable(result, subscription).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
        expect(resetOnRefCountZero).to.not.have.been.called;
      });
    });
  });
});
