// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/mapTo-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { ColdObservable } from 'rxjs/cold-observable';
import { mergeMap } from 'rxjs/merge-map';
describe('mapTo (cold)', () => {
  it('should map multiple values', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' --1--2--3--|');
      const e1subs = '  ^----------!';
      const expected = '--a--a--a--|';
      expectObservable(e1[mergeMap](() => ColdObservable.from(['a']))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should map one value', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' --7--|');
      const e1subs = '  ^----!';
      const expected = '--y--|';
      expectObservable(e1[mergeMap](() => ColdObservable.from(['y']))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should allow unsubscribing explicitly and early', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' --1--2--3--|');
      const e1subs = '  ^-----!     ';
      const expected = '--x--x-     ';
      const unsub = '   ------!     ';
      expectObservable(
        e1[mergeMap](() => ColdObservable.from(['x'])),
        unsub
      ).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should propagate errors from observable that emits only errors', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' --#', undefined, 'too bad');
      const e1subs = '  ^-!';
      const expected = '--#';
      expectObservable(e1[mergeMap](() => ColdObservable.from([1]))).toBe(expected, null, 'too bad');
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should propagate errors from observable that emit values, then errors', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' --1--2--#', undefined, 'too bad');
      const e1subs = '  ^-------!';
      const expected = '--x--x--#';
      expectObservable(e1[mergeMap](() => ColdObservable.from(['x']))).toBe(expected, undefined, 'too bad');
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not map an empty observable', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' |   ');
      const e1subs = '  (^!)';
      const expected = '|   ';
      expectObservable(e1[mergeMap](() => ColdObservable.from([-1]))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should map twice', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-0----1-^-2---3--4-5--6--7-8-|');
      const e1subs = '        ^--------------------!';
      const expected = '      --h---h--h-h--h--h-h-|';
      // prettier-ignore
      const result = e1[mergeMap](() => ColdObservable.from([-1]))[mergeMap](() => ColdObservable.from(['h']));
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not break unsubscription chain when unsubscribed explicitly', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' --1--2--3--|');
      const e1subs = '  ^-----!     ';
      const expected = '--x--x-     ';
      const unsub = '   ------!     ';
      const result = e1[mergeMap]((x) => ColdObservable.from([x]))
        [mergeMap](() => ColdObservable.from(['x']))
        [mergeMap]((x) => ColdObservable.from([x]));
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
});
