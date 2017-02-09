import {expect} from 'chai';
import * as Rx from '../../dist/cjs/Rx';
import marbleTestingSignature = require('../helpers/marble-testing'); // tslint:disable-line:no-require-imports

declare const { asDiagram };
declare const hot: typeof marbleTestingSignature.hot;
declare const cold: typeof marbleTestingSignature.cold;
declare const expectObservable: typeof marbleTestingSignature.expectObservable;
declare const expectSubscriptions: typeof marbleTestingSignature.expectSubscriptions;

declare const Symbol: any;
declare const rxTestScheduler: Rx.TestScheduler;
const Observable = Rx.Observable;

/** @test {expand} */
describe('Observable.prototype.expand', () => {
  asDiagram('expand(x => x === 8 ? empty : \u2014\u20142*x\u2014| )')
  ('should recursively map-and-flatten each item to an Observable', () => {
    const e1 =    hot('--x----|  ', {x: 1});
    const e1subs =    '^        !';
    const e2 =   cold(  '--c|    ', {c: 2});
    const expected =  '--a-b-c-d|';
    const values = {a: 1, b: 2, c: 4, d: 8};

    const result = e1.expand(x => x === 8 ? Observable.empty() : e2.map(c => c * x));

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should work with scheduler', () => {
    const e1 =    hot('--x----|  ', {x: 1});
    const e1subs =    '^        !';
    const e2 =   cold(  '--c|    ', {c: 2});
    const expected =  '--a-b-c-d|';
    const values = {a: 1, b: 2, c: 4, d: 8};

    const result = e1.expand(x => x === 8 ? Observable.empty() : e2.map(c => c * x), Number.POSITIVE_INFINITY, rxTestScheduler);

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
    const e1subs =   '^           !   ';
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

    const result = e1.expand((x: any, index: number): Rx.Observable<any> => {
      if (x === 16) {
        return Observable.empty();
      } else {
        return cold(e2shape, { z: x + x });
      }
    });

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
    const e1subs =   '^        !   ';
    const e2shape =  '---(z|)      ';
    const expected = 'a--b--c--(d#)';

    const result = e1.expand((x: number) => {
      if (x === 8) {
        return cold('#');
      }
      return cold(e2shape, { z: x + x });
    });

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
    const e1subs =   '^        !   ';
    const e2shape =  '---(z|)      ';
    const expected = 'a--b--c--(d#)';

    const result = e1.expand((x: number) => {
      if (x === 8) {
        throw 'error';
      }
      return cold(e2shape, { z: x + x });
    });

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
    const e1subs =   '^      !  ';
    const e2shape =  '---(z|)   ';
    const expected = 'a--b--c-  ';

    const result = e1.expand((x: number): Rx.Observable<any> => {
      if (x === 16) {
        return Observable.empty();
      }
      return cold(e2shape, { z: x + x });
    });

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
    const e1subs =   '^      !  ';
    const e2shape =  '---(z|)   ';
    const expected = 'a--b--c-  ';
    const unsub =    '       !  ';

    const result = (<any>e1)
      .mergeMap((x: any) => Observable.of(x))
      .expand((x: number): Rx.Observable<any> => {
        if (x === 16) {
          return Observable.empty();
        }
        return cold(e2shape, { z: x + x });
      })
      .mergeMap((x: any) => Observable.of(x));

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
    const e1subs =   '^             !   ';
    const e2shape =  '---(z|)           ';
    const expected = 'a-ab-bc-cd-de-(e|)';

    const result = e1.expand((x: number): Rx.Observable<any> => {
      if (x === 16) {
        return Observable.empty();
      }
      return cold(e2shape, { z: x + x });
    });

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
    const e1subs =   '^                       !    ';
    const expected = 'a--u--b--v--c--x--d--y--(ez|)';
    const concurrencyLimit = 1;

    const result = e1.expand((x: number): Rx.Observable<any> => {
      if (x === 16 || x === 160) {
        return Observable.empty();
      }
      return cold(e2shape, { z: x + x });
    }, concurrencyLimit);

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
    const e1subs =   '^                     !   ';
    const expected = 'a---a-u---b-b---v-(cc)(x|)';
    const concurrencyLimit = 2;

    const result = e1.expand((x: number): Rx.Observable<any> => {
      if (x === 4 || x === 40) {
        return Observable.empty();
      }
      return cold(e2shape, { z: x + x });
    }, concurrencyLimit);

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
    const e1subs =   '^             !   ';
    const e2shape =  '---(z|)           ';
    const expected = 'a-ub-vc-xd-ye-(z|)';
    const concurrencyLimit = 100;

    const result = e1.expand((x: number): Rx.Observable<any> => {
      if (x === 16 || x === 160) {
        return Observable.empty();
      }
      return cold(e2shape, { z: x + x });
    }, concurrencyLimit);

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

    const result = e1.expand((x: number) => {
      if (x === 16) {
        return Observable.empty();
      }
      return Observable.of(x + x); // scalar
    });

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should recursively flatten promises', (done: MochaDone) => {
    const expected = [1, 2, 4, 8, 16];
    Observable.of(1)
      .expand((x: number): any => {
        if (x === 16) {
          return Observable.empty();
        }
        return Promise.resolve(x + x);
      })
      .subscribe((x: number) => {
        expect(x).to.equal(expected.shift());
      }, null, () => {
        expect(expected.length).to.equal(0);
        done();
      });
  });

  it('should recursively flatten Arrays', (done: MochaDone) => {
    const expected = [1, 2, 4, 8, 16];
    Observable.of(1)
      .expand((x: number): any => {
        if (x === 16) {
          return Observable.empty();
        }
        return [x + x];
      })
      .subscribe((x: number) => {
        expect(x).to.equal(expected.shift());
      }, null, () => {
        expect(expected.length).to.equal(0);
        done();
      });
  });

  it('should recursively flatten lowercase-o observables', (done: MochaDone) => {
    const expected = [1, 2, 4, 8, 16];
    const project = (x: any, index: number) => {
      if (x === 16) {
        return Observable.empty();
      }

      const ish = {
        subscribe: (observer: Rx.Observer<number>) => {
          observer.next(x + x);
          observer.complete();
        }
      };

      ish[Symbol.observable] = function () {
        return this;
      };
      return ish;
    };

    (<any>Observable.of(1))
      .expand(project)
      .subscribe((x: number) => {
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
    const e1subs =   '^           !   ';
    const e2shape =  '---(z|)         ';
    const expected = 'a--b--c--d--(e|)';

    const project = (x: any, index: number): Rx.Observable<any> => {
      if (x === 16) {
        return Observable.empty();
      }
      return cold(e2shape, { z: x + x });
    };

    const result = e1.expand(project, undefined, undefined);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });
});
