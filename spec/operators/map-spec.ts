/** @prettier */
import { expect } from 'chai';
import { map, tap, mergeMap, take } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { of, Observable, identity } from 'rxjs';
import { observableMatcher } from '../helpers/observableMatcher';

// function shortcuts
const addDrama = (x: number | string) => x + '!';

/** @test {map} */
describe('map', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(observableMatcher);
  });

  it('should map multiple values', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' --1--2--3--|');
      const e1subs = '  ^----------!';
      const expected = '--x--y--z--|';

      const result = e1.pipe(map((x) => 10 * +x));

      expectObservable(result).toBe(expected, { x: 10, y: 20, z: 30 });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should map one value', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const values = { x: 42 };
      const e1 = cold(' --x--|', values);
      const e1subs = '  ^----!';
      const expected = '--y--|';

      const result = e1.pipe(map(addDrama));

      expectObservable(result).toBe(expected, { y: '42!' });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should map multiple values', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' --1--2--3--|');
      const e1subs = '  ^----------!';
      const expected = '--x--y--z--|';

      const result = e1.pipe(map(addDrama));

      expectObservable(result).toBe(expected, { x: '1!', y: '2!', z: '3!' });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should propagate errors from map function', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const values = { x: 42 };
      const e1 = cold(' --x--|', values);
      const e1subs = '  ^-!   ';
      const expected = '--#   ';

      const result = e1.pipe(
        map((x: any) => {
          throw 'too bad';
        })
      );

      expectObservable(result).toBe(expected, null, 'too bad');
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should propagate errors from observable that emits only errors', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' #   ');
      const e1subs = '  (^!)';
      const expected = '#   ';

      const result = e1.pipe(map(identity));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should propagate errors from observable that emit values', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const values = { a: 1, b: 2 };
      const e1 = cold(' --a--b--#', values, 'too bad');
      const e1subs = '  ^-------!';
      const expected = '--x--y--#';

      const result = e1.pipe(map(addDrama));

      expectObservable(result).toBe(expected, { x: '1!', y: '2!' }, 'too bad');
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not map an empty observable', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' |   ');
      const e1subs = '  (^!)';
      const expected = '|   ';

      let invoked = 0;
      const result = e1.pipe(
        map((x: any) => {
          invoked++;
          return x;
        }),
        tap({
          complete() {
            expect(invoked).to.equal(0);
          },
        })
      );

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should allow unsubscribing explicitly and early', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' --1--2--3--|');
      const e1subs = '  ^-----!     ';
      const expected = '--x--y-     ';
      const unsub = '   ------!     ';

      const result = e1.pipe(map(addDrama));

      expectObservable(result, unsub).toBe(expected, { x: '1!', y: '2!' });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should map with index', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-5-^-4--3---2----1--|');
      const e1subs = '   ^----------------!';
      const expected = ' --a--b---c----d--|';
      const values = { a: 5, b: 14, c: 23, d: 32 };

      let invoked = 0;
      const result = e1.pipe(
        map((x: string, index: number) => {
          invoked++;
          return parseInt(x) + 1 + index * 10;
        }),
        tap({
          complete() {
            expect(invoked).to.equal(4);
          },
        })
      );

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should map with index until completed', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-5-^-4--3---2----1--|');
      const e1subs = '   ^----------------!';
      const expected = ' --a--b---c----d--|';
      const values = { a: 5, b: 14, c: 23, d: 32 };

      let invoked = 0;
      const result = e1.pipe(
        map((x: string, index: number) => {
          invoked++;
          return parseInt(x) + 1 + index * 10;
        }),
        tap({
          complete() {
            expect(invoked).to.equal(4);
          },
        })
      );

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should map with index until an error occurs', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-5-^-4--3---2----1--#', undefined, 'too bad');
      const e1subs = '   ^----------------!';
      const expected = ' --a--b---c----d--#';
      const values = { a: 5, b: 14, c: 23, d: 32 };

      let invoked = 0;
      const result = e1.pipe(
        map((x: string, index: number) => {
          invoked++;
          return parseInt(x) + 1 + index * 10;
        }),
        tap({
          error() {
            expect(invoked).to.equal(4);
          },
        })
      );

      expectObservable(result).toBe(expected, values, 'too bad');
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should map using a custom thisArg', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-5-^-4--3---2----1--|');
      const e1subs = '   ^----------------!';
      const expected = ' --a--b---c----d--|';
      const values = { a: 46, b: 55, c: 64, d: 73 };

      const foo = {
        value: 42,
      };
      const result = e1.pipe(
        map(function (this: typeof foo, x: string, index: number) {
          expect(this).to.equal(foo);
          return parseInt(x) + foo.value + index * 10;
        }, foo)
      );

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should map twice', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-0----1-^-2---3--4-5--6--7-8-|');
      const e1subs = '        ^--------------------!';
      const expected = '      --a---b--c-d--e--f-g-|';
      const values = { a: 2, b: 3, c: 4, d: 5, e: 6, f: 7, g: 8 };

      let invoked1 = 0;
      let invoked2 = 0;
      const result = e1.pipe(
        map((x: string) => {
          invoked1++;
          return parseInt(x) * 2;
        }),
        map((x: number) => {
          invoked2++;
          return x / 2;
        }),
        tap({
          complete() {
            expect(invoked1).to.equal(7);
            expect(invoked2).to.equal(7);
          },
        })
      );

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should do multiple maps using a custom thisArg', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --1--2--3--4--|');
      const e1subs = '  ^-------------!';
      const expected = '--a--b--c--d--|';
      const values = { a: 11, b: 14, c: 17, d: 20 };

      class Filterer {
        selector1 = (x: string) => parseInt(x) + 2;
        selector2 = (x: string) => parseInt(x) * 3;
      }
      const filterer = new Filterer();

      const result = e1.pipe(
        map(function (this: any, x) {
          return this.selector1(x);
        }, filterer),
        map(function (this: any, x) {
          return this.selector2(x);
        }, filterer),
        map(function (this: any, x) {
          return this.selector1(x);
        }, filterer)
      );

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not break unsubscription chain when unsubscribed explicitly', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' --1--2--3--|');
      const e1subs = '  ^-----!     ';
      const expected = '--x--y-     ';
      const unsub = '   ------!     ';

      const result = e1.pipe(
        mergeMap((x: string) => of(x)),
        map(addDrama),
        mergeMap((x: string) => of(x))
      );

      expectObservable(result, unsub).toBe(expected, { x: '1!', y: '2!' });
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

    synchronousObservable.pipe(map(identity), take(3)).subscribe(() => {
      /* noop */
    });

    expect(sideEffects).to.deep.equal([0, 1, 2]);
  });
});
