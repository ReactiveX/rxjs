import { expect } from 'chai';
import { expand, mergeMap, map } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { hot, cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';
import { Subscribable, EMPTY, Observable, of, Observer } from 'rxjs';

declare function asDiagram(arg: string): Function;
declare const type: Function;

declare const rxTestScheduler: TestScheduler;

/** @test {expand} */
describe('expand operator', () => {
  asDiagram('expand(x => x === 8 ? empty : \u2014\u20142*x\u2014| )')
  ('should recursively map-and-flatten each item to an Observable', () => {
    const e1 =    hot('--x----|  ', {x: 1});
    const e1subs =    '^      !  ';
    const e2 =   cold(  '--c|    ', {c: 2});
    const expected =  '--a-b-c-d|';
    const values = {a: 1, b: 2, c: 4, d: 8};

    const result = e1.pipe(expand(x => x === 8 ? EMPTY : e2.pipe(map(c => c * x))));

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should work with scheduler', () => {
    const e1 =    hot('--x----|  ', {x: 1});
    const e1subs =    '^      !  ';
    const e2 =   cold(  '--c|    ', {c: 2});
    const expected =  '--a-b-c-d|';
    const values = {a: 1, b: 2, c: 4, d: 8};

    const result = e1.pipe(expand(x => x === 8 ? EMPTY : e2.pipe(map(c => c * x)), Number.POSITIVE_INFINITY, rxTestScheduler));

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should map and recursively flatten', () => {
    const values = {
      a: 1,
      b: 1 + 1, // a + a,
      c: 2 + 2, // b + b,
      d: 4 + 4, // c + c,
      e: 8 + 8, // d + d
    };
    const e1 =   hot('(a|)', values);
    const e1subs =   '(^!)            ';
    const e2shape =  '---(z|)         ';
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

    const result = e1.pipe(expand((x, index): Observable<any> => {
      if (x === 16) {
        return EMPTY;
      } else {
        return cold(e2shape, { z: x + x });
      }
    }));

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should map and recursively flatten, and handle event raised error', () => {
    const values = {
      a: 1,
      b: 1 + 1, // a + a,
      c: 2 + 2, // b + b,
      d: 4 + 4, // c + c,
      e: 8 + 8, // d + d
    };
    const e1 =   hot('(a|)', values);
    const e1subs =   '(^!)         ';
    const e2shape =  '---(z|)      ';
    const expected = 'a--b--c--(d#)';

    const result = e1.pipe(expand((x) => {
      if (x === 8) {
        return cold<number>('#');
      }
      return cold(e2shape, { z: x + x });
    }));

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should map and recursively flatten, and propagate error thrown from projection', () => {
    const values = {
      a: 1,
      b: 1 + 1, // a + a,
      c: 2 + 2, // b + b,
      d: 4 + 4, // c + c,
      e: 8 + 8, // d + d
    };
    const e1 =   hot('(a|)', values);
    const e1subs =   '(^!)         ';
    const e2shape =  '---(z|)      ';
    const expected = 'a--b--c--(d#)';

    const result = e1.pipe(expand((x) => {
      if (x === 8) {
        throw 'error';
      }
      return cold(e2shape, { z: x + x });
    }));

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should allow unsubscribing early', () => {
    const values = {
      a: 1,
      b: 1 + 1, // a + a,
      c: 2 + 2, // b + b,
      d: 4 + 4, // c + c,
      e: 8 + 8, // d + d
    };
    const e1 =   hot('(a|)', values);
    const unsub =    '       !  ';
    const e1subs =   '(^!)      ';
    const e2shape =  '---(z|)   ';
    const expected = 'a--b--c-  ';

    const result = e1.pipe(expand((x): Observable<any> => {
      if (x === 16) {
        return EMPTY;
      }
      return cold(e2shape, { z: x + x });
    }));

    expectObservable(result, unsub).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    const values = {
      a: 1,
      b: 1 + 1, // a + a,
      c: 2 + 2, // b + b,
      d: 4 + 4, // c + c,
      e: 8 + 8, // d + d
    };
    const e1 =   hot('(a|)', values);
    const e1subs =   '(^!)      ';
    const e2shape =  '---(z|)   ';
    const expected = 'a--b--c-  ';
    const unsub =    '       !  ';

    const result = e1.pipe(
      mergeMap((x) => of(x)),
      expand((x): Observable<any> => {
        if (x === 16) {
          return EMPTY;
        }
        return cold(e2shape, { z: x + x });
      }),
      mergeMap((x) => of(x))
    );

    expectObservable(result, unsub).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should allow concurrent expansions', () => {
    const values = {
      a: 1,
      b: 1 + 1, // a + a,
      c: 2 + 2, // b + b,
      d: 4 + 4, // c + c,
      e: 8 + 8, // d + d
    };
    const e1 =   hot('a-a|              ', values);
    const e1subs =   '^  !              ';
    const e2shape =  '---(z|)           ';
    const expected = 'a-ab-bc-cd-de-(e|)';

    const result = e1.pipe(expand((x): Observable<any> => {
      if (x === 16) {
        return EMPTY;
      }
      return cold(e2shape, { z: x + x });
    }));

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should allow configuring the concurrency limit parameter to 1', () => {
    const values = {
      a: 1,
      b: 1 + 1, // a + a,
      c: 2 + 2, // b + b,
      d: 4 + 4, // c + c,
      e: 8 + 8, // d + d
      u: 10,
      v: 20,  // u + u
      x: 40,  // v + v
      y: 80,  // x + x
      z: 160, // y + y
    };
    const e1 =   hot('a-u|', values);
    const e2shape =  '---(z|)';
    //                 ---(z|)
    //                    ---(z|)
    //                       ---(z|)
    //                          ---(z|)
    //                             ---(z|)
    //                                ---(z|)
    //                                   ---(z|)
    // Notice how for each column, there is at most 1 `-` character.
    const e1subs =   '^  !                         ';
    const expected = 'a--u--b--v--c--x--d--y--(ez|)';
    const concurrencyLimit = 1;

    const result = e1.pipe(expand((x): Observable<any> => {
      if (x === 16 || x === 160) {
        return EMPTY;
      }
      return cold(e2shape, { z: x + x });
    }, concurrencyLimit));

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should allow configuring the concurrency limit parameter to 2', () => {
    const values = {
      a: 1,
      b: 1 + 1, // a + a,
      c: 2 + 2, // b + b,
      u: 10,
      v: 20,  // u + u
      x: 40,  // v + v
    };
    const e1 =   hot('a---au|', values);
    const e2shape =  '------(z|)';
    //                  ------(z|)
    //                    ------(z|)
    //                        ------(z|)
    //                          ------(z|)
    //                              ------(z|)
    //                                ------(z|)
    // Notice how for each column, there is at most 2 `-` characters.
    const e1subs =   '^     !                   ';
    const expected = 'a---a-u---b-b---v-(cc)(x|)';
    const concurrencyLimit = 2;

    const result = e1.pipe(expand((x): Observable<any> => {
      if (x === 4 || x === 40) {
        return EMPTY;
      }
      return cold(e2shape, { z: x + x });
    }, concurrencyLimit));

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should ignore concurrency limit if it is not passed', () => {
    const values = {
      a: 1,
      b: 1 + 1, // a + a,
      c: 2 + 2, // b + b,
      d: 4 + 4, // c + c,
      e: 8 + 8, // d + d
      u: 10,
      v: 20,  // u + u
      x: 40,  // v + v
      y: 80,  // x + x
      z: 160, // y + y
    };
    const e1 =   hot('a-u|              ', values);
    const e1subs =   '^  !              ';
    const e2shape =  '---(z|)           ';
    const expected = 'a-ub-vc-xd-ye-(z|)';
    const concurrencyLimit = 100;

    const result = e1.pipe(expand((x): Observable<any> => {
      if (x === 16 || x === 160) {
        return EMPTY;
      }
      return cold(e2shape, { z: x + x });
    }, concurrencyLimit));

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should map and recursively flatten with scalars', () => {
    const values = {
      a: 1,
      b: 1 + 1, // a + a,
      c: 2 + 2, // b + b,
      d: 4 + 4, // c + c,
      e: 8 + 8, // d + d
    };
    const e1 =   hot('(a|)', values);
    const e1subs =   '(^!)';
    const expected = '(abcde|)';

    const result = e1.pipe(expand((x) => {
      if (x === 16) {
        return EMPTY;
      }
      return of(x + x); // scalar
    }));

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should recursively flatten promises', (done) => {
    const expected = [1, 2, 4, 8, 16];
    of(1).pipe(
      expand((x): any => {
        if (x === 16) {
          return EMPTY;
        }
        return Promise.resolve(x + x);
      })
    ).subscribe((x) => {
        expect(x).to.equal(expected.shift());
      }, null, () => {
        expect(expected.length).to.equal(0);
        done();
      });
  });

  it('should recursively flatten Arrays', (done) => {
    const expected = [1, 2, 4, 8, 16];
    of(1).pipe(
      expand((x): any => {
        if (x === 16) {
          return EMPTY;
        }
        return [x + x];
      })
    ).subscribe((x) => {
        expect(x).to.equal(expected.shift());
      }, null, () => {
        expect(expected.length).to.equal(0);
        done();
      });
  });

  it('should recursively flatten lowercase-o observables', (done) => {
    const expected = [1, 2, 4, 8, 16];
    const project = (x: number, index: number): Subscribable<number> => {
      if (x === 16) {
        return <any>EMPTY;
      }

      const ish = {
        subscribe: (observer: Observer<number>) => {
          observer.next(x + x);
          observer.complete();
        }
      };

      ish[Symbol.observable] = function () {
        return this;
      };
      return <Subscribable<number>> ish;
    };

    of(1).pipe(
      expand(project)
    ).subscribe((x) => {
        expect(x).to.equal(expected.shift());
      }, null, () => {
        expect(expected.length).to.equal(0);
        done();
      });
  });

  it('should work when passing undefined for the optional arguments', () => {
    const values = {
      a: 1,
      b: 1 + 1, // a + a,
      c: 2 + 2, // b + b,
      d: 4 + 4, // c + c,
      e: 8 + 8, // d + d
    };
    const e1 =   hot('(a|)', values);
    const e1subs =   '(^!)            ';
    const e2shape =  '---(z|)         ';
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
