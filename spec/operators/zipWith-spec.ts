import { expect } from 'chai';
import { zipWith, mergeMap } from 'rxjs/operators';
import { queueScheduler, of } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { observableMatcher } from '../helpers/observableMatcher';
/** @test {zip} */
describe('zipWith', () => {
  let rxTestScheduler: TestScheduler;

  beforeEach(() => {
    rxTestScheduler = new TestScheduler(observableMatcher);
  });

  it('should combine a source with a second', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('   ---1---2---3---');
      const asubs = '   ^';
      const b = hot('   --4--5--6--7--8--');
      const bsubs = '   ^';
      const expected = '---x---y---z';
      expectObservable(a.pipe(zipWith(b))).toBe(expected, { x: ['1', '4'], y: ['2', '5'], z: ['3', '6'] });
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
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

      expectObservable(e1.pipe(zipWith(e2, e3))).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
      expectSubscriptions(e3.subscriptions).toBe(e3subs);
    });
  });

  it(
    'should end once one observable nexts and zips value from completed other ' + 'observable whose buffer is empty',
    () => {
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

        expectObservable(e1.pipe(zipWith(e2, e3))).toBe(expected, values);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
        expectSubscriptions(e3.subscriptions).toBe(e3subs);
      });
    }
  );

  describe('with iterables', () => {
    it('should zip them with values', () => {
      rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
        const myIterator = <any>{
          count: 0,
          next: function() {
            return { value: this.count++, done: false };
          },
        };
        myIterator[Symbol.iterator] = function() {
          return this;
        };

        const e1 = hot('  ---a---b---c---d---|');
        const e1subs = '  ^------------------!';
        const expected = '---w---x---y---z---|';

        const values = {
          w: ['a', 0],
          x: ['b', 1],
          y: ['c', 2],
          z: ['d', 3],
        };

        expectObservable(e1.pipe(zipWith(myIterator))).toBe(expected, values);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
      });
    });

    it('should only call `next` as needed', () => {
      let nextCalled = 0;
      const myIterator = <any>{
        count: 0,
        next: function() {
          nextCalled++;
          return { value: this.count++, done: false };
        },
      };
      myIterator[Symbol.iterator] = function() {
        return this;
      };

      of(1, 2, 3)
        .pipe(zipWith(myIterator))
        .subscribe();

      // since zip will call `next()` in advance, total calls when
      // zipped with 3 other values should be 4.
      expect(nextCalled).to.equal(4);
    });

    it('should work with never observable and empty iterable', () => {
      rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
        const a = cold('  -');
        const asubs = '   ^';
        const expected = '-';
        const b: string[] = [];

        expectObservable(a.pipe(zipWith(b))).toBe(expected);
        expectSubscriptions(a.subscriptions).toBe(asubs);
      });
    });

    it('should work with empty observable and empty iterable', () => {
      rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
        const a = cold('  |');
        const asubs = '   (^!)';
        const expected = '|';
        const b: string[] = [];

        expectObservable(a.pipe(zipWith(b))).toBe(expected);
        expectSubscriptions(a.subscriptions).toBe(asubs);
      });
    });

    it('should work with empty observable and non-empty iterable', () => {
      rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
        const a = cold('  |');
        const asubs = '   (^!)';
        const expected = '|';
        const b = [1];

        expectObservable(a.pipe(zipWith(b))).toBe(expected);
        expectSubscriptions(a.subscriptions).toBe(asubs);
      });
    });

    it('should work with non-empty observable and empty iterable', () => {
      rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
        const a = hot('   ---^----a--|');
        const asubs = '   ^-------!';
        const b: string[] = [];
        const expected = '--------|';

        expectObservable(a.pipe(zipWith(b))).toBe(expected);
        expectSubscriptions(a.subscriptions).toBe(asubs);
      });
    });

    it('should work with never observable and non-empty iterable', () => {
      rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
        const a = cold('  -');
        const asubs = '   ^';
        const expected = '-';
        const b = [1];

        expectObservable(a.pipe(zipWith(b))).toBe(expected);
        expectSubscriptions(a.subscriptions).toBe(asubs);
      });
    });

    it('should work with non-empty observable and non-empty iterable', () => {
      rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
        const a = hot('---^----1--|');
        const asubs = '   ^----!   ';
        const expected = '-----(x|)';
        const b = [2];

        expectObservable(a.pipe(zipWith(b))).toBe(expected, { x: ['1', 2] });
        expectSubscriptions(a.subscriptions).toBe(asubs);
      });
    });

    it('should work with non-empty observable and empty iterable', () => {
      rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
        const a = hot('---^----#');
        const asubs = '   ^----!';
        const expected = '-----#';
        const b: string[] = [];

        expectObservable(a.pipe(zipWith(b))).toBe(expected);
        expectSubscriptions(a.subscriptions).toBe(asubs);
      });
    });

    it('should work with observable which raises error and non-empty iterable', () => {
      rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
        const a = hot('---^----#');
        const asubs = '   ^----!';
        const expected = '-----#';
        const b = [1];

        expectObservable(a.pipe(zipWith(b))).toBe(expected);
        expectSubscriptions(a.subscriptions).toBe(asubs);
      });
    });

    it('should work with non-empty many observable and non-empty many iterable', () => {
      rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
        const a = hot('---^--1--2--3--|');
        const asubs = '   ^--------!   ';
        const expected = '---x--y--(z|)';
        const b = [4, 5, 6];

        expectObservable(a.pipe(zipWith(b))).toBe(expected, { x: ['1', 4], y: ['2', 5], z: ['3', 6] });
        expectSubscriptions(a.subscriptions).toBe(asubs);
      });
    });

    it('should work with non-empty observable and non-empty iterable selector that throws', () => {
      rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
        const a = hot('---^--1--2--3--|');
        const asubs = '   ^-----!';
        const expected = '---x--#';
        const b = [4, 5, 6];

        const selector = function(x: string, y: number) {
          if (y === 5) {
            throw new Error('too bad');
          } else {
            return x + y;
          }
        };
        expectObservable(a.pipe(zipWith(b, selector))).toBe(expected, { x: '14' }, new Error('too bad'));
        expectSubscriptions(a.subscriptions).toBe(asubs);
      });
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

      expectObservable(a.pipe(zipWith(b, c))).toBe(expected, { x: ['1', '2', '3'], y: ['4', '5', '6'] });
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });

  it('should work with right completes first', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('---1-^-2-----|');
      const asubs = '     ^-----!';
      const b = hot('---1-^--3--|');
      const bsubs = '     ^-----!';
      const expected = '  ---x--|';

      expectObservable(a.pipe(zipWith(b))).toBe(expected, { x: ['2', '3'] });
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

      expectObservable(a.pipe(zipWith(b))).toBe(expected);
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

      expectObservable(a.pipe(zipWith(b))).toBe(expected);
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

      expectObservable(a.pipe(zipWith(b))).toBe(expected);
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

      expectObservable(a.pipe(zipWith(b))).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });

  it('should work with empty and non-empty', () => {
    rxTestScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const a = cold('  |');
      const asubs = '   (^!)';
      const b = hot('   ---1--|');
      const bsubs = '   (^!)';
      const expected = '|';

      expectObservable(a.pipe(zipWith(b))).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });

  it('should work with non-empty and empty', () => {
    rxTestScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const a = hot('   ---1--|');
      const asubs = '   (^!)';
      const b = cold('  |');
      const bsubs = '   (^!)';
      const expected = '|';

      expectObservable(a.pipe(zipWith(b))).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });

  it('should work with never and non-empty', () => {
    rxTestScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const a = cold('  -');
      const asubs = '   ^';
      const b = hot('   ---1--|');
      const bsubs = '   ^-----!';
      const expected = '-';

      expectObservable(a.pipe(zipWith(b))).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });

  it('should work with non-empty and never', () => {
    rxTestScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const a = hot('   ---1--|');
      const asubs = '   ^-----!';
      const b = cold('  -');
      const bsubs = '   ^';
      const expected = '-';

      expectObservable(a.pipe(zipWith(b))).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });

  it('should work with empty and error', () => {
    rxTestScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const a = cold('  |');
      const asubs = '   (^!)';
      const b = hot('   ------#', undefined, 'too bad');
      const bsubs = '   (^!)';
      const expected = '|';

      expectObservable(a.pipe(zipWith(b))).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });

  it('should work with error and empty', () => {
    rxTestScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const a = hot('   ------#', undefined, 'too bad');
      const asubs = '   (^!)';
      const b = cold('  |');
      const bsubs = '   (^!)';
      const expected = '|';

      expectObservable(a.pipe(zipWith(b))).toBe(expected);
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

      expectObservable(a.pipe(zipWith(b))).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });

  it('should work with never and error', () => {
    rxTestScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const a = cold('  -------');
      const asubs = '   ^-----!';
      const b = hot('   ------#');
      const bsubs = '   ^-----!';
      const expected = '------#';

      expectObservable(a.pipe(zipWith(b))).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });

  it('should work with error and never', () => {
    rxTestScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const a = hot('   ------#');
      const asubs = '   ^-----!';
      const b = cold('  -------');
      const bsubs = '   ^-----!';
      const expected = '------#';

      expectObservable(a.pipe(zipWith(b))).toBe(expected);
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

      expectObservable(a.pipe(zipWith(b))).toBe(expected, null, 'too bad');
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

      expectObservable(a.pipe(zipWith(b))).toBe(expected, { x: [1, 2] }, 'too bad');
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });

  it('should work with two sources that eventually raise errors (swapped)', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('   -----z-----#-', { z: 2 }, 'too bad 2');
      const asubs = '   ^-------!';
      const b = hot('   --w-----#----', { w: 1 }, 'too bad');
      const bsubs = '   ^-------!';
      const expected = '-----x--#';

      expectObservable(a.pipe(zipWith(b))).toBe(expected, { x: [2, 1] }, 'too bad');
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });

  it('should work with error and some', () => {
    rxTestScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const a = cold('  #');
      const asubs = '   (^!)';
      const b = hot('   --1--2--3--');
      const bsubs = '   (^!)';
      const expected = '#';

      expectObservable(a.pipe(zipWith(b))).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });

  it('should combine an immediately-scheduled source with an immediately-scheduled second', done => {
    const a = of(1, 2, 3, queueScheduler);
    const b = of(4, 5, 6, 7, 8, queueScheduler);
    const r = [
      [1, 4],
      [2, 5],
      [3, 6],
    ];
    let i = 0;

    a.pipe(zipWith(b)).subscribe(
      function(vals) {
        expect(vals).to.deep.equal(r[i++]);
      },
      null,
      done
    );
  });

  it('should not break unsubscription chain when unsubscribed explicitly', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('   ---1---2---3---|');
      const unsub = '   ---------!';
      const asubs = '   ^--------!';
      const b = hot('   --4--5--6--7--8--|');
      const bsubs = '   ^--------!';
      const expected = '---x---y--';

      const r = a.pipe(
        mergeMap(x => of(x)),
        zipWith(b),
        mergeMap(x => of(x))
      );

      expectObservable(r, unsub).toBe(expected, { x: ['1', '4'], y: ['2', '5'] });
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });
});
