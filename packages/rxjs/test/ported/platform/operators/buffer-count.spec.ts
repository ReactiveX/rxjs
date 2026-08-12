// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/bufferCount-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { buffer } from 'rxjs/buffer';
import { mergeMap } from 'rxjs/merge-map';
describe('bufferCount (platform)', () => {
  it('should emit buffers at intervals', async () => {
    await rxTest(({ hot, expectObservable }) => {
      const values = {
        v: ['a', 'b', 'c'],
        w: ['c', 'd', 'e'],
        x: ['e', 'f', 'g'],
        y: ['g', 'h', 'i'],
        z: ['i'],
      };
      const e1 = hot('  --a--b--c--d--e--f--g--h--i--|');
      const expected = '--------v-----w-----x-----y--(z|)';
      expectObservable(e1[buffer]({ maxSize: 3, startEvery: 2, emitRemainingOnError: false })).toBe(expected, values);
    });
  });
  it('should emit buffers at buffersize of intervals if not specified', async () => {
    await rxTest(({ hot, expectObservable }) => {
      const values = {
        x: ['a', 'b'],
        y: ['c', 'd'],
        z: ['e', 'f'],
      };
      const e1 = hot('  --a--b--c--d--e--f--|');
      const expected = '-----x-----y-----z--|';
      expectObservable(e1[buffer]({ maxSize: 2, startEvery: 2, emitRemainingOnError: false })).toBe(expected, values);
    });
  });
  it('should emit partial buffers if source completes before reaching specified buffer count', async () => {
    await rxTest(({ hot, expectObservable }) => {
      const e1 = hot('  --a--b--c--d--|');
      const expected = '--------------(x|)';
      expectObservable(e1[buffer]({ maxSize: 5, startEvery: 5, emitRemainingOnError: false })).toBe(expected, { x: ['a', 'b', 'c', 'd'] });
    });
  });
  it('should emit full buffer then last partial buffer if source completes', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a^-b--c--d--e--|');
      const e1subs = '     ^-------------!';
      const expected = '   --------y-----(z|)';
      expectObservable(e1[buffer]({ maxSize: 3, startEvery: 3, emitRemainingOnError: false })).toBe(expected, {
        y: ['b', 'c', 'd'],
        z: ['e'],
      });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should emit buffers at intervals, but stop when result is unsubscribed early', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const values = {
        v: ['a', 'b', 'c'],
        w: ['c', 'd', 'e'],
      };
      const e1 = hot('  --a--b--c--d--e--f--g--h--i--|');
      const unsub = '   ------------------!           ';
      const subs = '    ^-----------------!           ';
      const expected = '--------v-----w----           ';
      expectObservable(e1[buffer]({ maxSize: 3, startEvery: 2, emitRemainingOnError: false }), unsub).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });
  it('should not break unsubscription chains when result is unsubscribed explicitly', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const values = {
        v: ['a', 'b', 'c'],
        w: ['c', 'd', 'e'],
      };
      const e1 = hot('  --a--b--c--d--e--f--g--h--i--|');
      const subs = '    ^-----------------!           ';
      const expected = '--------v-----w----           ';
      const unsub = '   ------------------!           ';
      const result = e1[mergeMap]((x) => Observable.from([x]))
        [buffer]({ maxSize: 3, startEvery: 2, emitRemainingOnError: false })
        [mergeMap]((x) => Observable.from([x]));
      expectObservable(result, unsub).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });
  it('should raise error if source raise error before reaching specified buffer count', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--d--#');
      const e1subs = '  ^-------------!';
      const expected = '--------------#';
      expectObservable(e1[buffer]({ maxSize: 5, startEvery: 5, emitRemainingOnError: false })).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should emit buffers with specified skip count when skip count is less than window count', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const values = {
        v: ['a', 'b', 'c'],
        w: ['b', 'c', 'd'],
        x: ['c', 'd', 'e'],
        y: ['d', 'e'],
        z: ['e'],
      };
      const e1 = hot('  --a--b--c--d--e--|');
      const e1subs = '  ^----------------!';
      const expected = '--------v--w--x--(yz|)';
      expectObservable(e1[buffer]({ maxSize: 3, startEvery: 1, emitRemainingOnError: false })).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should emit buffers with specified skip count when skip count is more than window count', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--b--c--d--e--|');
      const e1subs = '  ^----------------!';
      const expected = '-----y--------z--|';
      const values = {
        y: ['a', 'b'],
        z: ['d', 'e'],
      };
      expectObservable(e1[buffer]({ maxSize: 2, startEvery: 3, emitRemainingOnError: false })).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
});
