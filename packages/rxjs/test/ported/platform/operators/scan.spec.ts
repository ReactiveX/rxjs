// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/scan-spec.ts
import { describe, expect, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { finalize } from 'rxjs/finalize';
import { mergeMap } from 'rxjs/merge-map';
import { scan } from 'rxjs/scan';
describe('scan (platform)', () => {
  it('should scan', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      // prettier-ignore
      const values = {
                a: 1, b: 3, c: 5,
                x: 1, y: 4, z: 9,
            };
      const e1 = hot('  --a--b--c--|', values);
      const e1subs = '  ^----------!';
      const expected = '--x--y--z--|';
      const scanFunction = function (o, x) {
        return o + x;
      };
      expectObservable(e1[scan](scanFunction, 0)).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should scan things', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^--b--c--d--e--f--g--|');
      const e1subs = '     ^--------------------!';
      const expected = '   ---u--v--w--x--y--z--|';
      const values = {
        u: ['b'],
        v: ['b', 'c'],
        w: ['b', 'c', 'd'],
        x: ['b', 'c', 'd', 'e'],
        y: ['b', 'c', 'd', 'e', 'f'],
        z: ['b', 'c', 'd', 'e', 'f', 'g'],
      };
      const source = e1[scan]((acc, x) => acc.concat(x), []);
      expectObservable(source).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should scan with a seed of undefined', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^--b--c--d--e--f--g--|');
      const e1subs = '     ^--------------------!';
      const expected = '   ---u--v--w--x--y--z--|';
      const values = {
        u: 'undefined b',
        v: 'undefined b c',
        w: 'undefined b c d',
        x: 'undefined b c d e',
        y: 'undefined b c d e f',
        z: 'undefined b c d e f g',
      };
      const source = e1[scan]((acc, x) => acc + ' ' + x, undefined);
      expectObservable(source).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should scan without seed', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^--b--c--d--|');
      const e1subs = '     ^-----------!';
      const expected = '   ---x--y--z--|';
      const values = {
        x: 'b',
        y: 'bc',
        z: 'bcd',
      };
      const source = e1[scan]((acc, x) => acc + x);
      expectObservable(source).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle errors', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^--b--c--d--#');
      const e1subs = '     ^-----------!';
      const expected = '   ---u--v--w--#';
      const values = {
        u: ['b'],
        v: ['b', 'c'],
        w: ['b', 'c', 'd'],
      };
      const source = e1[scan]((acc, x) => acc.concat(x), []);
      expectObservable(source).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle errors in the projection function', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^--b--c--d--e--f--g--|');
      const e1subs = '     ^--------!            ';
      const expected = '   ---u--v--#            ';
      const values = {
        u: ['b'],
        v: ['b', 'c'],
        w: ['b', 'c', 'd'],
        x: ['b', 'c', 'd', 'e'],
        y: ['b', 'c', 'd', 'e', 'f'],
        z: ['b', 'c', 'd', 'e', 'f', 'g'],
      };
      const source = e1[scan]((acc, x) => {
        if (x === 'd') {
          throw 'bad!';
        }
        return acc.concat(x);
      }, []);
      expectObservable(source).toBe(expected, values, 'bad!');
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('handle empty', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' |   ');
      const e1subs = '  (^!)';
      const expected = '|   ';
      const source = e1[scan]((acc, x) => acc.concat(x), []);
      expectObservable(source).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('handle never', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' -');
      const e1subs = '^!';
      const expected = '-';
      const source = e1[scan]((acc, x) => acc.concat(x), []);
      expectObservable(source, '^!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('handle throw', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' #   ');
      const e1subs = '  (^!)';
      const expected = '#   ';
      const source = e1[scan]((acc, x) => acc.concat(x), []);
      expectObservable(source).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should allow unsubscribing explicitly and early', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^--b--c--d--e--f--g--|');
      const unsub = '      --------------!       ';
      const e1subs = '     ^-------------!       ';
      const expected = '   ---u--v--w--x--       ';
      const values = {
        u: ['b'],
        v: ['b', 'c'],
        w: ['b', 'c', 'd'],
        x: ['b', 'c', 'd', 'e'],
        y: ['b', 'c', 'd', 'e', 'f'],
        z: ['b', 'c', 'd', 'e', 'f', 'g'],
      };
      const source = e1[scan]((acc, x) => acc.concat(x), []);
      expectObservable(source, unsub).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not break unsubscription chains when result is unsubscribed explicitly', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^--b--c--d--e--f--g--|');
      const e1subs = '     ^-------------!       ';
      const expected = '   ---u--v--w--x--       ';
      const unsub = '      --------------!       ';
      const values = {
        u: ['b'],
        v: ['b', 'c'],
        w: ['b', 'c', 'd'],
        x: ['b', 'c', 'd', 'e'],
        y: ['b', 'c', 'd', 'e', 'f'],
        z: ['b', 'c', 'd', 'e', 'f', 'g'],
      };
      const source = e1[mergeMap]((x) => Observable.from([x]))
        [scan]((acc, x) => acc.concat(x), [])
        [mergeMap]((x) => Observable.from([x]));
      expectObservable(source, unsub).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should pass current index to accumulator', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      // prettier-ignore
      const values = {
                a: 1, b: 3, c: 5,
                x: 1, y: 4, z: 9,
            };
      let idx = [0, 1, 2];
      const e1 = hot('  --a--b--c--|', values);
      const e1subs = '  ^----------!';
      const expected = '--x--y--z--|';
      const scanFunction = (o, value, index) => {
        expect(index).toBe(idx.shift());
        return o + value;
      };
      const scanObs = e1[scan](scanFunction, 0)[finalize](() => {
        expect(idx).toHaveLength(0);
      });
      expectObservable(scanObs).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
});
