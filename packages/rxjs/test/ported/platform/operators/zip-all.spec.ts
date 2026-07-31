// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/zipAll-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { mergeMap } from 'rxjs/merge-map';
import { zip } from 'rxjs/zip';
import { zipAll } from 'rxjs/zip-all';
describe('zipAll (platform)', () => {
  it('should combine paired events from two observables', async () => {
    await rxTest(({ hot, observable, expectObservable }) => {
      const x = observable('                  -a-----b-|');
      const y = observable('                  --1-2-----');
      const outer = hot('-x----y--------|         ', { x: x, y: y });
      const expected = ' -----------------A----B-|';
      const result = outer[zipAll]((a, b) => a + b);
      expectObservable(result).toBe(expected, { A: 'a1', B: 'b2' });
    });
  });
  it('should combine two observables', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('   ---1---2---3---');
      const asubs = '^-----------------!';
      const b = hot('   --4--5--6--7--8--');
      const bsubs = '^-----------------!';
      const expected = '---x---y---z';
      const values = { x: ['1', '4'], y: ['2', '5'], z: ['3', '6'] };
      expectObservable(Observable.from([a, b])[zipAll](), '^-----------------!').toBe(expected, values);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });
  it('should end once one observable completes and its buffer is empty', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ---a--b--c--|               ');
      const e1subs = '  ^-----------!               ';
      const e2 = hot('  ------d----e----f--------|  ');
      const e2subs = '  ^-----------------!         ';
      const e3 = hot('  --------h----i----j---------'); // doesn't complete
      const e3subs = '  ^-----------------!         ';
      const expected = '--------x----y----(z|)      '; // e1 complete and buffer empty
      const values = {
        x: ['a', 'd', 'h'],
        y: ['b', 'e', 'i'],
        z: ['c', 'f', 'j'],
      };
      expectObservable(Observable.from([e1, e2, e3])[zipAll]()).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
      expectSubscriptions(e3.subscriptions).toBe(e3subs);
    });
  });
  it('should end once one observable nexts and zips value from completed other observable whose buffer is empty', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ---a--b--c--|             ');
      const e1subs = '  ^-----------!             ';
      const e2 = hot('  ------d----e----f|        ');
      const e2subs = '  ^----------------!        ';
      const e3 = hot('  --------h----i----j-------'); // doesn't complete
      const e3subs = '  ^-----------------!       ';
      const expected = '--------x----y----(z|)    '; // e2 buffer empty and signaled complete
      const values = {
        x: ['a', 'd', 'h'],
        y: ['b', 'e', 'i'],
        z: ['c', 'f', 'j'],
      };
      expectObservable(Observable.from([e1, e2, e3])[zipAll]()).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
      expectSubscriptions(e3.subscriptions).toBe(e3subs);
    });
  });
  it('should zip them with values', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const myIterator = (function* () {
        for (let i = 0; i < 4; i++) {
          yield i;
        }
      })();
      const e1 = hot('  ---a---b---c---d---|');
      const e1subs = '  ^--------------!';
      const expected = '---w---x---y---(z|)';
      const values = {
        w: ['a', 0],
        x: ['b', 1],
        y: ['c', 2],
        z: ['d', 3],
      };
      expectObservable(Observable.from([e1, myIterator])[zipAll]()).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should complete instantly with never observable and empty iterable', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const a = observable('  -');
      const asubs = '   (^!)';
      const b = [];
      const expected = '|';
      expectObservable(Observable.from([a, b])[zipAll]()).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
    });
  });
  it('should work with empty observable and empty iterable', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const a = observable('  |');
      const asubs = '   (^!)';
      const b = [];
      const expected = '|';
      expectObservable(Observable.from([a, b])[zipAll]()).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
    });
  });
  it('should work with empty observable and non-empty iterable', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const a = observable('  |');
      const asubs = '   (^!)';
      const b = [1];
      const expected = '|';
      expectObservable(Observable.from([a, b])[zipAll]()).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
    });
  });
  it('should work with non-empty observable and empty iterable', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('---^----a--|');
      const asubs = '   (^!)';
      const b = [];
      const expected = '|';
      expectObservable(Observable.from([a, b])[zipAll]()).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
    });
  });
  it('should work with never observable and non-empty iterable', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const a = observable('  -');
      const asubs = '^!';
      const b = [1];
      const expected = '-';
      expectObservable(Observable.from([a, b])[zipAll](), '^!').toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
    });
  });
  it('should work with non-empty observable and non-empty iterable', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('---^----1--|');
      const asubs = '   ^----!   ';
      const b = [2];
      const expected = '-----(x|)';
      expectObservable(Observable.from([a, b])[zipAll]()).toBe(expected, { x: ['1', 2] });
      expectSubscriptions(a.subscriptions).toBe(asubs);
    });
  });
  it('should work with observable which raises error and non-empty iterable', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('---^----#');
      const asubs = '   ^----!';
      const b = [1];
      const expected = '-----#';
      expectObservable(Observable.from([a, b])[zipAll]()).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
    });
  });
  it('should work with non-empty many observable and non-empty many iterable', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('---^--1--2--3--|');
      const asubs = '   ^--------!   ';
      const b = [4, 5, 6];
      const expected = '---x--y--(z|)';
      expectObservable(Observable.from([a, b])[zipAll]()).toBe(expected, { x: ['1', 4], y: ['2', 5], z: ['3', 6] });
      expectSubscriptions(a.subscriptions).toBe(asubs);
    });
  });
  it('should work with non-empty observable and non-empty iterable selector that throws', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('---^--1--2--3--|');
      const asubs = '   ^-----!';
      const b = [4, 5, 6];
      const expected = '---x--#';
      const selector = function (x, y) {
        if (y === 5) {
          throw new Error('too bad');
        } else {
          return x + y;
        }
      };
      expectObservable(Observable.from([a, b])[zipAll](selector)).toBe(expected, { x: '14' }, new Error('too bad'));
      expectSubscriptions(a.subscriptions).toBe(asubs);
    });
  });
  it('should combine two observables and selector', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('   ---1---2---3---');
      const asubs = '^-----------------!';
      const b = hot('   --4--5--6--7--8--');
      const bsubs = '^-----------------!';
      const expected = '---x---y---z';
      expectObservable(
        Observable.from([a, b])[zipAll]((e1, e2) => e1 + e2),
        '^-----------------!'
      ).toBe(expected, { x: '14', y: '25', z: '36' });
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });
  it('should work with n-ary symmetric', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('   ---1-^-1----4----|');
      const asubs = '        ^---------!  ';
      const b = hot('   ---1-^--2--5----| ');
      const bsubs = '        ^---------!  ';
      const c = hot('   ---1-^---3---6-|  ');
      const expected = '     ----x---y-|  ';
      expectObservable(Observable.from([a, b, c])[zipAll]()).toBe(expected, { x: ['1', '2', '3'], y: ['4', '5', '6'] });
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });
  it('should work with n-ary symmetric selector', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('---1-^-1----4----|');
      const asubs = '     ^---------!  ';
      const b = hot('---1-^--2--5----| ');
      const bsubs = '     ^---------!  ';
      const c = hot('---1-^---3---6-|  ');
      const expected = '  ----x---y-|  ';
      const observable = Observable.from([a, b, c])[zipAll]((r0, r1, r2) => [r0, r1, r2]);
      expectObservable(observable).toBe(expected, { x: ['1', '2', '3'], y: ['4', '5', '6'] });
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });
  it('should work with n-ary symmetric array selector', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('   ---1-^-1----4----|');
      const asubs = '        ^---------!  ';
      const b = hot('   ---1-^--2--5----| ');
      const bsubs = '        ^---------!  ';
      const c = hot('   ---1-^---3---6-|  ');
      const expected = '     ----x---y-|  ';
      const observable = Observable.from([a, b, c])[zipAll]((r0, r1, r2) => [r0, r1, r2]);
      expectObservable(observable).toBe(expected, { x: ['1', '2', '3'], y: ['4', '5', '6'] });
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });
  it('should work with some data asymmetric 1', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('---1-^-1-3-5-7-9-x-y-z-w-u-|');
      const asubs = '     ^-----------------!    ';
      const b = hot('---1-^--2--4--6--8--0--|    ');
      const bsubs = '     ^-----------------!    ';
      const expected = '  ---a--b--c--d--e--|    ';
      expectObservable(Observable.from([a, b])[zipAll]((r1, r2) => r1 + r2)).toBe(expected, {
        a: '12',
        b: '34',
        c: '56',
        d: '78',
        e: '90',
      });
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });
  it('should work with some data asymmetric 2', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('---1-^--2--4--6--8--0--|    ');
      const asubs = '     ^-----------------!    ';
      const b = hot('---1-^-1-3-5-7-9-x-y-z-w-u-|');
      const bsubs = '     ^-----------------!    ';
      const expected = '  ---a--b--c--d--e--|    ';
      expectObservable(Observable.from([a, b])[zipAll]((r1, r2) => r1 + r2)).toBe(expected, {
        a: '21',
        b: '43',
        c: '65',
        d: '87',
        e: '09',
      });
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });
  it('should work with some data symmetric', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('---1-^-1-3-5-7-9------| ');
      const asubs = '     ^----------------! ';
      const b = hot('---1-^--2--4--6--8--0--|');
      const bsubs = '     ^----------------! ';
      const expected = '  ---a--b--c--d--e-| ';
      expectObservable(Observable.from([a, b])[zipAll]((r1, r2) => r1 + r2)).toBe(expected, {
        a: '12',
        b: '34',
        c: '56',
        d: '78',
        e: '90',
      });
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });
  it('should work with selector throws', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('---1-^-2---4----|  ');
      const asubs = '     ^-------!     ';
      const b = hot('---1-^--3----5----|');
      const bsubs = '     ^-------!     ';
      const expected = '  ---x----#     ';
      const selector = function (x, y) {
        if (y === '5') {
          throw new Error('too bad');
        } else {
          return x + y;
        }
      };
      const observable = Observable.from([a, b])[zipAll](selector);
      expectObservable(observable).toBe(expected, { x: '23' }, new Error('too bad'));
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });
  it('should work with right completes first', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('---1-^-2-----|');
      const asubs = '     ^-----!';
      const b = hot('---1-^--3--|');
      const bsubs = '     ^-----!';
      const expected = '  ---x--|';
      expectObservable(zip([a, b])).toBe(expected, { x: ['2', '3'] });
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });
  it('should handle a hot observable of observables', async () => {
    await rxTest(({ hot, observable, expectObservable, expectSubscriptions }) => {
      const x = observable('          a---b---c---|      ');
      const xsubs = '   --------^-----------!';
      const y = observable('          d---e---f---|   ');
      const ysubs = '   --------^-----------!';
      const e1 = hot('  --x--y--|            ', { x: x, y: y });
      const e1subs = '  ^-------!            ';
      const expected = '--------u---v---w---|';
      const values = {
        u: ['a', 'd'],
        v: ['b', 'e'],
        w: ['c', 'f'],
      };
      expectObservable(e1[zipAll]()).toBe(expected, values);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle merging a hot observable of non-overlapped observables', async () => {
    await rxTest(({ hot, observable, expectObservable, expectSubscriptions }) => {
      const x = observable('                             a-b---------|');
      const xsubs = '   ---------------------------^-----------!';
      const y = observable('                             c-d-e-f-|');
      const ysubs = '   ---------------------------^-------!';
      const z = observable('                             g-h-i-j-k-|');
      const zsubs = '   ---------------------------^---------!';
      const e1 = hot('  --x------y--------z--------|            ', { x: x, y: y, z: z });
      const e1subs = '  ^--------------------------!            ';
      const expected = '---------------------------u-v---------|';
      const values = {
        u: ['a', 'c', 'g'],
        v: ['b', 'd', 'h'],
      };
      expectObservable(e1[zipAll]()).toBe(expected, values);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(z.subscriptions).toBe(zsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should raise error if inner observable raises error', async () => {
    await rxTest(({ hot, observable, expectObservable, expectSubscriptions }) => {
      const x = observable('                                a-b---------|');
      const xsubs = '   ------------------------------^-------!';
      const y = observable('                                c-d-e-f-#');
      const ysubs = '   ------------------------------^-------!';
      const z = observable('                                g-h-i-j-k-|');
      const zsubs = '   ------------------------------^-------!';
      const e1 = hot('  --x---------y--------z--------|        ', { x: x, y: y, z: z });
      const e1subs = '  ^-----------------------------!        ';
      const expected = '------------------------------u-v-----#';
      const expectedValues = {
        u: ['a', 'c', 'g'],
        v: ['b', 'd', 'h'],
      };
      expectObservable(e1[zipAll]()).toBe(expected, expectedValues);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(z.subscriptions).toBe(zsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should raise error if outer observable raises error', async () => {
    await rxTest(({ hot, observable, expectObservable, expectSubscriptions }) => {
      const y = observable('  a-b---------|');
      const z = observable('  c-d-e-f-|');
      const e1 = hot('  --y---------z---#', { y: y, z: z });
      const e1subs = '  ^---------------!';
      const expected = '----------------#';
      expectObservable(e1[zipAll]()).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should work with two nevers', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const a = observable('  -');
      const asubs = '^!';
      const b = observable('  -');
      const bsubs = '^!';
      const expected = '-';
      expectObservable(Observable.from([a, b])[zipAll](), '^!').toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });
  it('should work with never and empty', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const a = observable('  -');
      const asubs = '   (^!)';
      const b = observable('  |');
      const bsubs = '   (^!)';
      const expected = '|';
      expectObservable(Observable.from([a, b])[zipAll]()).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });
  it('should work with empty and never', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const a = observable('  |');
      const asubs = '   (^!)';
      const b = observable('  -');
      const bsubs = '   (^!)';
      const expected = '|';
      expectObservable(Observable.from([a, b])[zipAll]()).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });
  it('should work with empty and empty', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const a = observable('  |');
      const asubs = '   (^!)';
      const b = observable('  |');
      const bsubs = '   (^!)';
      const expected = '|';
      expectObservable(Observable.from([a, b])[zipAll]()).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });
  it('should work with empty and non-empty', async () => {
    await rxTest(({ hot, observable, expectObservable, expectSubscriptions }) => {
      const a = observable('  |');
      const asubs = '   (^!)';
      const b = hot('   ---1--|');
      const bsubs = '   (^!)';
      const expected = '|';
      expectObservable(Observable.from([a, b])[zipAll]()).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });
  it('should work with non-empty and empty', async () => {
    await rxTest(({ hot, observable, expectObservable, expectSubscriptions }) => {
      const a = hot('   ---1--|');
      const asubs = '   (^!)';
      const b = observable('  |');
      const bsubs = '   (^!)';
      const expected = '|';
      expectObservable(Observable.from([a, b])[zipAll]()).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });
  it('should work with never and non-empty', async () => {
    await rxTest(({ hot, observable, expectObservable, expectSubscriptions }) => {
      const a = observable('  -');
      const asubs = '^------!';
      const b = hot('   ---1--|');
      const bsubs = '   ^-----!';
      const expected = '-';
      expectObservable(Observable.from([a, b])[zipAll](), '^------!').toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });
  it('should work with non-empty and never', async () => {
    await rxTest(({ hot, observable, expectObservable, expectSubscriptions }) => {
      const a = hot('   ---1--|');
      const asubs = '   ^-----!';
      const b = observable('  -');
      const bsubs = '^------!';
      const expected = '-';
      expectObservable(Observable.from([a, b])[zipAll](), '^------!').toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });
  it('should combine a source with a second', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('   ---1---2---3---');
      const asubs = '^-----------------!';
      const b = hot('   --4--5--6--7--8--');
      const bsubs = '^-----------------!';
      const expected = '---x---y---z';
      expectObservable(Observable.from([a, b])[zipAll](), '^-----------------!').toBe(expected, {
        x: ['1', '4'],
        y: ['2', '5'],
        z: ['3', '6'],
      });
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });
  it('should work with empty and error', async () => {
    await rxTest(({ hot, observable, expectObservable, expectSubscriptions }) => {
      const a = observable('  |');
      const asubs = '   (^!)';
      const b = hot('   ------#', undefined, 'too bad');
      const bsubs = '   (^!)';
      const expected = '|';
      expectObservable(Observable.from([a, b])[zipAll]()).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });
  it('should work with error and empty', async () => {
    await rxTest(({ hot, observable, expectObservable, expectSubscriptions }) => {
      const a = hot('   ------#', undefined, 'too bad');
      const asubs = '   (^!)';
      const b = observable('  |');
      const bsubs = '   (^!)';
      const expected = '|';
      expectObservable(Observable.from([a, b])[zipAll]()).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });
  it('should work with error', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('   ----------|');
      const asubs = '   ^-----!    ';
      const b = hot('   ------#    ');
      const bsubs = '   ^-----!    ';
      const expected = '------#    ';
      expectObservable(Observable.from([a, b])[zipAll]()).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });
  it('should work with never and error', async () => {
    await rxTest(({ hot, observable, expectObservable, expectSubscriptions }) => {
      const a = observable('  -');
      const asubs = '   ^-----!';
      const b = hot('   ------#');
      const bsubs = '   ^-----!';
      const expected = '------#';
      expectObservable(Observable.from([a, b])[zipAll]()).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });
  it('should work with error and never', async () => {
    await rxTest(({ hot, observable, expectObservable, expectSubscriptions }) => {
      const a = hot('   ------#');
      const asubs = '   ^-----!';
      const b = observable('  -');
      const bsubs = '   ^-----!';
      const expected = '------#';
      expectObservable(Observable.from([a, b])[zipAll]()).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });
  it('should work with error and error', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('   ------#', undefined, 'too bad');
      const asubs = '   ^-----!';
      const b = hot('   ----------#', undefined, 'too bad 2');
      const bsubs = '   ^-----!';
      const expected = '------#';
      expectObservable(Observable.from([a, b])[zipAll]()).toBe(expected, null, 'too bad');
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });
  it('should work with two sources that eventually raise errors', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('   --w-----#----', { w: 1 }, 'too bad');
      const asubs = '   ^-------!';
      const b = hot('   -----z-----#-', { z: 2 }, 'too bad 2');
      const bsubs = '   ^-------!';
      const expected = '-----x--#';
      expectObservable(Observable.from([a, b])[zipAll]()).toBe(expected, { x: [1, 2] }, 'too bad');
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });
  it('should work with two sources that eventually raise errors (swapped)', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('   -----z-----#-', { z: 2 }, 'too bad 2');
      const asubs = '   ^-------!';
      const b = hot('   --w-----#', { w: 1 }, 'too bad');
      const bsubs = '   ^-------!';
      const expected = '-----x--#';
      expectObservable(Observable.from([a, b])[zipAll]()).toBe(expected, { x: [2, 1] }, 'too bad');
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });
  it('should work with error and some', async () => {
    await rxTest(({ hot, observable, expectObservable, expectSubscriptions }) => {
      const a = observable('  #');
      const asubs = '   (^!)';
      const b = hot('   --1--2--3--');
      const bsubs = '   (^!)';
      const expected = '#';
      expectObservable(Observable.from([a, b])[zipAll]()).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });
  it('should not break unsubscription chain when unsubscribed explicitly', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('   ---1---2---3---|');
      const unsub = '   ---------!';
      const asubs = '   ^--------!';
      const b = hot('   --4--5--6--7--8--|');
      const bsubs = '   ^--------!';
      const expected = '---x---y--';
      const values = { x: ['1', '4'], y: ['2', '5'] };
      const r = Observable.from([a, b])
        [mergeMap]((x) => Observable.from([x]))
        [zipAll]()
        [mergeMap]((x) => Observable.from([x]));
      expectObservable(r, unsub).toBe(expected, values);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });
  it('should complete when empty source', async () => {
    await rxTest(({ hot, expectObservable }) => {
      const source = hot('|');
      const expected = '  |';
      expectObservable(source[zipAll]()).toBe(expected);
    });
  });
});
