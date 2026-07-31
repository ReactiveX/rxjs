// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/refCount-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { publish } from 'rxjs/publish';
import { refCount } from 'rxjs/ref-count';
describe('refCount (platform)', () => {
  it('should turn a multicasted Observable an automatically (dis)connecting hot one', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' --1-2---3-4--5-|');
      const e1Subs = '  ^--------------!';
      const expected = '--1-2---3-4--5-|';
      const result = e1[publish]()[refCount]();
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1Subs);
    });
  });
});
