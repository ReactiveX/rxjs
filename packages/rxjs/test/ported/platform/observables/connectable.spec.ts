// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/observables/connectable-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { connectable } from 'rxjs/connectable';
describe('connectable (platform)', () => {
  it('should mirror a simple source Observable', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const source = observable('--1-2---3-4--5-|');
      const sourceSubs = ' ^--------------!';
      const expected = '   --1-2---3-4--5-|';
      const obs = connectable(source);
      expectObservable(obs).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      obs.connect();
    });
  });
  it('should do nothing if connect is not called, despite subscriptions', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const source = observable('--1-2---3-4--5-|');
      const result = connectable(source);
      // No connection is made. Bound the silent observer at the full original
      // diagram horizon and retain the empty source-subscription claim.
      expectObservable(result, '^!').toBe('-');
      expectSubscriptions(source.subscriptions).toBe([]);
    });
  });
});
