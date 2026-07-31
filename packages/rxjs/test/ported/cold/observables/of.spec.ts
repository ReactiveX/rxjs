// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/observables/of-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { ColdObservable } from 'rxjs/cold-observable';
import { delay } from 'rxjs/delay';
import { mergeMap } from 'rxjs/merge-map';
describe('of (cold)', () => {
  it('should create a cold observable that emits 1, 2, 3', async () => {
    await rxTest(({ expectObservable, time }) => {
      const delayValue = time('--|');
      const e1 = ColdObservable.from([1, 2, 3])[mergeMap]((x, i) => ColdObservable.from([x])[delay](i === 0 ? 0 : delayValue), {
        concurrent: 1,
      });
      const expected = 'x-y-(z|)';
      expectObservable(e1).toBe(expected, { x: 1, y: 2, z: 3 });
    });
  });
  it('should handle an Observable as the only value', async () => {
    await rxTest(({ expectObservable }) => {
      const source = ColdObservable.from([ColdObservable.from(['a', 'b', 'c'])]);
      const result = source[mergeMap]((value) => value, { concurrent: 1 });
      expectObservable(result).toBe('(abc|)');
    });
  });
  it('should handle many Observable as the given values', async () => {
    await rxTest(({ expectObservable }) => {
      const source = ColdObservable.from([ColdObservable.from(['a', 'b', 'c']), ColdObservable.from(['d', 'e', 'f'])]);
      const result = source[mergeMap]((value) => value, { concurrent: 1 });
      expectObservable(result).toBe('(abcdef|)');
    });
  });
});
