// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/observables/throwError-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { ColdObservable } from 'rxjs/cold-observable';
describe('throwError (cold)', () => {
  it('should create a cold observable that just emits an error', async () => {
    await rxTest(({ expectObservable }) => {
      const expected = '#';
      const e1 = new ColdObservable((subscriber) => {
        subscriber.error('error');
      });
      expectObservable(e1).toBe(expected);
    });
  });
  it('should accept scheduler', async () => {
    await rxTest(({ expectObservable }) => {
      const e = new ColdObservable((subscriber) => {
        subscriber.error('error');
      });
      expectObservable(e).toBe('#');
    });
  });
});
