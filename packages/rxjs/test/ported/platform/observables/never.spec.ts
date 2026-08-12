// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/observables/never-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { NEVER } from 'rxjs/never';
describe('never (platform)', () => {
  it('should create a cold observable that never emits', async () => {
    await rxTest(({ expectObservable }) => {
      const expected = '-';
      const e1 = NEVER;
      expectObservable(e1, '^!').toBe(expected);
    });
  });
});
