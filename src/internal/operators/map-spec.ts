import { expect } from 'chai';
import { map, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { assertDeepEquals } from 'rxjs/internal/test_helpers/assertDeepEquals';

// function shortcuts
const addDrama = function (x: number | string) { return x + '!'; };
const identity = function <T>(x: T) { return x; };

/** @test {map} */
describe('map operator', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(assertDeepEquals);
  });

  //asDiagram('map(x => 10 * x)')
  it('should map multiple values', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptionsTo }) => {
      const a =   cold('--1--2--3--|');
      const asubs =    '^          !';
      const expected = '--x--y--z--|';

      const r = a.pipe(map(function (x) { return 10 * (+x); }));

      expectObservable(r).toBe(expected, {x: 10, y: 20, z: 30});
      expectSubscriptionsTo(a).toBe(asubs);
    });
  });

  it('should map one value', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptionsTo }) => {
      const a =   cold('--x--|', {x: 42});
      const asubs =    '^    !';
      const expected = '--y--|';

      const r = a.pipe(map(addDrama));

      expectObservable(r).toBe(expected, {y: '42!'});
      expectSubscriptionsTo(a).toBe(asubs);
    });
  });

  it('should map multiple values', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptionsTo }) => {
      const a =   cold('--1--2--3--|');
      const asubs =    '^          !';
      const expected = '--x--y--z--|';

      const r = a.pipe(map(addDrama));

      expectObservable(r).toBe(expected, {x: '1!', y: '2!', z: '3!'});
      expectSubscriptionsTo(a).toBe(asubs);
    });
  });

  it('should propagate errors from map function', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptionsTo }) => {
      const a =   cold('--x--|', {x: 42});
      const asubs =    '^ !   ';
      const expected = '--#   ';

      const r = a.pipe(map((x: any) => {
        throw 'too bad';
      }));

      expectObservable(r).toBe(expected, null, 'too bad');
      expectSubscriptionsTo(a).toBe(asubs);
    });
  });

  it('should propagate errors from observable that emits only errors', () => {
  testScheduler.run(({ cold, hot, expectObservable, expectSubscriptionsTo }) => {
      const a =   cold('#');
      const asubs =    '(^!)';
      const expected = '#';

      const r = a.pipe(map(identity));
      expectObservable(r).toBe(expected);
      expectSubscriptionsTo(a).toBe(asubs);
    });
  });

  it('should propagate errors from observable that emit values', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptionsTo }) => {
      const a =   cold('--a--b--#', {a: 1, b: 2}, 'too bad');
      const asubs =    '^       !';
      const expected = '--x--y--#';

      const r = a.pipe(map(addDrama));
      expectObservable(r).toBe(expected, {x: '1!', y: '2!'}, 'too bad');
      expectSubscriptionsTo(a).toBe(asubs);
    });
  });

  it('should not map an empty observable', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptionsTo }) => {
      const a =   cold('|');
      const asubs =    '(^!)';
      const expected = '|';

      let invoked = 0;
      const r = a.pipe(
        map((x: any) => { invoked++; return x; }),
        tap(null, null, () => {
          expect(invoked).to.equal(0);
        })
      );

      expectObservable(r).toBe(expected);
      expectSubscriptionsTo(a).toBe(asubs);
    });
  });

  it('should allow unsubscribing explicitly and early', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptionsTo }) => {
      const a =   cold('--1--2--3--|');
      const unsub =    '      !     ';
      const asubs =    '^     !     ';
      const expected = '--x--y-     ';

      const r = a.pipe(map(addDrama));

      expectObservable(r, unsub).toBe(expected, {x: '1!', y: '2!'});
      expectSubscriptionsTo(a).toBe(asubs);
    });
  });

  it('should map with index', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptionsTo }) => {
      const a = hot('-5-^-4--3---2----1--|');
      const asubs =    '^                !';
      const expected = '--a--b---c----d--|';
      const values = {a: 5, b: 14, c: 23, d: 32};

      let invoked = 0;
      const r = a.pipe(
        map((x: string, index: number) => {
          invoked++;
          return (parseInt(x) + 1) + (index * 10);
        }),
        tap(null, null, () => {
          expect(invoked).to.equal(4);
        })
      );

      expectObservable(r).toBe(expected, values);
      expectSubscriptionsTo(a).toBe(asubs);
    });
  });

  it('should map with index until completed', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptionsTo }) => {
      const a = hot('-5-^-4--3---2----1--|');
      const asubs =    '^                !';
      const expected = '--a--b---c----d--|';
      const values = {a: 5, b: 14, c: 23, d: 32};

      let invoked = 0;
      const r = a.pipe(
        map((x: string, index: number) => {
          invoked++;
          return (parseInt(x) + 1) + (index * 10);
        }),
        tap(null, null, () => {
          expect(invoked).to.equal(4);
        })
      );

      expectObservable(r).toBe(expected, values);
      expectSubscriptionsTo(a).toBe(asubs);
    });
  });

  it('should map with index until an error occurs', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptionsTo }) => {
      const a = hot('-5-^-4--3---2----1--#', undefined, 'too bad');
      const asubs =    '^                !';
      const expected = '--a--b---c----d--#';
      const values = {a: 5, b: 14, c: 23, d: 32};

      let invoked = 0;
      const r = a.pipe(
        map((x: string, index: number) => {
          invoked++;
          return (parseInt(x) + 1) + (index * 10);
        }),
        tap(null, null, () => {
          expect(invoked).to.equal(4);
        })
      );

      expectObservable(r).toBe(expected, values, 'too bad');
      expectSubscriptionsTo(a).toBe(asubs);
    });
  });

  it('should map twice', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptionsTo }) => {
      const a = hot('-0----1-^-2---3--4-5--6--7-8-|');
      const asubs =         '^                    !';
      const expected =      '--a---b--c-d--e--f-g-|';
      const values = {a: 2, b: 3, c: 4, d: 5, e: 6, f: 7, g: 8};

      let invoked1 = 0;
      let invoked2 = 0;
      const r = a.pipe(
        map((x: string) => { invoked1++; return parseInt(x) * 2; }),
        map((x: number) => { invoked2++; return x / 2; }),
        tap(null, null, () => {
          expect(invoked1).to.equal(7);
          expect(invoked2).to.equal(7);
        })
      );

      expectObservable(r).toBe(expected, values);
      expectSubscriptionsTo(a).toBe(asubs);
    });
  });

  // TODO(benlesh): uncomment
  // it('should not break unsubscription chain when unsubscribed explicitly', () => {
  //   testScheduler.run(({ cold, hot, expectObservable, expectSubscriptionsTo }) => {
  //     const a =   cold('--1--2--3--|');
  //     const unsub =    '      !     ';
  //     const asubs =    '^     !     ';
  //     const expected = '--x--y-     ';

  //     const r = a.pipe(
  //       mergeMap((x: string) => of(x)),
  //       map(addDrama),
  //       mergeMap((x: string) => of(x))
  //     );

  //     expectObservable(r, unsub).toBe(expected, {x: '1!', y: '2!'});
  //     expectSubscriptionsTo(a).toBe(asubs);
  //   });
  // });
});
