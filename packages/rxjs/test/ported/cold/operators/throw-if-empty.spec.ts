// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/throwIfEmpty-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { EmptyError } from 'rxjs/empty-error';
import { throwIfEmpty } from 'rxjs/throw-if-empty';
describe('throwIfEmpty (cold)', () => {
  it('should error when empty', async () => {
    await rxTest(({ cold, expectObservable }) => {
      const source = cold('----|');
      const expected = '   ----#';
      const result = source[throwIfEmpty](() => new Error('test'));
      expectObservable(result).toBe(expected, undefined, new Error('test'));
    });
  });
  it('should pass values through', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('----a---b---c---|');
      const sub1 = '       ^---------------!';
      const expected = '   ----a---b---c---|';
      const result = source[throwIfEmpty](() => new Error('test'));
      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe([sub1]);
    });
  });
  it('should never when never', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('-');
      const sub1 = '^!';
      const expected = '   -';
      const result = source[throwIfEmpty](() => new Error('test'));
      expectObservable(result, '^!').toBe(expected);
      expectSubscriptions(source.subscriptions).toBe([sub1]);
    });
  });
  it('should error when empty', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('----|');
      const sub1 = '       ^---!';
      const expected = '   ----#';
      const result = source[throwIfEmpty](() => new Error('test'));
      expectObservable(result).toBe(expected, undefined, new Error('test'));
      expectSubscriptions(source.subscriptions).toBe([sub1]);
    });
  });
  it('should pass values through', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('----a---b---c---|');
      const sub1 = '       ^---------------!';
      const expected = '   ----a---b---c---|';
      const result = source[throwIfEmpty]();
      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe([sub1]);
    });
  });
  it('should never when never', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('-');
      const sub1 = '^!';
      const expected = '   -';
      const result = source[throwIfEmpty]();
      expectObservable(result, '^!').toBe(expected);
      expectSubscriptions(source.subscriptions).toBe([sub1]);
    });
  });
  it('should error when empty', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('----|');
      const sub1 = '       ^---!';
      const expected = '   ----#';
      const result = source[throwIfEmpty]();
      expectObservable(result).toBe(expected, undefined, new EmptyError());
      expectSubscriptions(source.subscriptions).toBe([sub1]);
    });
  });
});
