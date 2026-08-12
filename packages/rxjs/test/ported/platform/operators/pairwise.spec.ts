// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/pairwise-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { pairwise } from 'rxjs/pairwise';
describe('pairwise (platform)', () => {
  it('should group consecutive emissions as arrays of two', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b-c----d--e---|');
      const e1subs = '  ^------------------!';
      const expected = '-----u-v----w--x---|';
      const values = {
        u: ['a', 'b'],
        v: ['b', 'c'],
        w: ['c', 'd'],
        x: ['d', 'e'],
      };
      expectObservable(e1[pairwise]()).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should pairwise things', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^--b--c--d--e--f--g--|');
      const e1subs = '     ^--------------------!';
      const expected = '   ------v--w--x--y--z--|';
      const values = {
        v: ['b', 'c'],
        w: ['c', 'd'],
        x: ['d', 'e'],
        y: ['e', 'f'],
        z: ['f', 'g'],
      };
      expectObservable(e1[pairwise]()).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not emit on single-element streams', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^--b----|');
      const e1subs = '     ^-------!';
      const expected = '   --------|';
      expectObservable(e1[pairwise]()).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle mid-stream throw', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^--b--c--d--e--#');
      const e1subs = '     ^--------------!';
      const expected = '   ------v--w--x--#';
      const values = {
        v: ['b', 'c'],
        w: ['c', 'd'],
        x: ['d', 'e'],
      };
      expectObservable(e1[pairwise]()).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle empty', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' |   ');
      const e1subs = '  (^!)';
      const expected = '|   ';
      expectObservable(e1[pairwise]()).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle never', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' -');
      const e1subs = '^!';
      const expected = '-';
      expectObservable(e1[pairwise](), '^!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle throw', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' #   ');
      const e1subs = '  (^!)';
      const expected = '#   ';
      expectObservable(e1[pairwise]()).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
});
