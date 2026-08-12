// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/observables/empty-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { EMPTY } from 'rxjs/empty';
describe('empty (platform)', () => {
  it('should create a cold observable with only complete', async () => {
    await rxTest(({ expectObservable }) => {
      const expected = '|';
      const e1 = EMPTY;
      expectObservable(e1).toBe(expected);
    });
  });
});
