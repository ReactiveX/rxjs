// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/pluck-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { map } from 'rxjs/map';
import { mergeMap } from 'rxjs/merge-map';
import { pluck } from 'rxjs/pluck';
describe('pluck (platform)', () => {
  it('should dematerialize an Observable', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const inputs = {
        a: '{v:1}',
        b: '{v:2}',
        c: '{v:3}',
      };
      const e1 = observable(' --a--b--c--|', inputs);
      const e1subs = '  ^----------!';
      const expected = '--x--y--z--|';
      const result = e1[map]((x) => ({ v: x.charAt(3) }))[pluck]('v');
      expectObservable(result).toBe(expected, { x: '1', y: '2', z: '3' });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should work for one array', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const inputs = { x: ['abc'] };
      const e1 = observable(' --x--|', inputs);
      const e1subs = '  ^----!';
      const expected = '--y--|';
      const result = e1[pluck](0);
      expectObservable(result).toBe(expected, { y: 'abc' });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should work for one object', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const inputs = { x: { prop: 42 } };
      const e1 = observable(' --x--|', inputs);
      const e1subs = '  ^----!';
      const expected = '--y--|';
      const result = e1[pluck]('prop');
      expectObservable(result).toBe(expected, { y: 42 });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should work for multiple objects', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const inputs = {
        a: { prop: '1' },
        b: { prop: '2' },
        c: { prop: '3' },
        d: { prop: '4' },
        e: { prop: '5' },
      };
      const e1 = observable(' --a-b--c-d---e-|', inputs);
      const e1subs = '  ^--------------!';
      const expected = '--1-2--3-4---5-|';
      const result = e1[pluck]('prop');
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should work with deep nested properties', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const inputs = {
        a: { a: { b: { c: '1' } } },
        b: { a: { b: { c: '2' } } },
        c: { a: { b: { c: '3' } } },
        d: { a: { b: { c: '4' } } },
        e: { a: { b: { c: '5' } } },
      };
      const e1 = observable(' --a-b--c-d---e-|', inputs);
      const e1subs = '  ^--------------!';
      const expected = '--1-2--3-4---5-|';
      const result = e1[pluck]('a', 'b', 'c');
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should work with edge cases of deep nested properties', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const inputs = {
        a: { i: { j: { k: 1 } } },
        b: { i: { j: 2 } },
        c: { i: { k: { k: 3 } } },
        d: {},
        e: { i: { j: { k: 5 } } },
      };
      const e1 = observable(' --a-b--c-d---e-|', inputs);
      const e1subs = '  ^--------------!';
      const expected = '--v-w--x-y---z-|';
      const values = { v: 1, w: undefined, x: undefined, y: undefined, z: 5 };
      const result = e1[pluck]('i', 'j', 'k');
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should propagate errors from observable that emits only errors', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' #   ');
      const e1subs = '  (^!)';
      const expected = '#   ';
      const result = e1[pluck]('whatever');
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should propagate errors from observable that emit values', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const inputs = { a: { prop: '1' }, b: { prop: '2' } };
      const e1 = observable(' --a--b--#', inputs, 'too bad');
      const e1subs = '  ^-------!';
      const expected = '--1--2--#';
      const result = e1[pluck]('prop');
      expectObservable(result).toBe(expected, undefined, 'too bad');
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not pluck an empty observable', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' |   ');
      const e1subs = '  (^!)';
      const expected = '|   ';
      const result = e1[pluck]('whatever');
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should allow unsubscribing explicitly and early', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' --a--b--c--|', { a: { prop: '1' }, b: { prop: '2' } });
      const e1subs = '  ^-----!     ';
      const expected = '--1--2-     ';
      const unsub = '   ------!     ';
      const result = e1[pluck]('prop');
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should pluck twice', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const inputs = {
        a: { a: { b: { c: '1' } } },
        b: { a: { b: { c: '2' } } },
        c: { a: { b: { c: '3' } } },
        d: { a: { b: { c: '4' } } },
        e: { a: { b: { c: '5' } } },
      };
      const e1 = observable(' --a-b--c-d---e-|', inputs);
      const e1subs = '  ^--------------!';
      const expected = '--1-2--3-4---5-|';
      const result = e1[pluck]('a', 'b')[pluck]('c');
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not break unsubscription chain when unsubscribed explicitly', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const inputs = { a: { prop: '1' }, b: { prop: '2' } };
      const e1 = observable(' --a--b--c--|', inputs);
      const e1subs = '  ^-----!     ';
      const expected = '--1--2-     ';
      const unsub = '   ------!     ';
      const result = e1[mergeMap]((x) => Observable.from([x]))
        [pluck]('prop')
        [mergeMap]((x) => Observable.from([x]));
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should support symbols', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const sym = Symbol('sym');
      const inputs = { x: { [sym]: 'abc' } };
      const e1 = observable(' --x--|', inputs);
      const e1subs = '  ^----!';
      const expected = '--y--|';
      const result = e1[pluck](sym);
      expectObservable(result).toBe(expected, { y: 'abc' });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not break on null values', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const inputs = { x: null };
      const e1 = observable(' --x--|', inputs);
      const e1subs = '  ^----!';
      const expected = '--y--|';
      const result = e1[pluck]('prop');
      expectObservable(result).toBe(expected, { y: undefined });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
});
