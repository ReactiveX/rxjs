// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/toArray-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { buffer } from 'rxjs/buffer';
import { ColdObservable } from 'rxjs/cold-observable';
import { mergeMap } from 'rxjs/merge-map';
describe('toArray (cold)', () => {
  it('should reduce the values of an observable into an array', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ---a--b--|   ');
      const e1subs = '  ^--------!   ';
      const expected = '---------(w|)';
      expectObservable(e1[buffer]({ emitEmpty: true, emitRemainingOnError: false })).toBe(expected, { w: ['a', 'b'] });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should be never when source is never', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' -');
      const e1subs = '^!';
      const expected = '-';
      expectObservable(e1[buffer]({ emitEmpty: true, emitRemainingOnError: false }), '^!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should be empty when source is empty', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' |   ');
      const e1subs = '  (^!)';
      const expected = '(w|)';
      expectObservable(e1[buffer]({ emitEmpty: true, emitRemainingOnError: false })).toBe(expected, { w: [] });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it("should be never when source doesn't complete", async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--x--^--y--');
      const e1subs = '^-----!';
      const expected = '   ------';
      expectObservable(e1[buffer]({ emitEmpty: true, emitRemainingOnError: false }), '^-----!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should reduce observable without values into an array of length zero', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-x-^---|   ');
      const e1subs = '   ^---!   ';
      const expected = ' ----(w|)';
      expectObservable(e1[buffer]({ emitEmpty: true, emitRemainingOnError: false })).toBe(expected, { w: [] });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should reduce the a single value of an observable into an array', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-x-^--y--|  ');
      const e1subs = '   ^-----!  ';
      const expected = ' ------(w|)';
      expectObservable(e1[buffer]({ emitEmpty: true, emitRemainingOnError: false })).toBe(expected, { w: ['y'] });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should allow multiple subscriptions', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-x-^--y--|   ');
      const e1subs = '   ^-----!   ';
      const expected = ' ------(w|)';
      const result = e1[buffer]({ emitEmpty: true, emitRemainingOnError: false });
      expectObservable(result).toBe(expected, { w: ['y'] });
      expectObservable(result).toBe(expected, { w: ['y'] });
      expectSubscriptions(e1.subscriptions).toBe([e1subs]);
    });
  });
  it('should allow unsubscribing explicitly and early', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b----c-----d----e---|');
      const e1subs = '  ^-------!                 ';
      const expected = '---------                 ';
      const unsub = '   --------!                 ';
      expectObservable(e1[buffer]({ emitEmpty: true, emitRemainingOnError: false }), unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not break unsubscription chains when result is unsubscribed explicitly', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b----c-----d----e---|');
      const e1subs = '  ^-------!                 ';
      const expected = '---------                 ';
      const unsub = '   --------!                 ';
      const result = e1[mergeMap]((x) => ColdObservable.from([x]))
        [buffer]({ emitEmpty: true, emitRemainingOnError: false })
        [mergeMap]((x) => ColdObservable.from([x]));
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should work with error', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-x-^--y--z--#', { x: 1, y: 2, z: 3 }, 'too bad');
      const e1subs = '   ^--------!';
      const expected = ' ---------#';
      expectObservable(e1[buffer]({ emitEmpty: true, emitRemainingOnError: false })).toBe(expected, null, 'too bad');
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should work with throw', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' #   ');
      const e1subs = '  (^!)';
      const expected = '#   ';
      expectObservable(e1[buffer]({ emitEmpty: true, emitRemainingOnError: false })).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
});
