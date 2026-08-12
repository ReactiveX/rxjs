// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/zip-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { map } from 'rxjs/map';
import { zipWith } from 'rxjs/zip-with';
describe('zip (platform)', () => {
  it('should work with non-empty observable and non-empty iterable selector that throws', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('---^--1--2--3--|');
      const asubs = '   ^-----!';
      const expected = '---x--#';
      const b = [4, 5, 6];
      const selector = function (x, y) {
        if (y === 5) {
          throw new Error('too bad');
        } else {
          return x + y;
        }
      };
      expectObservable(a[zipWith](b)[map]((values) => selector(...values))).toBe(expected, { x: '14' }, new Error('too bad'));
      expectSubscriptions(a.subscriptions).toBe(asubs);
    });
  });
});
