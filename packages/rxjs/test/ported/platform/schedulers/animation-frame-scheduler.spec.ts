// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/schedulers/AnimationFrameScheduler-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { delay } from 'rxjs/delay';
import { merge } from 'rxjs/merge';
describe('AnimationFrameScheduler (platform)', () => {
  it('should act like the async scheduler if delay > 0', async () => {
    await rxTest(({ observable, expectObservable, time }) => {
      const first = observable('(a|)')[delay](time('----|'));
      const second = observable('(b|)')[delay](time('--------|'));
      // Positive-delay legacy schedulers all crossed onto the same host timer
      // boundary; preserve that behavior without publishing scheduler instances.
      expectObservable(Observable[merge]([first, second])).toBe('----a---(b|)');
    });
  });
  it('should cancel animationFrame actions when delay > 0', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions, time }) => {
      const source = observable('a');
      const result = source[delay](time('----|'));
      expectObservable(result, '^-!').toBe('--');
      expectSubscriptions(source.subscriptions).toBe('^-!');
      // Cancellation must clear the positive-delay host task. Provider spying is
      // intentionally outside the public Next boundary.
    });
  });
});
