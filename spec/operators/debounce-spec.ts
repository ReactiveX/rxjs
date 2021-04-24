/** @prettier */
import { expect } from 'chai';
import { NEVER, timer, of, EMPTY, concat, Subject, Observable } from 'rxjs';
import { debounce, mergeMap, mapTo, take } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {debounce} */
describe('debounce', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(observableMatcher);
  });

  function getTimerSelector(x: number) {
    return () => timer(x, testScheduler);
  }

  it('should debounce values by a specified cold Observable', () => {
    testScheduler.run(({ cold, hot, expectObservable }) => {
      const e1 = hot('  -a--bc--d---|');
      const e2 = cold(' --x          ');
      const expected = '---a---c--d-|';

      const result = e1.pipe(debounce(() => e2));

      expectObservable(result).toBe(expected);
    });
  });

  it('should delay all element by selector observable', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--d---------|');
      const e1subs = '  ^--------------------!';
      const expected = '----a--b--c--d-------|';

      expectObservable(e1.pipe(debounce(getTimerSelector(2)))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should debounce by selector observable', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--bc--d----|');
      const e1subs = '  ^-------------!';
      const expected = '----a---c--d--|';

      expectObservable(e1.pipe(debounce(getTimerSelector(2)))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should support a scalar selector observable', () => {
    // If the selector returns a scalar observable, the debounce operator
    // should emit the value immediately.
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--bc--d----|');
      const e1subs = '  ^-------------!';
      const expected = '--a--bc--d----|';

      expectObservable(e1.pipe(debounce(() => of(0)))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should complete when source does not emit', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -----|');
      const e1subs = '  ^----!';
      const expected = '-----|';

      expectObservable(e1.pipe(debounce(getTimerSelector(2)))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should complete when source is empty', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' |');
      const e1subs = '  (^!)';
      const expected = '|';

      expectObservable(e1.pipe(debounce(getTimerSelector(2)))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should raise error when source does not emit and raises error', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -----#');
      const e1subs = '  ^----!';
      const expected = '-----#';

      expectObservable(e1.pipe(debounce(getTimerSelector(2)))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should raise error when source throws', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' #');
      const e1subs = '  (^!)';
      const expected = '#';

      expectObservable(e1.pipe(debounce(getTimerSelector(2)))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should allow unsubscribing early and explicitly', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--bc--d----|');
      const e1subs = '  ^------!       ';
      const expected = '----a---       ';
      const unsub = '   -------!       ';

      const result = e1.pipe(debounce(getTimerSelector(2)));

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not break unsubscription chains when unsubscribed explicitly', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--bc--d----|');
      const e1subs = '  ^------!       ';
      const expected = '----a---       ';
      const unsub = '   -------!       ';

      const result = e1.pipe(
        mergeMap((x: any) => of(x)),
        debounce(getTimerSelector(2)),
        mergeMap((x: any) => of(x))
      );

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should debounce and does not complete when source does not completes', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--bc--d---');
      const e1subs = '  ^            ';
      const expected = '----a---c--d-';

      expectObservable(e1.pipe(debounce(getTimerSelector(2)))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not complete when source does not complete', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -');
      const e1subs = '  ^';
      const expected = '-';

      expectObservable(e1.pipe(debounce(getTimerSelector(2)))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not completes when source never completes', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' -');
      const e1subs = '  ^';
      const expected = '-';

      expectObservable(e1.pipe(debounce(getTimerSelector(2)))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should delay all element until source raises error', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--d---------#');
      const e1subs = '  ^--------------------!';
      const expected = '----a--b--c--d-------#';

      expectObservable(e1.pipe(debounce(getTimerSelector(2)))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should debounce all elements while source emits by selector observable', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ---a---b---c---d---e|');
      const e1subs = '  ^-------------------!';
      const expected = '--------------------(e|)';

      expectObservable(e1.pipe(debounce(getTimerSelector(4)))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should debounce all element while source emits by selector observable until raises error', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--d-#');
      const e1subs = '  ^------------!';
      const expected = '-------------#';

      expectObservable(e1.pipe(debounce(getTimerSelector(5)))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should delay element by same selector observable emits multiple', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('       ----a--b--c----d-----e-------|');
      const e1subs = '       ^----------------------------!';
      const expected = '     ------a--b--c----d-----e-----|';
      const selector = cold('--x-y-');
      const selectorSubs = [
        '                    ----^-!                      ',
        '                    -------^-!                   ',
        '                    ----------^-!                ',
        '                    ---------------^-!           ',
        '                    ---------------------^-!     ',
      ];

      expectObservable(e1.pipe(debounce(() => selector))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(selector.subscriptions).toBe(selectorSubs);
    });
  });

  it('should debounce by selector observable emits multiple', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ----a--b--c----d-----e-------|');
      const e1subs = '  ^----------------------------!';
      const expected = '------a-----c----------e-----|';
      const selector = [
        cold('              --x-y-                    '),
        cold('                 ----x-y-               '),
        cold('                    --x-y-              '),
        cold('                         ------x-y-     '),
        cold('                               --x-y-   '),
      ];
      const selectorSubs = [
        '               ----^-!                       ',
        '               -------^--!                   ',
        '               ----------^-!                 ',
        '               ---------------^-----!        ',
        '               ---------------------^-!      ',
      ];

      expectObservable(e1.pipe(debounce(() => selector.shift()!))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      for (let i = 0; i < selectorSubs.length; i++) {
        expectSubscriptions(selector[i].subscriptions).toBe(selectorSubs[i]);
      }
    });
  });

  it('should debounce by selector observable until source completes', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ----a--b--c----d----e|    ');
      const e1subs = '  ^--------------------!    ';
      const expected = '------a-----c--------(e|) ';
      const selector = [
        cold('              --x-y-                '),
        cold('                 ----x-y-           '),
        cold('                    --x-y-          '),
        cold('                         ------x-y- '),
        cold('                              --x-y-'),
      ];
      const selectorSubs = [
        '               ----^-!                   ',
        '               -------^--!               ',
        '               ----------^-!             ',
        '               ---------------^----!     ',
        '               --------------------^!    ',
      ];

      expectObservable(e1.pipe(debounce(() => selector.shift()!))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      for (let i = 0; i < selectorSubs.length; i++) {
        expectSubscriptions(selector[i].subscriptions).toBe(selectorSubs[i]);
      }
    });
  });

  it('should raise error when selector observable raises error', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --------a--------b--------c---------|');
      const e1subs = '  ^----------------------------!       ';
      const expected = '---------a---------b---------#       ';
      const selector = [
        cold('                  -x-y-                        '),
        cold('                           --x-y-              '),
        cold('                                    ---#       '),
      ];
      const selectorSubs = [
        '               --------^!                           ',
        '               -----------------^-!                 ',
        '               --------------------------^--!       ',
      ];

      expectObservable(e1.pipe(debounce(() => selector.shift()!))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      for (let i = 0; i < selectorSubs.length; i++) {
        expectSubscriptions(selector[i].subscriptions).toBe(selectorSubs[i]);
      }
    });
  });

  it('should raise error when source raises error with selector observable', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --------a--------b--------c---------d#      ');
      const e1subs = '  ^------------------------------------!      ';
      const expected = '---------a---------b---------c-------#      ';
      const selector = [
        cold('                  -x-y-                               '),
        cold('                           --x-y-                     '),
        cold('                                    ---x-y-           '),
        cold('                                              ----x-y-'),
      ];
      const selectorSubs = [
        '               --------^!                                  ',
        '               -----------------^-!                        ',
        '               --------------------------^--!              ',
        '               ------------------------------------^!      ',
      ];

      expectObservable(e1.pipe(debounce(() => selector.shift()!))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      for (let i = 0; i < selectorSubs.length; i++) {
        expectSubscriptions(selector[i].subscriptions).toBe(selectorSubs[i]);
      }
    });
  });

  it('should raise error when selector function throws', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --------a--------b--------c---------|');
      const e1subs = '  ^-------------------------!          ';
      const expected = '---------a---------b------#          ';
      // prettier-ignore
      const selector = [
        cold('                  -x-y-                        '),
        cold('                           --x-y-              '),
      ];
      // prettier-ignore
      const selectorSubs = [
        '               --------^!                           ',
        '               -----------------^-!                 ',
      ];

      function selectorFunction(x: string) {
        if (x !== 'c') {
          return selector.shift();
        } else {
          throw 'error';
        }
      }

      expectObservable(e1.pipe(debounce(selectorFunction as any))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      for (let i = 0; i < selectorSubs.length; i++) {
        expectSubscriptions(selector[i].subscriptions).toBe(selectorSubs[i]);
      }
    });
  });

  it('should ignore all values except last, when given an empty selector Observable', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --------a-x-yz---bxy---z--c--x--y--z|   ');
      const e1subs = '  ^-----------------------------------!   ';
      const expected = '------------------------------------(z|)';

      function selectorFunction(x: string) {
        return EMPTY;
      }

      expectObservable(e1.pipe(debounce(selectorFunction))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should ignore all values except last, when given a never selector Observable', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --------a-x-yz---bxy---z--c--x--y--z|  ');
      const e1subs = '  ^-----------------------------------!  ';
      const expected = '------------------------------------(z|)';

      function selectorFunction() {
        return NEVER;
      }

      expectObservable(e1.pipe(debounce(selectorFunction))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not delay by selector observable completes when it does not emits', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --------a--------b--------c---------|   ');
      const e1subs = '  ^-----------------------------------!   ';
      const expected = '------------------------------------(c|)';
      const selector = [
        cold('                  -|                              '),
        cold('                           --|                    '),
        cold('                                    ---|          '),
      ];
      const selectorSubs = [
        '               --------^!                              ',
        '               -----------------^-!                    ',
        '               --------------------------^--!          ',
      ];

      expectObservable(e1.pipe(debounce(() => selector.shift()!))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      for (let i = 0; i < selectorSubs.length; i++) {
        expectSubscriptions(selector[i].subscriptions).toBe(selectorSubs[i]);
      }
    });
  });

  it('should not debounce by selector observable completes when it does not emits', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ----a--b-c---------de-------------|   ');
      const e1subs = '  ^---------------------------------!   ';
      const expected = '----------------------------------(e|)';
      const selector = [
        cold('              -|                                '),
        cold('                 --|                            '),
        cold('                   ---|                         '),
        cold('                             ----|              '),
        cold('                              -----|            '),
      ];
      const selectorSubs = [
        '               ----^!                                ',
        '               -------^-!                            ',
        '               ---------^--!                         ',
        '               -------------------^!                 ',
        '               --------------------^----!            ',
      ];

      expectObservable(e1.pipe(debounce(() => selector.shift()!))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      for (let i = 0; i < selectorSubs.length; i++) {
        expectSubscriptions(selector[i].subscriptions).toBe(selectorSubs[i]);
      }
    });
  });

  it('should delay by promise resolves', (done) => {
    const e1 = concat(of(1), timer(10).pipe(mapTo(2)), timer(10).pipe(mapTo(3)), timer(100).pipe(mapTo(4)));
    const expected = [1, 2, 3, 4];

    e1.pipe(
      debounce(() => {
        return new Promise((resolve: any) => {
          resolve(42);
        });
      })
    ).subscribe(
      (x: number) => {
        expect(x).to.equal(expected.shift());
      },
      (x) => {
        done(new Error('should not be called'));
      },
      () => {
        expect(expected.length).to.equal(0);
        done();
      }
    );
  });

  it('should raises error when promise rejects', (done) => {
    const e1 = concat(of(1), timer(10).pipe(mapTo(2)), timer(10).pipe(mapTo(3)), timer(100).pipe(mapTo(4)));
    const expected = [1, 2];
    const error = new Error('error');

    e1.pipe(
      debounce((x: number) => {
        if (x === 3) {
          return new Promise((resolve: any, reject: any) => {
            reject(error);
          });
        } else {
          return new Promise((resolve: any) => {
            resolve(42);
          });
        }
      })
    ).subscribe(
      (x: number) => {
        expect(x).to.equal(expected.shift());
      },
      (err: any) => {
        expect(err).to.be.an('error', 'error');
        expect(expected.length).to.equal(0);
        done();
      },
      () => {
        done(new Error('should not be called'));
      }
    );
  });

  it('should debounce correctly when synchronously reentered', () => {
    const results: number[] = [];
    const source = new Subject<number>();

    source.pipe(debounce(() => of(null))).subscribe((value) => {
      results.push(value);

      if (value === 1) {
        source.next(2);
      }
    });
    source.next(1);

    expect(results).to.deep.equal([1, 2]);
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

    synchronousObservable
      .pipe(
        debounce(() => of(0)),
        take(3)
      )
      .subscribe(() => {
        /* noop */
      });

    expect(sideEffects).to.deep.equal([0, 1, 2]);
  });
});
