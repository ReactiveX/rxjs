/** @prettier */
import { expect } from 'chai';
import { expand, mergeMap, map, take, toArray } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { EMPTY, Observable, of, Observer, asapScheduler, asyncScheduler, InteropObservable } from 'rxjs';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {expand} */
describe('expand', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(observableMatcher);
  });

  it('should recursively map-and-flatten each item to an Observable', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --x----|  ', { x: 1 });
      const e1subs = '  ^------!  ';
      const e2 = cold('   --c|    ', { c: 2 });
      //                    --c|
      //                      --c|
      const expected = '--a-b-c-d|';
      const values = { a: 1, b: 2, c: 4, d: 8 };

      const result = e1.pipe(expand((x) => (x === 8 ? EMPTY : e2.pipe(map((c) => c * x)))));

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should work with scheduler', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --x----|  ', { x: 1 });
      const e1subs = '  ^------!  ';
      const e2 = cold('   --c|    ', { c: 2 });
      //                    --c|
      //                      --c|
      const expected = '--a-b-c-d|';
      const values = { a: 1, b: 2, c: 4, d: 8 };

      const result = e1.pipe(expand((x) => (x === 8 ? EMPTY : e2.pipe(map((c) => c * x))), Infinity, testScheduler));

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should map and recursively flatten', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const values = {
        a: 1,
        b: 1 + 1, // a + a,
        c: 2 + 2, // b + b,
        d: 4 + 4, // c + c,
        e: 8 + 8, // d + d
      };
      const e1 = hot('  (a|)            ', values);
      const e1subs = '  (^!)            ';
      const e2shape = ' ---(z|)         ';
      const expected = 'a--b--c--d--(e|)';
      /*
        expectation explanation: (conjunction junction?) ...

        since `cold('---(z|)')` emits `x + x` and completes on frame 30
        but the next "expanded" return value is synchronously subscribed to in
        that same frame, it stacks like so:

        a
        ---(b|)
           ---(c|)
              ---(d|)
                 ---(e|)      (...which flattens into:)
        a--b--c--d--(e|)
      */

      const result = e1.pipe(
        expand(
          (x, index): Observable<any> => {
            if (x === 16) {
              return EMPTY;
            } else {
              return cold(e2shape, { z: x + x });
            }
          }
        )
      );

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should map and recursively flatten, and handle event raised error', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const values = {
        a: 1,
        b: 1 + 1, // a + a,
        c: 2 + 2, // b + b,
        d: 4 + 4, // c + c,
        e: 8 + 8, // d + d
      };
      const e1 = hot('  (a|)         ', values);
      const e1subs = '  (^!)         ';
      const e2shape = ' ---(z|)      ';
      const expected = 'a--b--c--(d#)';

      const result = e1.pipe(
        expand((x) => {
          if (x === 8) {
            return cold<number>('#');
          }
          return cold(e2shape, { z: x + x });
        })
      );

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should map and recursively flatten, and propagate error thrown from projection', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const values = {
        a: 1,
        b: 1 + 1, // a + a,
        c: 2 + 2, // b + b,
        d: 4 + 4, // c + c,
        e: 8 + 8, // d + d
      };
      const e1 = hot('  (a|)         ', values);
      const e1subs = '  (^!)         ';
      const e2shape = ' ---(z|)      ';
      const expected = 'a--b--c--(d#)';

      const result = e1.pipe(
        expand((x) => {
          if (x === 8) {
            throw 'error';
          }
          return cold(e2shape, { z: x + x });
        })
      );

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should allow unsubscribing early', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const values = {
        a: 1,
        b: 1 + 1, // a + a,
        c: 2 + 2, // b + b,
        d: 4 + 4, // c + c,
        e: 8 + 8, // d + d
      };
      const e1 = hot('  (a|)    ', values);
      const unsub = '   -------!';
      const e1subs = '  (^!)    ';
      const e2shape = ' ---(z|) ';
      const expected = 'a--b--c-';

      const result = e1.pipe(
        expand(
          (x): Observable<any> => {
            if (x === 16) {
              return EMPTY;
            }
            return cold(e2shape, { z: x + x });
          }
        )
      );

      expectObservable(result, unsub).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const values = {
        a: 1,
        b: 1 + 1, // a + a,
        c: 2 + 2, // b + b,
        d: 4 + 4, // c + c,
        e: 8 + 8, // d + d
      };
      const e1 = hot('  (a|)    ', values);
      const e1subs = '  (^!)    ';
      const e2shape = ' ---(z|) ';
      const expected = 'a--b--c-';
      const unsub = '   -------!';

      const result = e1.pipe(
        mergeMap((x) => of(x)),
        expand(
          (x): Observable<any> => {
            if (x === 16) {
              return EMPTY;
            }
            return cold(e2shape, { z: x + x });
          }
        ),
        mergeMap((x) => of(x))
      );

      expectObservable(result, unsub).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should allow concurrent expansions', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const values = {
        a: 1,
        b: 1 + 1, // a + a,
        c: 2 + 2, // b + b,
        d: 4 + 4, // c + c,
        e: 8 + 8, // d + d
      };
      const e1 = hot('  a-a|              ', values);
      const e1subs = '  ^--!              ';
      const e2shape = ' ---(z|)           ';
      const expected = 'a-ab-bc-cd-de-(e|)';

      const result = e1.pipe(
        expand(
          (x): Observable<any> => {
            if (x === 16) {
              return EMPTY;
            }
            return cold(e2shape, { z: x + x });
          }
        )
      );

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should allow configuring the concurrency limit parameter to 1', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const values = {
        a: 1,
        b: 1 + 1, // a + a,
        c: 2 + 2, // b + b,
        d: 4 + 4, // c + c,
        e: 8 + 8, // d + d
        u: 10,
        v: 20, // u + u
        x: 40, // v + v
        y: 80, // x + x
        z: 160, // y + y
      };
      const e1 = hot('  a-u|                         ', values);
      const e1subs = '  ^--!                         ';
      const e2shape = ' ---(z|)                      ';
      //                 ---(z|)
      //                    ---(z|)
      //                       ---(z|)
      //                          ---(z|)
      //                             ---(z|)
      //                                ---(z|)
      //                                   ---(z|)
      // Notice how for each column, there is at most 1 `-` character.
      const expected = 'a--u--b--v--c--x--d--y--(ez|)';
      const concurrencyLimit = 1;

      const result = e1.pipe(
        expand((x): Observable<any> => {
          if (x === 16 || x === 160) {
            return EMPTY;
          }
          return cold(e2shape, { z: x + x });
        }, concurrencyLimit)
      );

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should allow configuring the concurrency limit parameter to 2', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const values = {
        a: 1,
        b: 1 + 1, // a + a,
        c: 2 + 2, // b + b,
        u: 10,
        v: 20, // u + u
        x: 40, // v + v
      };
      const e1 = hot('  a---au|                   ', values);
      const e1subs = '  ^-----!                   ';
      const e2shape = ' ------(z|)                ';
      //                  ------(z|)
      //                    ------(z|)
      //                        ------(z|)
      //                          ------(z|)
      //                              ------(z|)
      //                                ------(z|)
      // Notice how for each column, there is at most 2 `-` characters.
      const expected = 'a---a-u---b-b---v-(cc)(x|)';
      const concurrencyLimit = 2;

      const result = e1.pipe(
        expand((x): Observable<any> => {
          if (x === 4 || x === 40) {
            return EMPTY;
          }
          return cold(e2shape, { z: x + x });
        }, concurrencyLimit)
      );

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should ignore concurrency limit if it is not passed', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const values = {
        a: 1,
        b: 1 + 1, // a + a,
        c: 2 + 2, // b + b,
        d: 4 + 4, // c + c,
        e: 8 + 8, // d + d
        u: 10,
        v: 20, // u + u
        x: 40, // v + v
        y: 80, // x + x
        z: 160, // y + y
      };
      const e1 = hot('  a-u|              ', values);
      const e1subs = '  ^--!              ';
      const e2shape = ' ---(z|)           ';
      const expected = 'a-ub-vc-xd-ye-(z|)';
      const concurrencyLimit = 100;

      const result = e1.pipe(
        expand((x): Observable<any> => {
          if (x === 16 || x === 160) {
            return EMPTY;
          }
          return cold(e2shape, { z: x + x });
        }, concurrencyLimit)
      );

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should map and recursively flatten with scalars', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const values = {
        a: 1,
        b: 1 + 1, // a + a,
        c: 2 + 2, // b + b,
        d: 4 + 4, // c + c,
        e: 8 + 8, // d + d
      };
      const e1 = hot('  (a|)    ', values);
      const e1subs = '  (^!)    ';
      const expected = '(abcde|)';

      const result = e1.pipe(
        expand((x) => {
          if (x === 16) {
            return EMPTY;
          }
          return of(x + x); // scalar
        })
      );

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should recursively flatten promises', (done) => {
    const expected = [1, 2, 4, 8, 16];
    of(1)
      .pipe(
        expand((x): any => {
          if (x === 16) {
            return EMPTY;
          }
          return Promise.resolve(x + x);
        })
      )
      .subscribe(
        (x) => {
          expect(x).to.equal(expected.shift());
        },
        null,
        () => {
          expect(expected.length).to.equal(0);
          done();
        }
      );
  });

  it('should recursively flatten Arrays', (done) => {
    const expected = [1, 2, 4, 8, 16];
    of(1)
      .pipe(
        expand((x): any => {
          if (x === 16) {
            return EMPTY;
          }
          return [x + x];
        })
      )
      .subscribe(
        (x) => {
          expect(x).to.equal(expected.shift());
        },
        null,
        () => {
          expect(expected.length).to.equal(0);
          done();
        }
      );
  });

  it('should recursively flatten lowercase-o observables', (done) => {
    const expected = [1, 2, 4, 8, 16];
    const project = (x: number): InteropObservable<number> => {
      if (x === 16) {
        return EMPTY as any;
      }

      return {
        subscribe(observer: Observer<number>) {
          observer.next(x + x);
          observer.complete();
        },
        [Symbol.observable]() {
          return this;
        },
      } as any;
    };

    of(1)
      .pipe(expand(project))
      .subscribe(
        (x) => {
          expect(x).to.equal(expected.shift());
        },
        null,
        () => {
          expect(expected.length).to.equal(0);
          done();
        }
      );
  });

  it('should work when passing undefined for the optional arguments', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const values = {
        a: 1,
        b: 1 + 1, // a + a,
        c: 2 + 2, // b + b,
        d: 4 + 4, // c + c,
        e: 8 + 8, // d + d
      };
      const e1 = hot('  (a|)            ', values);
      const e1subs = '  (^!)            ';
      const e2shape = ' ---(z|)         ';
      const expected = 'a--b--c--d--(e|)';

      const project = (x: any, index: number): Observable<any> => {
        if (x === 16) {
          return EMPTY;
        }
        return cold(e2shape, { z: x + x });
      };

      const result = e1.pipe(expand(project, undefined, undefined));

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should work with the AsapScheduler', (done) => {
    const expected = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    of(0)
      .pipe(
        expand((x) => of(x + 1), Infinity, asapScheduler),
        take(10),
        toArray()
      )
      .subscribe((actual) => expect(actual).to.deep.equal(expected), done, done);
  });

  it('should work with the AsyncScheduler', (done) => {
    const expected = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    of(0)
      .pipe(
        expand((x) => of(x + 1), Infinity, asyncScheduler),
        take(10),
        toArray()
      )
      .subscribe((actual) => expect(actual).to.deep.equal(expected), done, done);
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
        expand(() => EMPTY),
        take(3)
      )
      .subscribe(() => {
        /* noop */
      });

    expect(sideEffects).to.deep.equal([0, 1, 2]);
  });
});
