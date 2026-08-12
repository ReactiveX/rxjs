// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/observables/pairs-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { ColdObservable } from 'rxjs/cold-observable';
describe('pairs (cold)', () => {
  it('should create an observable emits key-value pair', async () => {
    await rxTest(({ expectObservable }) => {
      const e1 = ColdObservable.from(Object.entries({ a: 1, b: 2 }));
      const expected = '(ab|)';
      const values = {
        a: ['a', 1],
        b: ['b', 2],
      };
      expectObservable(e1).toBe(expected, values);
    });
  });
  it('should work with empty object', async () => {
    await rxTest(({ expectObservable }) => {
      const e1 = ColdObservable.from(Object.entries({}));
      const expected = '|';
      expectObservable(e1).toBe(expected);
    });
  });
});
