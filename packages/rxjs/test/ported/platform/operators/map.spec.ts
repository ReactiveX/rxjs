// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/map-spec.ts
import { describe, expect, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { identity } from 'rxjs/identity';
import { map } from 'rxjs/map';
import { mergeMap } from 'rxjs/merge-map';
import { tap } from 'rxjs/tap';
describe('map (platform)', () => {
  it('should map multiple values', async () => {
    const addDrama = (x) => x + '!';
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' --1--2--3--|');
      const e1subs = '  ^----------!';
      const expected = '--x--y--z--|';
      const result = e1[map]((x) => 10 * +x);
      expectObservable(result).toBe(expected, { x: 10, y: 20, z: 30 });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should map one value', async () => {
    const addDrama = (x) => x + '!';
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const values = { x: 42 };
      const e1 = observable(' --x--|', values);
      const e1subs = '  ^----!';
      const expected = '--y--|';
      const result = e1[map](addDrama);
      expectObservable(result).toBe(expected, { y: '42!' });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should map multiple values', async () => {
    const addDrama = (x) => x + '!';
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' --1--2--3--|');
      const e1subs = '  ^----------!';
      const expected = '--x--y--z--|';
      const result = e1[map](addDrama);
      expectObservable(result).toBe(expected, { x: '1!', y: '2!', z: '3!' });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should propagate errors from map function', async () => {
    const addDrama = (x) => x + '!';
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const values = { x: 42 };
      const e1 = observable(' --x--|', values);
      const e1subs = '  ^-!   ';
      const expected = '--#   ';
      const result = e1[map]((x) => {
        throw 'too bad';
      });
      expectObservable(result).toBe(expected, null, 'too bad');
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should propagate errors from observable that emits only errors', async () => {
    const addDrama = (x) => x + '!';
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' #   ');
      const e1subs = '  (^!)';
      const expected = '#   ';
      const result = e1[map](identity);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should propagate errors from observable that emit values', async () => {
    const addDrama = (x) => x + '!';
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const values = { a: 1, b: 2 };
      const e1 = observable(' --a--b--#', values, 'too bad');
      const e1subs = '  ^-------!';
      const expected = '--x--y--#';
      const result = e1[map](addDrama);
      expectObservable(result).toBe(expected, { x: '1!', y: '2!' }, 'too bad');
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not map an empty observable', async () => {
    const addDrama = (x) => x + '!';
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' |   ');
      const e1subs = '  (^!)';
      const expected = '|   ';
      let invoked = 0;
      const result = e1[map]((x) => {
        invoked++;
        return x;
      })[tap]({
        complete() {
          expect(invoked).toBe(0);
        },
      });
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should allow unsubscribing explicitly and early', async () => {
    const addDrama = (x) => x + '!';
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' --1--2--3--|');
      const e1subs = '  ^-----!     ';
      const expected = '--x--y-     ';
      const unsub = '   ------!     ';
      const result = e1[map](addDrama);
      expectObservable(result, unsub).toBe(expected, { x: '1!', y: '2!' });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should map with index', async () => {
    const addDrama = (x) => x + '!';
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-5-^-4--3---2----1--|');
      const e1subs = '   ^----------------!';
      const expected = ' --a--b---c----d--|';
      const values = { a: 5, b: 14, c: 23, d: 32 };
      let invoked = 0;
      const result = e1[map]((x, index) => {
        invoked++;
        return parseInt(x) + 1 + index * 10;
      })[tap]({
        complete() {
          expect(invoked).toBe(4);
        },
      });
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should map with index until completed', async () => {
    const addDrama = (x) => x + '!';
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-5-^-4--3---2----1--|');
      const e1subs = '   ^----------------!';
      const expected = ' --a--b---c----d--|';
      const values = { a: 5, b: 14, c: 23, d: 32 };
      let invoked = 0;
      const result = e1[map]((x, index) => {
        invoked++;
        return parseInt(x) + 1 + index * 10;
      })[tap]({
        complete() {
          expect(invoked).toBe(4);
        },
      });
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should map with index until an error occurs', async () => {
    const addDrama = (x) => x + '!';
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-5-^-4--3---2----1--#', undefined, 'too bad');
      const e1subs = '   ^----------------!';
      const expected = ' --a--b---c----d--#';
      const values = { a: 5, b: 14, c: 23, d: 32 };
      let invoked = 0;
      const result = e1[map]((x, index) => {
        invoked++;
        return parseInt(x) + 1 + index * 10;
      })[tap]({
        error() {
          expect(invoked).toBe(4);
        },
      });
      expectObservable(result).toBe(expected, values, 'too bad');
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should map using a bound projector', async () => {
    const addDrama = (x) => x + '!';
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-5-^-4--3---2----1--|');
      const e1subs = '   ^----------------!';
      const expected = ' --a--b---c----d--|';
      const values = { a: 46, b: 55, c: 64, d: 73 };
      const foo = {
        value: 42,
      };
      const result = e1[map](
        function (x, index) {
          expect(this).toBe(foo);
          return parseInt(x) + foo.value + index * 10;
        }.bind(foo)
      );
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should map twice', async () => {
    const addDrama = (x) => x + '!';
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-0----1-^-2---3--4-5--6--7-8-|');
      const e1subs = '        ^--------------------!';
      const expected = '      --a---b--c-d--e--f-g-|';
      const values = { a: 2, b: 3, c: 4, d: 5, e: 6, f: 7, g: 8 };
      let invoked1 = 0;
      let invoked2 = 0;
      const result = e1[map]((x) => {
        invoked1++;
        return parseInt(x) * 2;
      })
        [map]((x) => {
          invoked2++;
          return x / 2;
        })
        [tap]({
          complete() {
            expect(invoked1).toBe(7);
            expect(invoked2).toBe(7);
          },
        });
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should do multiple maps using closed-over projectors', async () => {
    const addDrama = (x) => x + '!';
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --1--2--3--4--|');
      const e1subs = '  ^-------------!';
      const expected = '--a--b--c--d--|';
      const values = { a: 11, b: 14, c: 17, d: 20 };
      class Filterer {
        selector1 = (x) => parseInt(x) + 2;
        selector2 = (x) => parseInt(x) * 3;
      }
      const filterer = new Filterer();
      const result = e1[map](filterer.selector1)[map](filterer.selector2)[map](filterer.selector1);
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not break unsubscription chain when unsubscribed explicitly', async () => {
    const addDrama = (x) => x + '!';
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' --1--2--3--|');
      const e1subs = '  ^-----!     ';
      const expected = '--x--y-     ';
      const unsub = '   ------!     ';
      const result = e1[mergeMap]((x) => Observable.from([x]))
        [map](addDrama)
        [mergeMap]((x) => Observable.from([x]));
      expectObservable(result, unsub).toBe(expected, { x: '1!', y: '2!' });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
});
