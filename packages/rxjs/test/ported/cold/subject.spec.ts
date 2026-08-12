// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/Subject-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
describe('Subject (cold)', () => {
  it('should handle subject never emits', async () => {
    await rxTest(({ hot, expectObservable }) => {
      const observable = hot('-');
      expectObservable(observable, '^!').toBe('-');
    });
  });
  it('should handle subject completes without emits', async () => {
    await rxTest(({ hot, expectObservable }) => {
      const observable = hot('--^--|');
      const expected = '        ---|';
      expectObservable(observable).toBe(expected);
    });
  });
  it('should handle subject throws', async () => {
    await rxTest(({ hot, expectObservable }) => {
      const observable = hot('--^--#');
      const expected = '        ---#';
      expectObservable(observable).toBe(expected);
    });
  });
  it('should handle subject emits', async () => {
    await rxTest(({ hot, expectObservable }) => {
      const observable = hot('--^--x--|');
      const expected = '        ---x--|';
      expectObservable(observable).toBe(expected);
    });
  });
});
