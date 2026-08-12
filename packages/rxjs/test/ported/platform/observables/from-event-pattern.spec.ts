// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/observables/fromEventPattern-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { fromEventPattern } from 'rxjs/from-event-pattern';
describe('fromEventPattern (platform)', () => {
  it('should create an observable from the handler API', async () => {
    await rxTest(({ expectObservable, schedule }) => {
      const addHandler = (handler) => {
        schedule(() => handler('ev'), 5);
        schedule(() => handler('ev'), 7);
      };
      const result = fromEventPattern(addHandler);
      // Reproduce the original handler API and virtual emission times directly.
      // The finite observation boundary retains the deliberately open result.
      expectObservable(result, '^----------!').toBe('-----x-x---', { x: 'ev' });
    });
  });
});
