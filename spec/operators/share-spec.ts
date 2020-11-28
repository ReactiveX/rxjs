import { expect } from 'chai';
import { hot, cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';
import { share, retry, mergeMapTo, mergeMap, tap, repeat, take, takeUntil, takeWhile, materialize } from 'rxjs/operators';
import { Observable, EMPTY, NEVER, of, Subject, Observer, from } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { observableMatcher } from '../helpers/observableMatcher';
import sinon = require('sinon');

/** @test {share} */
describe('share', () => {
  describe('share()', () => {
    it('should mirror a simple source Observable', () => {
      const source = cold('--1-2---3-4--5-|');
      const sourceSubs =  '^              !';
      const expected =    '--1-2---3-4--5-|';

      const shared = source.pipe(share());

      expectObservable(shared).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });

    it('should share a single subscription', () => {
      let subscriptionCount = 0;
      const obs = new Observable<never>(observer => {
        subscriptionCount++;
      });

      const source = obs.pipe(share());

      expect(subscriptionCount).to.equal(0);

      source.subscribe();
      source.subscribe();

      expect(subscriptionCount).to.equal(1);
    });

    it('should not change the output of the observable when error', () => {
      const e1 = hot('---a--^--b--c--d--e--#');
      const e1subs =       '^              !';
      const expected =     '---b--c--d--e--#';

      expectObservable(e1.pipe(share())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });

    it('should not change the output of the observable when successful with cold observable', () => {
      const e1 =  cold('---a--b--c--d--e--|');
      const e1subs =   '^                 !';
      const expected = '---a--b--c--d--e--|';

      expectObservable(e1.pipe(share())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });

    it('should not change the output of the observable when error with cold observable', () => {
      const e1 =  cold('---a--b--c--d--e--#');
      const e1subs =   '^                 !';
      const expected = '---a--b--c--d--e--#';

      expectObservable(e1.pipe(share())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });

    it('should retry just fine', () => {
      const e1 =  cold('---a--b--c--d--e--#');
      const e1subs =  ['^                 !                  ',
                    '                  ^                 !'];
      const expected = '---a--b--c--d--e-----a--b--c--d--e--#';

      expectObservable(e1.pipe(share(), retry(1))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });

    it('should share the same values to multiple observers', () => {
      const source =     cold('-1-2-3----4-|');
      const sourceSubs =      '^           !';
      const shared = source.pipe(share());
      const subscriber1 = hot('a|           ').pipe(mergeMapTo(shared));
      const expected1   =     '-1-2-3----4-|';
      const subscriber2 = hot('    b|       ').pipe(mergeMapTo(shared));
      const expected2   =     '    -3----4-|';
      const subscriber3 = hot('        c|   ').pipe(mergeMapTo(shared));
      const expected3   =     '        --4-|';

      expectObservable(subscriber1).toBe(expected1);
      expectObservable(subscriber2).toBe(expected2);
      expectObservable(subscriber3).toBe(expected3);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });

    it('should share an error from the source to multiple observers', () => {
      const source =     cold('-1-2-3----4-#');
      const sourceSubs =      '^           !';
      const shared = source.pipe(share());
      const subscriber1 = hot('a|           ').pipe(mergeMapTo(shared));
      const expected1   =     '-1-2-3----4-#';
      const subscriber2 = hot('    b|       ').pipe(mergeMapTo(shared));
      const expected2   =     '    -3----4-#';
      const subscriber3 = hot('        c|   ').pipe(mergeMapTo(shared));
      const expected3   =     '        --4-#';

      expectObservable(subscriber1).toBe(expected1);
      expectObservable(subscriber2).toBe(expected2);
      expectObservable(subscriber3).toBe(expected3);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });

    it('should share the same values to multiple observers, ' +
    'but is unsubscribed explicitly and early', () => {
      const source =     cold('-1-2-3----4-|');
      const sourceSubs =      '^        !   ';
      const shared = source.pipe(share());
      const unsub =           '         !   ';
      const subscriber1 = hot('a|           ').pipe(mergeMapTo(shared));
      const expected1   =     '-1-2-3----   ';
      const subscriber2 = hot('    b|       ').pipe(mergeMapTo(shared));
      const expected2   =     '    -3----   ';
      const subscriber3 = hot('        c|   ').pipe(mergeMapTo(shared));
      const expected3   =     '        --   ';

      expectObservable(subscriber1, unsub).toBe(expected1);
      expectObservable(subscriber2, unsub).toBe(expected2);
      expectObservable(subscriber3, unsub).toBe(expected3);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });

    it('should share an empty source', () => {
      const source = cold('|');
      const sourceSubs =  '(^!)';
      const shared = source.pipe(share());
      const expected =    '|';

      expectObservable(shared).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });

    it('should share a never source', () => {
      const source = cold('-');
      const sourceSubs =  '^';
      const shared = source.pipe(share());
      const expected =    '-';

      expectObservable(shared).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });

    it('should share a throw source', () => {
      const source = cold('#');
      const sourceSubs =  '(^!)';
      const shared = source.pipe(share());
      const expected =    '#';

      expectObservable(shared).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });

    it('should connect when first subscriber subscribes', () => {
      const source = cold(       '-1-2-3----4-|');
      const sourceSubs =      '   ^           !';
      const shared = source.pipe(share());
      const subscriber1 = hot('   a|           ').pipe(mergeMapTo(shared));
      const expected1 =       '   -1-2-3----4-|';
      const subscriber2 = hot('       b|       ').pipe(mergeMapTo(shared));
      const expected2 =       '       -3----4-|';
      const subscriber3 = hot('           c|   ').pipe(mergeMapTo(shared));
      const expected3 =       '           --4-|';

      expectObservable(subscriber1).toBe(expected1);
      expectObservable(subscriber2).toBe(expected2);
      expectObservable(subscriber3).toBe(expected3);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });

    it('should disconnect when last subscriber unsubscribes', () => {
      const source =     cold(   '-1-2-3----4-|');
      const sourceSubs =      '   ^        !   ';
      const shared = source.pipe(share());
      const subscriber1 = hot('   a|           ').pipe(mergeMapTo(shared));
      const unsub1 =          '          !     ';
      const expected1   =     '   -1-2-3--     ';
      const subscriber2 = hot('       b|       ').pipe(mergeMapTo(shared));
      const unsub2 =          '            !   ';
      const expected2   =     '       -3----   ';

      expectObservable(subscriber1, unsub1).toBe(expected1);
      expectObservable(subscriber2, unsub2).toBe(expected2);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });

    it('should not break unsubscription chain when last subscriber unsubscribes', () => {
      const source =     cold(   '-1-2-3----4-|');
      const sourceSubs =      '   ^        !   ';
      const shared = source.pipe(
        mergeMap((x: string) => of(x)),
        share(),
        mergeMap((x: string) => of(x))
      );
      const subscriber1 = hot('   a|           ').pipe(mergeMapTo(shared));
      const unsub1 =          '          !     ';
      const expected1   =     '   -1-2-3--     ';
      const subscriber2 = hot('       b|       ').pipe(mergeMapTo(shared));
      const unsub2 =          '            !   ';
      const expected2   =     '       -3----   ';

      expectObservable(subscriber1, unsub1).toBe(expected1);
      expectObservable(subscriber2, unsub2).toBe(expected2);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });

    it('should be retryable when cold source is synchronous', () => {
      const source = cold('(123#)');
      const shared = source.pipe(share());
      const subscribe1 =  's         ';
      const expected1 =   '(123123#) ';
      const subscribe2 =  ' s        ';
      const expected2 =   ' (123123#)';
      const sourceSubs = ['(^!)',
                        '(^!)',
                        ' (^!)',
                        ' (^!)'];

      expectObservable(hot(subscribe1).pipe(tap(() => {
        expectObservable(shared.pipe(retry(1))).toBe(expected1);
      }))).toBe(subscribe1);

      expectObservable(hot(subscribe2).pipe(tap(() => {
        expectObservable(shared.pipe(retry(1))).toBe(expected2);
      }))).toBe(subscribe2);

      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });

    it('should be repeatable when cold source is synchronous', () => {
      const source = cold('(123|)');
      const shared = source.pipe(share());
      const subscribe1 =  's         ';
      const expected1 =   '(123123|) ';
      const subscribe2 =  ' s        ';
      const expected2 =   ' (123123|)';
      const sourceSubs = ['(^!)',
                        '(^!)',
                        ' (^!)',
                        ' (^!)'];

      expectObservable(hot(subscribe1).pipe(tap(() => {
        expectObservable(shared.pipe(repeat(2))).toBe(expected1);
      }))).toBe(subscribe1);

      expectObservable(hot(subscribe2).pipe(tap(() => {
        expectObservable(shared.pipe(repeat(2))).toBe(expected2);
      }))).toBe(subscribe2);

      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });

    it('should be retryable', () => {
      const source =     cold('-1-2-3----4-#                        ');
      const sourceSubs =     ['^           !                        ',
                            '            ^           !            ',
                            '                        ^           !'];
      const shared = source.pipe(share());
      const subscribe1 =      's                                    ';
      const expected1 =       '-1-2-3----4--1-2-3----4--1-2-3----4-#';
      const subscribe2 =      '    s                                ';
      const expected2 =       '    -3----4--1-2-3----4--1-2-3----4-#';

      expectObservable(hot(subscribe1).pipe(tap(() => {
        expectObservable(shared.pipe(retry(2))).toBe(expected1);
      }))).toBe(subscribe1);

      expectObservable(hot(subscribe2).pipe(tap(() => {
        expectObservable(shared.pipe(retry(2))).toBe(expected2);
      }))).toBe(subscribe2);

      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });

    it('should be repeatable', () => {
      const source =     cold('-1-2-3----4-|                        ');
      const sourceSubs =     ['^           !                        ',
                              '            ^           !            ',
                              '                        ^           !'];
      const shared = source.pipe(share());
      const subscribe1 =      's                                    ';
      const expected1 =       '-1-2-3----4--1-2-3----4--1-2-3----4-|';
      const subscribe2 =      '    s                                ';
      const expected2 =       '    -3----4--1-2-3----4--1-2-3----4-|';

      expectObservable(hot(subscribe1).pipe(tap(() => {
        expectObservable(shared.pipe(repeat(3))).toBe(expected1);
      }))).toBe(subscribe1);

      expectObservable(hot(subscribe2).pipe(tap(() => {
        expectObservable(shared.pipe(repeat(3))).toBe(expected2);
      }))).toBe(subscribe2);

      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });

    it('should not change the output of the observable when never', () => {
      const e1 = NEVER;
      const expected = '-';

      expectObservable(e1.pipe(share())).toBe(expected);
    });

    it('should not change the output of the observable when empty', () => {
      const e1 = EMPTY;
      const expected = '|';

      expectObservable(e1.pipe(share())).toBe(expected);
    });

    // TODO: fix firehose unsubscription
    it.skip('should stop listening to a synchronous observable when unsubscribed', () => {
      const sideEffects: number[] = [];
      const synchronousObservable = new Observable<number>(subscriber => {
        // This will check to see if the subscriber was closed on each loop
        // when the unsubscribe hits (from the `take`), it should be closed
        for (let i = 0; !subscriber.closed && i < 10; i++) {
          sideEffects.push(i);
          subscriber.next(i);
        }
      });

      synchronousObservable.pipe(
        share(),
        take(3),
      ).subscribe(() => { /* noop */ });

      expect(sideEffects).to.deep.equal([0, 1, 2]);
    });
  });

  describe('share(config)', () => {
    let rxTest: TestScheduler;
    
    beforeEach(() => {
      rxTest = new TestScheduler(observableMatcher);
    });

    it('should not reset on error if configured to do so', () => {
      rxTest.run(({ hot, expectObservable, expectSubscriptions }) => {
        const source = hot('---a---b---c---d---e---f----#');
        const expected = '  ---a---b---c---d---e---f----#';
        const sourceSubs = [
          '                 ^----------!',
          '                 -----------^-----------!',
          '                 -----------------------^----!'
        ];
        const result = source.pipe(
          // takes a, b, c... then repeat causes it to take d, e, f
          take(3),
          share({
            resetOnError: false
          }),
          repeat()
        );

        expectObservable(result).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      });
    });

    it('should not reset on complete if configured to do so', () => {
      rxTest.run(({ cold, expectObservable, expectSubscriptions }) => {
        const source = cold('---a---b---c---#');
        const expected = '   ---a---b---c------a---b---c------a---b---|';
        const sourceSubs = [
          '                  ^--------------!',
          '                  ---------------^--------------!',
          '                  ------------------------------^----------!'
        ];

        // Used to trigger the source to complete at a given moment.
        const triggerComplete = new Subject<void>();

        // just used to count how many values have made it through the share.
        let count = 0;

        const result = source.pipe(
          takeUntil(triggerComplete),
          share({
            resetOnComplete: false
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
        const expected = '    ---v---v---v------v---v---v-------v----v----';
        const subscription = '^-------------------------------------------!';
        const sourceSubs = [
          '                   ^--------------!',
          '                   ---------------^--------------!',
          // Note this last subscription never ends, because refCount hitting zero isn't going to reset.
          '                   ------------------------------^--------------'
        ];

        const result = source.pipe(
          tap(value => {
            if (value === 'E') {
              throw new Error('E');
            }
          }),
          takeWhile(value => value !== 'C'),
          share({
            resetOnRefCountZero: false
          }),
          retry(),
          repeat(),
        );

        expectObservable(result, subscription).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      });
    });

    it('should use the connector function provided', () => {
      const connector = sinon.spy(() => new Subject());

      rxTest.run(({ hot, expectObservable }) => {
        const source = hot('  ---v---v---v---E--v---v---v---C---v----v--------v----v---');
        const subs1 = '       ^-------------------------------------------!';
        const expResult1 = '  ---v---v---v------v---v---v-------v----v-----';
        const subs2 = '       ----------------------------------------------^---------!';
        const expResult2 = '  ------------------------------------------------v----v---';

        
        const result = source.pipe(
          tap(value => {
            if (value === 'E') {
              throw new Error('E');
            }
          }),
          takeWhile(value => value !== 'C'),
          share({
            connector
          }),
          retry(),
          repeat(),
        );

        expectObservable(result, subs1).toBe(expResult1);
        expectObservable(result, subs2).toBe(expResult2);
      });
      
      expect(connector).to.have.callCount(4);
    })
  });
});