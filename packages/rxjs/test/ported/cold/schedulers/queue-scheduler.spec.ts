// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/schedulers/QueueScheduler-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { ColdObservable } from 'rxjs/cold-observable';
import { delay } from 'rxjs/delay';
import { merge } from 'rxjs/merge';
describe('QueueScheduler (cold)', () => {
  it('should act like the async scheduler if delay > 0', async () => {
    await rxTest(({ cold, expectObservable, time }) => {
      const first = cold('(a|)')[delay](time('----|'));
      const second = cold('(b|)')[delay](time('--------|'));
      // Positive-delay legacy schedulers all crossed onto the same host timer
      // boundary; preserve that behavior without publishing scheduler instances.
      expectObservable(ColdObservable[merge]([first, second])).toBe('----a---(b|)');
    });
  });
});
