// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/zipWith-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { ColdObservable } from 'rxjs/cold-observable';
import { mergeMap } from 'rxjs/merge-map';
import { zipWith } from 'rxjs/zip-with';
describe('zipWith (cold)', () => {
  it('should combine a source with a second', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('   ---1---2---3-----');
      const asubs = '^-----------------!';
      const b = hot('   --4--5--6--7--8--');
      const bsubs = '^-----------------!';
      const expected = '---x---y---z-----';
      expectObservable(a[zipWith](b), '^-----------------!').toBe(expected, { x: ['1', '4'], y: ['2', '5'], z: ['3', '6'] });
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
      expectObservable(e1[zipWith](e2, e3)).toBe(expected, values);
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
      expectObservable(e1[zipWith](e2, e3)).toBe(expected, values);
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
      expectObservable(e1[zipWith](myIterator)).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should complete instantly for an empty iterable', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const a = cold('  -');
      const asubs = '   (^!)';
      const expected = '|';
      const b = [];
      expectObservable(a[zipWith](b)).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
    });
  });
  it('should work with empty observable and empty iterable', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const a = cold('  |');
      const asubs = '   (^!)';
      const expected = '|';
      const b = [];
      expectObservable(a[zipWith](b)).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
    });
  });
  it('should work with empty observable and non-empty iterable', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const a = cold('  |');
      const asubs = '   (^!)';
      const expected = '|';
      const b = [1];
      expectObservable(a[zipWith](b)).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
    });
  });
  it('should complete instantly with non-empty observable and empty iterable', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('   ---^----a--|');
      const asubs = '      (^!)';
      const b = [];
      const expected = '   |';
      expectObservable(a[zipWith](b)).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
    });
  });
  it('should work with never observable and non-empty iterable', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const a = cold('  -');
      const asubs = '^!';
      const expected = '-';
      const b = [1];
      expectObservable(a[zipWith](b), '^!').toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
    });
  });
  it('should work with non-empty observable and non-empty iterable', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('---^----1--|');
      const asubs = '   ^----!   ';
      const expected = '-----(x|)';
      const b = [2];
      expectObservable(a[zipWith](b)).toBe(expected, { x: ['1', 2] });
      expectSubscriptions(a.subscriptions).toBe(asubs);
    });
  });
  it('should work with observable which raises error and non-empty iterable', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('---^----#');
      const asubs = '   ^----!';
      const expected = '-----#';
      const b = [1];
      expectObservable(a[zipWith](b)).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
    });
  });
  it('should work with non-empty many observable and non-empty many iterable', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('---^--1--2--3--|');
      const asubs = '   ^--------!   ';
      const expected = '---x--y--(z|)';
      const b = [4, 5, 6];
      expectObservable(a[zipWith](b)).toBe(expected, { x: ['1', 4], y: ['2', 5], z: ['3', 6] });
      expectSubscriptions(a.subscriptions).toBe(asubs);
    });
  });
  it('should work with n-ary symmetric', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('---1-^-1----4----|');
      const asubs = '     ^---------!  ';
      const b = hot('---1-^--2--5----| ');
      const bsubs = '     ^---------!  ';
      const c = hot('---1-^---3---6-|  ');
      const expected = '  ----x---y-|  ';
      expectObservable(a[zipWith](b, c)).toBe(expected, { x: ['1', '2', '3'], y: ['4', '5', '6'] });
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
      expectObservable(a[zipWith](b)).toBe(expected, { x: ['2', '3'] });
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });
  it('should work with two nevers', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const a = cold('  -');
      const asubs = '^!';
      const b = cold('  -');
      const bsubs = '^!';
      const expected = '-';
      expectObservable(a[zipWith](b), '^!').toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });
  it('should work with never and empty', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const a = cold('  -');
      const asubs = '   (^!)';
      const b = cold('  |');
      const bsubs = '   (^!)';
      const expected = '|';
      expectObservable(a[zipWith](b)).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });
  it('should work with empty and never', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const a = cold('  |');
      const asubs = '   (^!)';
      const b = cold('  -');
      const bsubs = '   (^!)';
      const expected = '|';
      expectObservable(a[zipWith](b)).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });
  it('should work with empty and empty', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const a = cold('  |');
      const asubs = '   (^!)';
      const b = cold('  |');
      const bsubs = '   (^!)';
      const expected = '|';
      expectObservable(a[zipWith](b)).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });
  it('should work with empty and non-empty', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const a = cold('  |');
      const asubs = '   (^!)';
      const b = hot('   ---1--|');
      const bsubs = '   (^!)';
      const expected = '|';
      expectObservable(a[zipWith](b)).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });
  it('should work with non-empty and empty', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const a = hot('   ---1--|');
      const asubs = '   (^!)';
      const b = cold('  |');
      const bsubs = '   (^!)';
      const expected = '|';
      expectObservable(a[zipWith](b)).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });
  it('should work with never and non-empty', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const a = cold('  -');
      const asubs = '^------!';
      const b = hot('   ---1--|');
      const bsubs = '   ^-----!';
      const expected = '-';
      expectObservable(a[zipWith](b), '^------!').toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });
  it('should work with non-empty and never', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const a = hot('   ---1--|');
      const asubs = '   ^-----!';
      const b = cold('  -');
      const bsubs = '^------!';
      const expected = '-';
      expectObservable(a[zipWith](b), '^------!').toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });
  it('should work with empty and error', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const a = cold('  |');
      const asubs = '   (^!)';
      const b = hot('   ------#', undefined, 'too bad');
      const bsubs = '   (^!)';
      const expected = '|';
      expectObservable(a[zipWith](b)).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });
  it('should work with error and empty', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const a = hot('   ------#', undefined, 'too bad');
      const asubs = '   (^!)';
      const b = cold('  |');
      const bsubs = '   (^!)';
      const expected = '|';
      expectObservable(a[zipWith](b)).toBe(expected);
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
      expectObservable(a[zipWith](b)).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });
  it('should work with never and error', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const a = cold('  -------');
      const asubs = '   ^-----!';
      const b = hot('   ------#');
      const bsubs = '   ^-----!';
      const expected = '------#';
      expectObservable(a[zipWith](b)).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });
  it('should work with error and never', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const a = hot('   ------#');
      const asubs = '   ^-----!';
      const b = cold('  -------');
      const bsubs = '   ^-----!';
      const expected = '------#';
      expectObservable(a[zipWith](b)).toBe(expected);
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
      expectObservable(a[zipWith](b)).toBe(expected, null, 'too bad');
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
      expectObservable(a[zipWith](b)).toBe(expected, { x: [1, 2] }, 'too bad');
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });
  it('should work with two sources that eventually raise errors (swapped)', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('   -----z-----#-', { z: 2 }, 'too bad 2');
      const asubs = '   ^-------!';
      const b = hot('   --w-----#----', { w: 1 }, 'too bad');
      const bsubs = '   ^-------!';
      const expected = '-----x--#';
      expectObservable(a[zipWith](b)).toBe(expected, { x: [2, 1] }, 'too bad');
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });
  it('should work with error and some', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const a = cold('  #');
      const asubs = '   (^!)';
      const b = hot('   --1--2--3--');
      const bsubs = '   (^!)';
      const expected = '#';
      expectObservable(a[zipWith](b)).toBe(expected);
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
      const r = a[mergeMap]((x) => ColdObservable.from([x]))
        [zipWith](b)
        [mergeMap]((x) => ColdObservable.from([x]));
      expectObservable(r, unsub).toBe(expected, { x: ['1', '4'], y: ['2', '5'] });
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });
});
