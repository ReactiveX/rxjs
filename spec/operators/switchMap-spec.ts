/** @prettier */
import { expect } from 'chai';
import { switchMap, mergeMap, map, takeWhile, take } from 'rxjs/operators';
import { concat, defer, of, Observable, BehaviorSubject } from 'rxjs';
import { asInteropObservable } from '../helpers/interop-helper';
import { TestScheduler } from 'rxjs/testing';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {switchMap} */
describe('switchMap', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(observableMatcher);
  });

  it('should map-and-flatten each item to an Observable', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e1 = hot('   --1-----3--5-------|');
      const e1subs = '   ^------------------!';
      const e2 = cold('    x-x-x|            ', { x: 10 });
      //                         x-x-x|
      //                            x-x-x|
      const expected = ' --x-x-x-y-yz-z-z---|';
      const values = { x: 10, y: 30, z: 50 };

      const result = e1.pipe(switchMap((x) => e2.pipe(map((i) => i * +x))));

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should support the deprecated resultSelector', () => {
    const results: Array<number[]> = [];

    of(1, 2, 3)
      .pipe(
        switchMap(
          (x) => of(x, x + 1, x + 2),
          (a, b, i, ii) => [a, b, i, ii]
        )
      )
      .subscribe({
        next(value) {
          results.push(value);
        },
        error(err) {
          throw err;
        },
        complete() {
          expect(results).to.deep.equal([
            [1, 1, 0, 0],
            [1, 2, 0, 1],
            [1, 3, 0, 2],
            [2, 2, 1, 0],
            [2, 3, 1, 1],
            [2, 4, 1, 2],
            [3, 3, 2, 0],
            [3, 4, 2, 1],
            [3, 5, 2, 2],
          ]);
        },
      });
  });

  it('should support a void resultSelector (still deprecated)', () => {
    const results: number[] = [];

    of(1, 2, 3)
      .pipe(switchMap((x) => of(x, x + 1, x + 2), void 0))
      .subscribe({
        next(value) {
          results.push(value);
        },
        error(err) {
          throw err;
        },
        complete() {
          expect(results).to.deep.equal([1, 2, 3, 2, 3, 4, 3, 4, 5]);
        },
      });
  });

  it('should unsub inner observables', () => {
    const unsubbed: string[] = [];

    of('a', 'b')
      .pipe(
        switchMap(
          (x) =>
            new Observable<string>((subscriber) => {
              subscriber.complete();
              return () => {
                unsubbed.push(x);
              };
            })
        )
      )
      .subscribe();

    expect(unsubbed).to.deep.equal(['a', 'b']);
  });

  it('should switch inner cold observables', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const x = cold('           --a--b--c--d--e--|           ');
      const xsubs = '   ---------^---------!                  ';
      const y = cold('                     ---f---g---h---i--|');
      const ysubs = '   -------------------^-----------------!';
      const e1 = hot('  ---------x---------y---------|        ');
      const e1subs = '  ^----------------------------!        ';
      const expected = '-----------a--b--c----f---g---h---i--|';

      const observableLookup: Record<string, Observable<string>> = { x: x, y: y };

      const result = e1.pipe(switchMap((value) => observableLookup[value]));

      expectObservable(result).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should raise error when projection throws', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -------x-----y---|');
      const e1subs = '  ^------!          ';
      const expected = '-------#          ';
      function project(): any[] {
        throw 'error';
      }

      expectObservable(e1.pipe(switchMap(project))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should switch inner cold observables, outer is unsubscribed early', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const x = cold('           --a--b--c--d--e--|           ');
      const xsubs = '   ---------^---------!                  ';
      const y = cold('                     ---f---g---h---i--|');
      const ysubs = '   -------------------^-!                ';
      const e1 = hot('  ---------x---------y---------|        ');
      const e1subs = '  ^--------------------!                ';
      const unsub = '   ---------------------!                ';
      const expected = '-----------a--b--c----                ';

      const observableLookup: Record<string, Observable<string>> = { x: x, y: y };

      const result = e1.pipe(switchMap((value) => observableLookup[value]));

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const x = cold('           --a--b--c--d--e--|           ');
      const xsubs = '   ---------^---------!                  ';
      const y = cold('                     ---f---g---h---i--|');
      const ysubs = '   -------------------^-!                ';
      const e1 = hot('  ---------x---------y---------|        ');
      const e1subs = '  ^--------------------!                ';
      const expected = '-----------a--b--c----                ';
      const unsub = '   ---------------------!                ';

      const observableLookup: Record<string, Observable<string>> = { x: x, y: y };

      const result = e1.pipe(
        mergeMap((x) => of(x)),
        switchMap((value) => observableLookup[value]),
        mergeMap((x) => of(x))
      );

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not break unsubscription chains with interop inners when result is unsubscribed explicitly', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const x = cold('           --a--b--c--d--e--|           ');
      const xsubs = '   ---------^---------!                  ';
      const y = cold('                     ---f---g---h---i--|');
      const ysubs = '   -------------------^-!                ';
      const e1 = hot('  ---------x---------y---------|        ');
      const e1subs = '  ^--------------------!                ';
      const expected = '-----------a--b--c----                ';
      const unsub = '   ---------------------!                ';

      const observableLookup: Record<string, Observable<string>> = { x: x, y: y };

      // This test is the same as the previous test, but the observable is
      // manipulated to make it look like an interop observable - an observable
      // from a foreign library. Interop subscribers are treated differently:
      // they are wrapped in a safe subscriber. This test ensures that
      // unsubscriptions are chained all the way to the interop subscriber.

      const result = e1.pipe(
        mergeMap((x) => of(x)),
        switchMap((value) => asInteropObservable(observableLookup[value])),
        mergeMap((x) => of(x))
      );

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
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

    of(null)
      .pipe(
        switchMap(() => synchronousObservable),
        takeWhile((x) => x != 2) // unsubscribe at the second side-effect
      )
      .subscribe(() => {
        /* noop */
      });

    expect(sideEffects).to.deep.equal([1, 2]);
  });

  it('should switch inner cold observables, inner never completes', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const x = cold('           --a--b--c--d--e--|          ');
      const xsubs = '   ---------^---------!                 ';
      const y = cold('                     ---f---g---h---i--');
      const ysubs = '   -------------------^                 ';
      const e1 = hot('  ---------x---------y---------|       ');
      const e1subs = '  ^----------------------------!       ';
      const expected = '-----------a--b--c----f---g---h---i--';

      const observableLookup: Record<string, Observable<string>> = { x: x, y: y };

      const result = e1.pipe(switchMap((value) => observableLookup[value]));

      expectObservable(result).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should handle a synchronous switch to the second inner observable', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const x = cold('           --a--b--c--d--e--|   ');
      const xsubs = '   ---------(^!)                 ';
      const y = cold('           ---f---g---h---i--|  ');
      const ysubs = '   ---------^-----------------!  ';
      const e1 = hot('  ---------(xy)----------------|');
      const e1subs = '  ^----------------------------!';
      const expected = '------------f---g---h---i----|';

      const observableLookup: Record<string, Observable<string>> = { x: x, y: y };

      const result = e1.pipe(switchMap((value) => observableLookup[value]));

      expectObservable(result).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should switch inner cold observables, one inner throws', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const x = cold('           --a--b--#--d--e--|          ');
      const xsubs = '   ---------^-------!                   ';
      const y = cold('                     ---f---g---h---i--');
      const ysubs = '                                        ';
      const e1 = hot('  ---------x---------y---------|       ');
      const e1subs = '  ^----------------!                   ';
      const expected = '-----------a--b--#                   ';

      const observableLookup: Record<string, Observable<string>> = { x: x, y: y };

      const result = e1.pipe(switchMap((value) => observableLookup[value]));

      expectObservable(result).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should switch inner hot observables', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const x = hot('   -----a--b--c--d--e--|                 ');
      const xsubs = '   ---------^---------!                  ';
      const y = hot('   --p-o-o-p-------------f---g---h---i--|');
      const ysubs = '   -------------------^-----------------!';
      const e1 = hot('  ---------x---------y---------|        ');
      const e1subs = '  ^----------------------------!        ';
      const expected = '-----------c--d--e----f---g---h---i--|';

      const observableLookup: Record<string, Observable<string>> = { x: x, y: y };

      const result = e1.pipe(switchMap((value) => observableLookup[value]));

      expectObservable(result).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should switch inner empty and empty', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const x = cold('           |                    ');
      const y = cold('                     |          ');
      const xsubs = '   ---------(^!)                 ';
      const ysubs = '   -------------------(^!)       ';
      const e1 = hot('  ---------x---------y---------|');
      const e1subs = '  ^----------------------------!';
      const expected = '-----------------------------|';

      const observableLookup: Record<string, Observable<string>> = { x: x, y: y };

      const result = e1.pipe(switchMap((value) => observableLookup[value]));

      expectObservable(result).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should switch inner empty and never', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const x = cold('           |                    ');
      const y = cold('                     -          ');
      const xsubs = '   ---------(^!)                 ';
      const ysubs = '   -------------------^          ';
      const e1 = hot('  ---------x---------y---------|');
      const e1subs = '  ^----------------------------!';
      const expected = '------------------------------';

      const observableLookup: Record<string, Observable<string>> = { x: x, y: y };

      const result = e1.pipe(switchMap((value) => observableLookup[value]));

      expectObservable(result).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should switch inner never and empty', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const x = cold('           -                    ');
      const y = cold('                     |          ');
      const xsubs = '   ---------^---------!          ';
      const ysubs = '   -------------------(^!)       ';
      const e1 = hot('  ---------x---------y---------|');
      const e1subs = '  ^----------------------------!';
      const expected = '-----------------------------|';

      const observableLookup: Record<string, Observable<string>> = { x: x, y: y };

      const result = e1.pipe(switchMap((value) => observableLookup[value]));

      expectObservable(result).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should switch inner never and throw', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const x = cold('           -                    ');
      const y = cold('                     #          ', undefined, 'sad');
      const xsubs = '   ---------^---------!          ';
      const ysubs = '   -------------------(^!)       ';
      const e1 = hot('  ---------x---------y---------|');
      const e1subs = '  ^------------------!          ';
      const expected = '-------------------#          ';

      const observableLookup: Record<string, Observable<string>> = { x: x, y: y };

      const result = e1.pipe(switchMap((value) => observableLookup[value]));

      expectObservable(result).toBe(expected, undefined, 'sad');
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should switch inner empty and throw', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const x = cold('           |                    ');
      const y = cold('                     #          ', undefined, 'sad');
      const xsubs = '   ---------(^!)                 ';
      const ysubs = '   -------------------(^!)       ';
      const e1 = hot('  ---------x---------y---------|');
      const e1subs = '  ^------------------!          ';
      const expected = '-------------------#          ';

      const observableLookup: Record<string, Observable<string>> = { x: x, y: y };

      const result = e1.pipe(switchMap((value) => observableLookup[value]));

      expectObservable(result).toBe(expected, undefined, 'sad');
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should handle outer empty', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' |   ');
      const e1subs = '  (^!)';
      const expected = '|   ';

      const result = e1.pipe(switchMap((value) => of(value)));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should handle outer never', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' -');
      const e1subs = '  ^';
      const expected = '-';

      const result = e1.pipe(switchMap((value) => of(value)));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should handle outer throw', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' #   ');
      const e1subs = '  (^!)';
      const expected = '#   ';

      const result = e1.pipe(switchMap((value) => of(value)));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should handle outer error', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const x = cold('           --a--b--c--d--e--|');
      const xsubs = '   ---------^---------!       ';
      const e1 = hot('  ---------x---------#       ');
      const e1subs = '  ^------------------!       ';
      const expected = '-----------a--b--c-#       ';

      const observableLookup: Record<string, Observable<string>> = { x: x };

      const result = e1.pipe(switchMap((value) => observableLookup[value]));

      expectObservable(result).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
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

    synchronousObservable
      .pipe(
        switchMap((value) => of(value)),
        take(3)
      )
      .subscribe(() => {
        /* noop */
      });

    expect(sideEffects).to.deep.equal([0, 1, 2]);
  });

  it('should unsubscribe previous inner sub when getting synchronously reentrance during subscribing the inner sub', () => {
    const e = new BehaviorSubject(1);
    const results: Array<number> = [];

    e.pipe(
      take(3),
      switchMap(
        (value) =>
          new Observable<number>((subscriber) => {
            e.next(value + 1);
            subscriber.next(value);
          })
      )
    ).subscribe((value) => results.push(value));

    expect(results).to.deep.equal([3]);
  });
});
