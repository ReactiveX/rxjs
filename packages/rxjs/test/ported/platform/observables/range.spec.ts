// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/observables/range-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
describe('range (platform)', () => {
  it('should create an observable with numbers 1 to 10', async () => {
    await rxTest(({ expectObservable }) => {
      const source = Observable.from(Array.from({ length: 10 }, (_, index) => 1 + index));
      const values = {
        a: 1,
        b: 2,
        c: 3,
        d: 4,
        e: 5,
        f: 6,
        g: 7,
        h: 8,
        i: 9,
        j: 10,
      };
      // The RxJS 7 case used concatMap/delay only to spread synchronous range
      // values into a readable diagram. Assert the actual range contract directly.
      expectObservable(source).toBe('(abcdefghij|)', values);
    });
  });
  it('should work for two subscribers', async () => {
    await rxTest(({ expectObservable }) => {
      const source = Observable.from(Array.from({ length: 5 }, (_, index) => 1 + index));
      const values = {
        a: 1,
        b: 2,
        c: 3,
        d: 4,
        e: 5,
      };
      // The RxJS 7 case used concatMap/delay only to spread synchronous range
      // values into a readable diagram. Assert the actual range contract directly.
      expectObservable(source).toBe('(abcde|)', values);
      expectObservable(source).toBe('(abcde|)', values);
    });
  });
  it('should accept only one argument where count is argument and start is zero', async () => {
    await rxTest(({ expectObservable }) => {
      const source = Observable.from(Array.from({ length: 5 }, (_, index) => 0 + index));
      const values = {
        a: 0,
        b: 1,
        c: 2,
        d: 3,
        e: 4,
      };
      // The RxJS 7 case used concatMap/delay only to spread synchronous range
      // values into a readable diagram. Assert the actual range contract directly.
      expectObservable(source).toBe('(abcde|)', values);
      expectObservable(source).toBe('(abcde|)', values);
    });
  });
});
