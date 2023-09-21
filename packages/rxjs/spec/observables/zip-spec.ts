/** @prettier */
import { expect } from 'chai';
import { queueScheduler as rxQueueScheduler, zip, from, scheduled } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { observableMatcher } from '../helpers/observableMatcher';

const queueScheduler = rxQueueScheduler;

/** @test {zip} */
describe('zip', () => {
  let rxTestScheduler: TestScheduler;

  beforeEach(() => {
    rxTestScheduler = new TestScheduler(observableMatcher);
  });

  it('should combine a source with a second', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('   ---1---2---3---  ');
      const asubs = '   ^                ';
      const b = hot('   --4--5--6--7--8--');
      const bsubs = '   ^                ';
      const expected = '---x---y---z     ';

      expectObservable(zip(a, b)).toBe(expected, { x: ['1', '4'], y: ['2', '5'], z: ['3', '6'] });
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });

  it('should zip the provided observables', (done) => {
    const expected = ['a1', 'b2', 'c3'];
    let i = 0;

    zip(from(['a', 'b', 'c']), from([1, 2, 3]), (a: string, b: number) => a + b).subscribe({
      next: (x: string) => {
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

      expectObservable(zip(e1, e2, e3)).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
      expectSubscriptions(e3.subscriptions).toBe(e3subs);
    });
  });

  it('should end once one observable nexts and zips value from completed other observable whose buffer is empty', () => {
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

      expectObservable(zip(e1, e2, e3)).toBe(expected, values);
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
        const e1subs = '  ^--------------!    ';
        const expected = '---w---x---y---(z|) ';

        const values = {
          w: ['a', 0],
          x: ['b', 1],
          y: ['c', 2],
          z: ['d', 3],
        };

        expectObservable(zip(e1, myIterator)).toBe(expected, values);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
      });
    });

    it('should work with empty observable and empty iterable', () => {
      rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
        const a = cold('|  ');
        const asubs = '(^!)';
        const b: number[] = [];
        const expected = '|';

        expectObservable(zip(a, b)).toBe(expected);
        expectSubscriptions(a.subscriptions).toBe(asubs);
      });
    });

    it('should work with empty observable and non-empty iterable', () => {
      rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
        const a = cold('  |   ');
        const asubs = '   (^!)';
        const b = [1];
        const expected = '|   ';

        expectObservable(zip(a, b)).toBe(expected);
        expectSubscriptions(a.subscriptions).toBe(asubs);
      });
    });

    it('should complete instantly if given an empty iterable', () => {
      rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
        const a = hot('---^----a--|');
        const asubs = '   (^!)     ';
        const b: number[] = [];
        const expected = '|        ';

        expectObservable(zip(a, b)).toBe(expected);
        expectSubscriptions(a.subscriptions).toBe(asubs);
      });
    });

    it('should work with never observable and non-empty iterable', () => {
      rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
        const a = cold('  -');
        const asubs = '   ^';
        const b = [1];
        const expected = '-';

        expectObservable(zip(a, b)).toBe(expected);
        expectSubscriptions(a.subscriptions).toBe(asubs);
      });
    });

    it('should work with non-empty observable and non-empty iterable', () => {
      rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
        const a = hot('---^----1--|');
        const asubs = '   ^----!   ';
        const b = [2];
        const expected = '-----(x|)';

        expectObservable(zip(a, b)).toBe(expected, { x: ['1', 2] });
        expectSubscriptions(a.subscriptions).toBe(asubs);
      });
    });

    it('should work with observable which raises error and non-empty iterable', () => {
      rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
        const a = hot('---^----#');
        const asubs = '   ^----!';
        const b = [1];
        const expected = '-----#';

        expectObservable(zip(a, b)).toBe(expected);
        expectSubscriptions(a.subscriptions).toBe(asubs);
      });
    });

    it('should work with non-empty many observable and non-empty many iterable', () => {
      rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
        const a = hot('---^--1--2--3--|');
        const asubs = '   ^--------!   ';
        const b = [4, 5, 6];
        const expected = '---x--y--(z|)';

        expectObservable(zip(a, b)).toBe(expected, { x: ['1', 4], y: ['2', 5], z: ['3', 6] });
        expectSubscriptions(a.subscriptions).toBe(asubs);
      });
    });

    it('should work with non-empty observable and non-empty iterable selector that throws', () => {
      rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
        const a = hot('---^--1--2--3--|');
        const asubs = '   ^-----!      ';
        const b = [4, 5, 6];
        const expected = '---x--#      ';

        const selector = (x: string, y: number) => {
          if (y === 5) {
            throw new Error('too bad');
          } else {
            return x + y;
          }
        };
        expectObservable(zip(a, b, selector)).toBe(expected, { x: '14' }, new Error('too bad'));
        expectSubscriptions(a.subscriptions).toBe(asubs);
      });
    });
  });

  it('should combine two observables and selector', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('   ---1---2---3---  ');
      const asubs = '   ^                ';
      const b = hot('   --4--5--6--7--8--');
      const bsubs = '   ^                ';
      const expected = '---x---y---z     ';

      expectObservable(zip(a, b, (e1: string, e2: string) => e1 + e2)).toBe(expected, { x: '14', y: '25', z: '36' });
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });

  it('should work with n-ary symmetric', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('---1-^-1----4----|');
      const asubs = '     ^---------!  ';
      const b = hot('---1-^--2--5----| ');
      const bsubs = '     ^---------!  ';
      const c = hot('---1-^---3---6-|  ');
      const expected = '  ----x---y-|  ';

      expectObservable(zip(a, b, c)).toBe(expected, { x: ['1', '2', '3'], y: ['4', '5', '6'] });
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

      const observable = zip(a, b, c, (r0: string, r1: string, r2: string) => [r0, r1, r2]);
      expectObservable(observable).toBe(expected, { x: ['1', '2', '3'], y: ['4', '5', '6'] });
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });

  it('should work with n-ary symmetric array selector', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('---1-^-1----4----|');
      const asubs = '     ^---------!  ';
      const b = hot('---1-^--2--5----| ');
      const bsubs = '     ^---------!  ';
      const c = hot('---1-^---3---6-|  ');
      const expected = '  ----x---y-|  ';

      const observable = zip(a, b, c, (r0: string, r1: string, r2: string) => [r0, r1, r2]);
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

      expectObservable(zip(a, b, (r1: string, r2: string) => r1 + r2)).toBe(expected, { a: '12', b: '34', c: '56', d: '78', e: '90' });
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

      expectObservable(zip(a, b, (r1: string, r2: string) => r1 + r2)).toBe(expected, { a: '21', b: '43', c: '65', d: '87', e: '09' });
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

      expectObservable(zip(a, b, (r1: string, r2: string) => r1 + r2)).toBe(expected, { a: '12', b: '34', c: '56', d: '78', e: '90' });
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

      const selector = (x: string, y: string) => {
        if (y === '5') {
          throw new Error('too bad');
        } else {
          return x + y;
        }
      };
      const observable = zip(a, b, selector);
      expectObservable(observable).toBe(expected, { x: '23' }, new Error('too bad'));
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });

  it('should work with right completes first', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('---1-^-2-----|');
      const asubs = '     ^-----!  ';
      const b = hot('---1-^--3--|  ');
      const bsubs = '     ^-----!  ';
      const expected = '  ---x--|  ';

      expectObservable(zip(a, b)).toBe(expected, { x: ['2', '3'] });
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });

  it('should work with two nevers', () => {
    rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const a = cold('  -');
      const asubs = '   ^';
      const b = cold('  -');
      const bsubs = '   ^';
      const expected = '-';

      expectObservable(zip(a, b)).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });

  it('should work with never and empty', () => {
    rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const a = cold('  -   ');
      const asubs = '   (^!)';
      const b = cold('  |   ');
      const bsubs = '   (^!)';
      const expected = '|   ';

      expectObservable(zip(a, b)).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });

  it('should work with empty and never', () => {
    rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const a = cold('  |   ');
      const asubs = '   (^!)';
      const b = cold('  -   ');
      const bsubs = '   (^!)';
      const expected = '|   ';

      expectObservable(zip(a, b)).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });

  it('should work with empty and empty', () => {
    rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const a = cold('  |   ');
      const asubs = '   (^!)';
      const b = cold('  |   ');
      const bsubs = '   (^!)';
      const expected = '|   ';

      expectObservable(zip(a, b)).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });

  it('should work with empty and non-empty', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const a = cold('  |      ');
      const asubs = '   (^!)   ';
      const b = hot('   ---1--|');
      const bsubs = '   (^!)   ';
      const expected = '|      ';

      expectObservable(zip(a, b)).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });

  it('should work with non-empty and empty', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const a = hot('   ---1--|');
      const asubs = '   (^!)   ';
      const b = cold('  |      ');
      const bsubs = '   (^!)   ';
      const expected = '|      ';

      expectObservable(zip(a, b)).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });

  it('should work with never and non-empty', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const a = cold('  -      ');
      const asubs = '   ^      ';
      const b = hot('   ---1--|');
      const bsubs = '   ^-----!';
      const expected = '-      ';

      expectObservable(zip(a, b)).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });

  it('should work with non-empty and never', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const a = hot('   ---1--|');
      const asubs = '   ^-----!';
      const b = cold('  -      ');
      const bsubs = '   ^      ';
      const expected = '-      ';

      expectObservable(zip(a, b)).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });

  it('should work with empty and error', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const a = cold('  |      ');
      const asubs = '   (^!)   ';
      const b = hot('   ------#', undefined, 'too bad');
      const bsubs = '   (^!)   ';
      const expected = '|      ';

      expectObservable(zip(a, b)).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });

  it('should work with error and empty', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const a = hot('   ------#', undefined, 'too bad');
      const asubs = '   (^!)   ';
      const b = cold('  |      ');
      const bsubs = '   (^!)   ';
      const expected = '|      ';

      expectObservable(zip(a, b)).toBe(expected);
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

      expectObservable(zip(a, b)).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });

  it('should work with never and error', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const a = cold('  -      ');
      const asubs = '   ^-----!';
      const b = hot('   ------#');
      const bsubs = '   ^-----!';
      const expected = '------#';

      expectObservable(zip(a, b)).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });

  it('should work with error and never', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const a = hot('   ------#');
      const asubs = '   ^-----!';
      const b = cold('  -      ');
      const bsubs = '   ^-----!';
      const expected = '------#';

      expectObservable(zip(a, b)).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });

  it('should work with error and error', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('   ------#    ', undefined, 'too bad');
      const asubs = '   ^-----!    ';
      const b = hot('   ----------#', undefined, 'too bad 2');
      const bsubs = '   ^-----!    ';
      const expected = '------#    ';

      expectObservable(zip(a, b)).toBe(expected, null, 'too bad');
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });

  it('should work with two sources that eventually raise errors', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('   --w-----#----', { w: 1 }, 'too bad');
      const asubs = '   ^-------!    ';
      const b = hot('   -----z-----#-', { z: 2 }, 'too bad 2');
      const bsubs = '   ^-------!    ';
      const expected = '-----x--#    ';

      expectObservable(zip(a, b)).toBe(expected, { x: [1, 2] }, 'too bad');
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });

  it('should work with two sources that eventually raise errors (swapped)', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('   -----z-----#-', { z: 2 }, 'too bad 2');
      const asubs = '   ^-------!    ';
      const b = hot('   --w-----#----', { w: 1 }, 'too bad');
      const bsubs = '   ^-------!    ';
      const expected = '-----x--#    ';

      expectObservable(zip(a, b)).toBe(expected, { x: [2, 1] }, 'too bad');
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });

  it('should work with error and some', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const a = cold('  #          ');
      const asubs = '   (^!)       ';
      const b = hot('   --1--2--3--');
      const bsubs = '   (^!)       ';
      const expected = '#          ';

      expectObservable(zip(a, b)).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });

  it('should combine an immediately-scheduled source with an immediately-scheduled second', (done) => {
    const a = scheduled([1, 2, 3], queueScheduler);
    const b = scheduled([4, 5, 6, 7, 8], queueScheduler);
    const r = [
      [1, 4],
      [2, 5],
      [3, 6],
    ];
    let i = 0;

    zip(a, b).subscribe({
      next: (vals: Array<number>) => {
        expect(vals).to.deep.equal(r[i++]);
      },
      complete: done,
    });
  });

  it('should be able to zip all iterables', () => {
    const results: any[] = [];
    zip('abc', '123', 'xyz').subscribe({
      next: (value) => results.push(value),
      complete: () => results.push('complete'),
    });
    expect(results).to.deep.equal([['a', '1', 'x'], ['b', '2', 'y'], ['c', '3', 'z'], 'complete']);
  });

  it('should return EMPTY if passed an empty array as the only argument', () => {
    const results: string[] = [];
    zip([]).subscribe({
      next: () => {
        throw new Error('should not emit');
      },
      complete: () => {
        results.push('done');
      },
    });

    expect(results).to.deep.equal(['done']);
  });
});
