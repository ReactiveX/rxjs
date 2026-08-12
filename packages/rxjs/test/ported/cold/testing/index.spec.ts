// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/testing/index-spec.ts
import { describe, expect, it } from 'vitest';
import { rxTest } from '@rxjs/test';
describe('index (cold)', () => {
  it('should export TestScheduler', async () => {
    // RxJS Next exports the framework-neutral rxTest function instead of reviving
    // the RxJS 7 rxjs/testing TestScheduler class.
    expect(rxTest).toBeTypeOf('function');
  });
});
