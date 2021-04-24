/** @prettier */
import { expect } from 'chai';
import { zipAll, mergeMap } from 'rxjs/operators';
import { queueScheduler, of, zip, scheduled } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {zipAll} */
describe('zipAll operator', () => {
  let rxTestScheduler: TestScheduler;

  beforeEach(() => {
    rxTestScheduler = new TestScheduler(observableMatcher);
  });

  it('should combine paired events from two observables', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable }) => {
      const x = cold('                  -a-----b-|');
      const y = cold('                  --1-2-----');
      const outer = hot('-x----y--------|         ', { x: x, y: y });
      const expected = ' -----------------A----B-|';

      const result = outer.pipe(zipAll((a, b) => a + b));

      expectObservable(result).toBe(expected, { A: 'a1', B: 'b2' });
    });
  });

  it('should combine two observables', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('   ---1---2---3---');
      const asubs = '   ^';
      const b = hot('   --4--5--6--7--8--');
      const bsubs = '   ^';
      const expected = '---x---y---z';
      const values = { x: ['1', '4'], y: ['2', '5'], z: ['3', '6'] };

      expectObservable(of(a, b).pipe(zipAll())).toBe(expected, values);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });

  it('should take all observables from the source and zip them', (done) => {
    const expected = ['a1', 'b2', 'c3'];
    let i = 0;
    of(of('a', 'b', 'c'), of(1, 2, 3))
      .pipe(zipAll((a: string, b: number) => a + b))
      .subscribe({
        next(x) {
          expect(x).to.equal(expected[i++]);
        },
        complete: done,
      });
  });

  it('should end once one observable completes and its buffer is empty', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
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

      expectObservable(of(e1, e2, e3).pipe(zipAll())).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
      expectSubscriptions(e3.subscriptions).toBe(e3subs);
    });
  });

  it('should end once one observable nexts and zips value from completed other ' + 'observable whose buffer is empty', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
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

      expectObservable(of(e1, e2, e3).pipe(zipAll())).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
      expectSubscriptions(e3.subscriptions).toBe(e3subs);
    });
  });

  describe('with iterables', () => {
    it('should zip them with values', () => {
      rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
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

        expectObservable(of(e1, myIterator).pipe(zipAll<string | number>())).toBe(expected, values);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
      });
    });

    it('should complete instantly with never observable and empty iterable', () => {
      rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
        const a = cold('  -');
        const asubs = '   (^!)';
        const b: string[] = [];
        const expected = '|';

        expectObservable(of(a, b).pipe(zipAll())).toBe(expected);
        expectSubscriptions(a.subscriptions).toBe(asubs);
      });
    });

    it('should work with empty observable and empty iterable', () => {
      rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
        const a = cold('  |');
        const asubs = '   (^!)';
        const b: string[] = [];
        const expected = '|';

        expectObservable(of(a, b).pipe(zipAll())).toBe(expected);
        expectSubscriptions(a.subscriptions).toBe(asubs);
      });
    });

    it('should work with empty observable and non-empty iterable', () => {
      rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
        const a = cold('  |');
        const asubs = '   (^!)';
        const b = [1];
        const expected = '|';

        expectObservable(of(a, b).pipe(zipAll<string | number>())).toBe(expected);
        expectSubscriptions(a.subscriptions).toBe(asubs);
      });
    });

    it('should work with non-empty observable and empty iterable', () => {
      rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
        const a = hot('---^----a--|');
        const asubs = '   (^!)';
        const b: string[] = [];
        const expected = '|';

        expectObservable(of(a, b).pipe(zipAll())).toBe(expected);
        expectSubscriptions(a.subscriptions).toBe(asubs);
      });
    });

    it('should work with never observable and non-empty iterable', () => {
      rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
        const a = cold('  -');
        const asubs = '   ^';
        const b = [1];
        const expected = '-';

        expectObservable(of(a, b).pipe(zipAll<string | number>())).toBe(expected);
        expectSubscriptions(a.subscriptions).toBe(asubs);
      });
    });

    it('should work with non-empty observable and non-empty iterable', () => {
      rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
        const a = hot('---^----1--|');
        const asubs = '   ^----!   ';
        const b = [2];
        const expected = '-----(x|)';

        expectObservable(of(a, b).pipe(zipAll<string | number>())).toBe(expected, { x: ['1', 2] });
        expectSubscriptions(a.subscriptions).toBe(asubs);
      });
    });

    it('should work with observable which raises error and non-empty iterable', () => {
      rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
        const a = hot('---^----#');
        const asubs = '   ^----!';
        const b = [1];
        const expected = '-----#';

        expectObservable(of(a, b).pipe(zipAll<string | number>())).toBe(expected);
        expectSubscriptions(a.subscriptions).toBe(asubs);
      });
    });

    it('should work with non-empty many observable and non-empty many iterable', () => {
      rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
        const a = hot('---^--1--2--3--|');
        const asubs = '   ^--------!   ';
        const b = [4, 5, 6];
        const expected = '---x--y--(z|)';

        expectObservable(of(a, b).pipe(zipAll<string | number>())).toBe(expected, { x: ['1', 4], y: ['2', 5], z: ['3', 6] });
        expectSubscriptions(a.subscriptions).toBe(asubs);
      });
    });

    it('should work with non-empty observable and non-empty iterable selector that throws', () => {
      rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
        const a = hot('---^--1--2--3--|');
        const asubs = '   ^-----!';
        const b = [4, 5, 6];
        const expected = '---x--#';

        const selector = function (x: string, y: number) {
          if (y === 5) {
            throw new Error('too bad');
          } else {
            return x + y;
          }
        };
        expectObservable(of(a, b).pipe(zipAll(selector))).toBe(expected, { x: '14' }, new Error('too bad'));
        expectSubscriptions(a.subscriptions).toBe(asubs);
      });
    });
  });

  it('should combine two observables and selector', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('   ---1---2---3---');
      const asubs = '   ^';
      const b = hot('   --4--5--6--7--8--');
      const bsubs = '   ^';
      const expected = '---x---y---z';

      expectObservable(of(a, b).pipe(zipAll((e1, e2) => e1 + e2))).toBe(expected, { x: '14', y: '25', z: '36' });
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });

  it('should work with n-ary symmetric', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('   ---1-^-1----4----|');
      const asubs = '        ^---------!  ';
      const b = hot('   ---1-^--2--5----| ');
      const bsubs = '        ^---------!  ';
      const c = hot('   ---1-^---3---6-|  ');
      const expected = '     ----x---y-|  ';

      expectObservable(of(a, b, c).pipe(zipAll())).toBe(expected, { x: ['1', '2', '3'], y: ['4', '5', '6'] });
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });

  it('should work with n-ary symmetric selector', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('---1-^-1----4----|');
      const asubs = '     ^---------!  ';
      const b = hot('---1-^--2--5----| ');
      const bsubs = '     ^---------!  ';
      const c = hot('---1-^---3---6-|  ');
      const expected = '  ----x---y-|  ';

      const observable = of(a, b, c).pipe(zipAll((r0, r1, r2) => [r0, r1, r2]));
      expectObservable(observable).toBe(expected, { x: ['1', '2', '3'], y: ['4', '5', '6'] });
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });

  it('should work with n-ary symmetric array selector', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('   ---1-^-1----4----|');
      const asubs = '        ^---------!  ';
      const b = hot('   ---1-^--2--5----| ');
      const bsubs = '        ^---------!  ';
      const c = hot('   ---1-^---3---6-|  ');
      const expected = '     ----x---y-|  ';

      const observable = of(a, b, c).pipe(zipAll((r0, r1, r2) => [r0, r1, r2]));
      expectObservable(observable).toBe(expected, { x: ['1', '2', '3'], y: ['4', '5', '6'] });
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });

  it('should work with some data asymmetric 1', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('---1-^-1-3-5-7-9-x-y-z-w-u-|');
      const asubs = '     ^-----------------!    ';
      const b = hot('---1-^--2--4--6--8--0--|    ');
      const bsubs = '     ^-----------------!    ';
      const expected = '  ---a--b--c--d--e--|    ';

      expectObservable(of(a, b).pipe(zipAll((r1, r2) => r1 + r2))).toBe(expected, { a: '12', b: '34', c: '56', d: '78', e: '90' });
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });

  it('should work with some data asymmetric 2', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('---1-^--2--4--6--8--0--|    ');
      const asubs = '     ^-----------------!    ';
      const b = hot('---1-^-1-3-5-7-9-x-y-z-w-u-|');
      const bsubs = '     ^-----------------!    ';
      const expected = '  ---a--b--c--d--e--|    ';

      expectObservable(of(a, b).pipe(zipAll((r1, r2) => r1 + r2))).toBe(expected, { a: '21', b: '43', c: '65', d: '87', e: '09' });
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });

  it('should work with some data symmetric', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('---1-^-1-3-5-7-9------| ');
      const asubs = '     ^----------------! ';
      const b = hot('---1-^--2--4--6--8--0--|');
      const bsubs = '     ^----------------! ';
      const expected = '  ---a--b--c--d--e-| ';

      expectObservable(of(a, b).pipe(zipAll((r1, r2) => r1 + r2))).toBe(expected, { a: '12', b: '34', c: '56', d: '78', e: '90' });
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });

  it('should work with selector throws', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('---1-^-2---4----|  ');
      const asubs = '     ^-------!     ';
      const b = hot('---1-^--3----5----|');
      const bsubs = '     ^-------!     ';
      const expected = '  ---x----#     ';

      const selector = function (x: string, y: string) {
        if (y === '5') {
          throw new Error('too bad');
        } else {
          return x + y;
        }
      };
      const observable = of(a, b).pipe(zipAll(selector));
      expectObservable(observable).toBe(expected, { x: '23' }, new Error('too bad'));
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });

  // TODO: This does not seem to belong in this battery of tests.
  it('should work with right completes first', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('---1-^-2-----|');
      const asubs = '     ^-----!';
      const b = hot('---1-^--3--|');
      const bsubs = '     ^-----!';
      const expected = '  ---x--|';

      expectObservable(zip(a, b)).toBe(expected, { x: ['2', '3'] });
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });

  it('should zip until one child terminates', (done) => {
    const expected = ['a1', 'b2'];
    let i = 0;
    of(of('a', 'b', 'c'), of(1, 2))
      .pipe(zipAll((a: string, b: number) => a + b))
      .subscribe({
        next: (x) => {
          expect(x).to.equal(expected[i++]);
        },
        complete: done,
      });
  });

  it('should handle a hot observable of observables', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const x = cold('          a---b---c---|      ');
      const xsubs = '   --------^-----------!';
      const y = cold('          d---e---f---|   ');
      const ysubs = '   --------^-----------!';
      const e1 = hot('  --x--y--|            ', { x: x, y: y });
      const e1subs = '  ^-------!            ';
      const expected = '--------u---v---w---|';
      const values = {
        u: ['a', 'd'],
        v: ['b', 'e'],
        w: ['c', 'f'],
      };

      expectObservable(e1.pipe(zipAll())).toBe(expected, values);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should handle merging a hot observable of non-overlapped observables', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const x = cold('                             a-b---------|');
      const xsubs = '   ---------------------------^-----------!';
      const y = cold('                             c-d-e-f-|');
      const ysubs = '   ---------------------------^-------!';
      const z = cold('                             g-h-i-j-k-|');
      const zsubs = '   ---------------------------^---------!';
      const e1 = hot('  --x------y--------z--------|            ', { x: x, y: y, z: z });
      const e1subs = '  ^--------------------------!            ';
      const expected = '---------------------------u-v---------|';
      const values = {
        u: ['a', 'c', 'g'],
        v: ['b', 'd', 'h'],
      };

      expectObservable(e1.pipe(zipAll())).toBe(expected, values);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(z.subscriptions).toBe(zsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should raise error if inner observable raises error', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const x = cold('                                a-b---------|');
      const xsubs = '   ------------------------------^-------!';
      const y = cold('                                c-d-e-f-#');
      const ysubs = '   ------------------------------^-------!';
      const z = cold('                                g-h-i-j-k-|');
      const zsubs = '   ------------------------------^-------!';
      const e1 = hot('  --x---------y--------z--------|        ', { x: x, y: y, z: z });
      const e1subs = '  ^-----------------------------!        ';
      const expected = '------------------------------u-v-----#';

      const expectedValues = {
        u: ['a', 'c', 'g'],
        v: ['b', 'd', 'h'],
      };

      expectObservable(e1.pipe(zipAll())).toBe(expected, expectedValues);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(z.subscriptions).toBe(zsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should raise error if outer observable raises error', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const y = cold('  a-b---------|');
      const z = cold('  c-d-e-f-|');
      const e1 = hot('  --y---------z---#', { y: y, z: z });
      const e1subs = '  ^---------------!';
      const expected = '----------------#';

      expectObservable(e1.pipe(zipAll())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should work with two nevers', () => {
    rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const a = cold('  -');
      const asubs = '   ^';
      const b = cold('  -');
      const bsubs = '   ^';
      const expected = '-';

      expectObservable(of(a, b).pipe(zipAll())).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });

  it('should work with never and empty', () => {
    rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const a = cold('  -');
      const asubs = '   (^!)';
      const b = cold('  |');
      const bsubs = '   (^!)';
      const expected = '|';

      expectObservable(of(a, b).pipe(zipAll())).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });

  it('should work with empty and never', () => {
    rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const a = cold('  |');
      const asubs = '   (^!)';
      const b = cold('  -');
      const bsubs = '   (^!)';
      const expected = '|';

      expectObservable(of(a, b).pipe(zipAll())).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });

  it('should work with empty and empty', () => {
    rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const a = cold('  |');
      const asubs = '   (^!)';
      const b = cold('  |');
      const bsubs = '   (^!)';
      const expected = '|';

      expectObservable(of(a, b).pipe(zipAll())).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });

  it('should work with empty and non-empty', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const a = cold('  |');
      const asubs = '   (^!)';
      const b = hot('   ---1--|');
      const bsubs = '   (^!)';
      const expected = '|';

      expectObservable(of(a, b).pipe(zipAll())).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });

  it('should work with non-empty and empty', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const a = hot('   ---1--|');
      const asubs = '   (^!)';
      const b = cold('  |');
      const bsubs = '   (^!)';
      const expected = '|';

      expectObservable(of(a, b).pipe(zipAll())).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });

  it('should work with never and non-empty', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const a = cold('  -');
      const asubs = '   ^';
      const b = hot('   ---1--|');
      const bsubs = '   ^-----!';
      const expected = '-';

      expectObservable(of(a, b).pipe(zipAll())).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });

  it('should work with non-empty and never', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const a = hot('   ---1--|');
      const asubs = '   ^-----!';
      const b = cold('  -');
      const bsubs = '   ^';
      const expected = '-';

      expectObservable(of(a, b).pipe(zipAll())).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });

  it('should combine a source with a second', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('   ---1---2---3---');
      const asubs = '   ^';
      const b = hot('   --4--5--6--7--8--');
      const bsubs = '   ^';
      const expected = '---x---y---z';

      expectObservable(of(a, b).pipe(zipAll())).toBe(expected, { x: ['1', '4'], y: ['2', '5'], z: ['3', '6'] });
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });

  it('should work with empty and error', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const a = cold('  |');
      const asubs = '   (^!)';
      const b = hot('   ------#', undefined, 'too bad');
      const bsubs = '   (^!)';
      const expected = '|';

      expectObservable(of(a, b).pipe(zipAll())).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });

  it('should work with error and empty', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const a = hot('   ------#', undefined, 'too bad');
      const asubs = '   (^!)';
      const b = cold('  |');
      const bsubs = '   (^!)';
      const expected = '|';

      expectObservable(of(a, b).pipe(zipAll())).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });

  it('should work with error', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('   ----------|');
      const asubs = '   ^-----!    ';
      const b = hot('   ------#    ');
      const bsubs = '   ^-----!    ';
      const expected = '------#    ';

      expectObservable(of(a, b).pipe(zipAll())).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });

  it('should work with never and error', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const a = cold('  -');
      const asubs = '   ^-----!';
      const b = hot('   ------#');
      const bsubs = '   ^-----!';
      const expected = '------#';

      expectObservable(of(a, b).pipe(zipAll())).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });

  it('should work with error and never', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const a = hot('   ------#');
      const asubs = '   ^-----!';
      const b = cold('  -');
      const bsubs = '   ^-----!';
      const expected = '------#';

      expectObservable(of(a, b).pipe(zipAll())).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });

  it('should work with error and error', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('   ------#', undefined, 'too bad');
      const asubs = '   ^-----!';
      const b = hot('   ----------#', undefined, 'too bad 2');
      const bsubs = '   ^-----!';
      const expected = '------#';

      expectObservable(of(a, b).pipe(zipAll())).toBe(expected, null, 'too bad');
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });

  it('should work with two sources that eventually raise errors', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('   --w-----#----', { w: 1 }, 'too bad');
      const asubs = '   ^-------!';
      const b = hot('   -----z-----#-', { z: 2 }, 'too bad 2');
      const bsubs = '   ^-------!';
      const expected = '-----x--#';

      expectObservable(of(a, b).pipe(zipAll())).toBe(expected, { x: [1, 2] }, 'too bad');
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });

  it('should work with two sources that eventually raise errors (swapped)', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('   -----z-----#-', { z: 2 }, 'too bad 2');
      const asubs = '   ^-------!';
      const b = hot('   --w-----#', { w: 1 }, 'too bad');
      const bsubs = '   ^-------!';
      const expected = '-----x--#';

      expectObservable(of(a, b).pipe(zipAll())).toBe(expected, { x: [2, 1] }, 'too bad');
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });

  it('should work with error and some', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const a = cold('  #');
      const asubs = '   (^!)';
      const b = hot('   --1--2--3--');
      const bsubs = '   (^!)';
      const expected = '#';

      expectObservable(of(a, b).pipe(zipAll())).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });

  it('should combine two immediately-scheduled observables', (done) => {
    rxTestScheduler.run(() => {
      const a = scheduled([1, 2, 3], queueScheduler);
      const b = scheduled([4, 5, 6, 7, 8], queueScheduler);
      const r = [
        [1, 4],
        [2, 5],
        [3, 6],
      ];
      let i = 0;

      const result = scheduled([a, b], queueScheduler).pipe(zipAll());

      result.subscribe({
        next(vals) {
          expect(vals).to.deep.equal(r[i++]);
        },
        complete: done,
      });
    });
  });

  it('should combine a source with an immediately-scheduled source', (done) => {
    const a = scheduled([1, 2, 3], queueScheduler);
    const b = of(4, 5, 6, 7, 8);
    const r = [
      [1, 4],
      [2, 5],
      [3, 6],
    ];
    let i = 0;

    const result = scheduled([a, b], queueScheduler).pipe(zipAll());

    result.subscribe({
      next(vals) {
        expect(vals).to.deep.equal(r[i++]);
      },
      complete: done,
    });
  });

  it('should not break unsubscription chain when unsubscribed explicitly', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('   ---1---2---3---|');
      const unsub = '   ---------!';
      const asubs = '   ^--------!';
      const b = hot('   --4--5--6--7--8--|');
      const bsubs = '   ^--------!';
      const expected = '---x---y--';
      const values = { x: ['1', '4'], y: ['2', '5'] };

      const r = of(a, b).pipe(
        mergeMap((x) => of(x)),
        zipAll(),
        mergeMap((x) => of(x))
      );

      expectObservable(r, unsub).toBe(expected, values);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });

  it('should complete when empty source', () => {
    rxTestScheduler.run(({ hot, expectObservable }) => {
      const source = hot('|');
      const expected = '  |';

      expectObservable(source.pipe(zipAll())).toBe(expected);
    });
  });
});
