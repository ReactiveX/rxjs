// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/findIndex-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { delay } from 'rxjs/delay';
import { findIndex } from 'rxjs/find-index';
import { mergeMap } from 'rxjs/merge-map';
describe('findIndex (platform)', () => {
  it('should return matching element from source emits single element', async () => {
    function truePredicate(x) {
      return true;
    }
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const values = { a: 3, b: 9, c: 15, d: 20 };
      const e1 = hot('  ---a--b--c--d---|', values);
      const e1subs = '  ^--------!       ';
      const expected = '---------(x|)    ';
      const predicate = function (x) {
        return x % 5 === 0;
      };
      expectObservable(e1[findIndex](predicate)).toBe(expected, { x: 2 });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not emit if source does not emit', async () => {
    function truePredicate(x) {
      return true;
    }
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -');
      const e1subs = '^!';
      const expected = '-';
      expectObservable(e1[findIndex](truePredicate), '^!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should return negative index if source is empty to match predicate', async () => {
    function truePredicate(x) {
      return true;
    }
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' |   ');
      const e1subs = '  (^!)';
      const expected = '(x|)';
      const result = e1[findIndex](truePredicate);
      expectObservable(result).toBe(expected, { x: -1 });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should return index of element from source emits single element', async () => {
    function truePredicate(x) {
      return true;
    }
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--|', { a: 1 });
      const e1subs = '  ^-!   ';
      const expected = '--(x|)';
      const predicate = function (value) {
        return value === 1;
      };
      expectObservable(e1[findIndex](predicate)).toBe(expected, { x: 0 });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should return index of matching element from source emits multiple elements', async () => {
    function truePredicate(x) {
      return true;
    }
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b---c-|', { b: 7 });
      const e1subs = '  ^----!      ';
      const expected = '-----(x|)   ';
      const predicate = function (value) {
        return value === 7;
      };
      expectObservable(e1[findIndex](predicate)).toBe(expected, { x: 1 });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should work with a bound predicate', async () => {
    function truePredicate(x) {
      return true;
    }
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const sourceValues = { b: 7 };
      const e1 = hot('  --a--b---c-|', sourceValues);
      const e1subs = '  ^----!      ';
      const expected = '-----(x|)   ';
      const predicate = function (value) {
        return value === this.b;
      };
      const result = e1[findIndex](predicate.bind(sourceValues));
      expectObservable(result).toBe(expected, { x: 1 });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should return negative index if element does not match with predicate', async () => {
    function truePredicate(x) {
      return true;
    }
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--|   ');
      const e1subs = '  ^----------!   ';
      const expected = '-----------(x|)';
      const predicate = function (value) {
        return value === 'z';
      };
      expectObservable(e1[findIndex](predicate)).toBe(expected, { x: -1 });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should allow unsubscribing early and explicitly', async () => {
    function truePredicate(x) {
      return true;
    }
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--|');
      const e1subs = '  ^-----!     ';
      const expected = '-------     ';
      const unsub = '   ------!     ';
      const result = e1[findIndex]((value) => value === 'z');
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not break unsubscription chains when result is unsubscribed explicitly', async () => {
    function truePredicate(x) {
      return true;
    }
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--|');
      const e1subs = '  ^-----!     ';
      const expected = '-------     ';
      const unsub = '   ------!     ';
      const result = e1[mergeMap]((x) => Observable.from([x]))
        [findIndex]((value) => value === 'z')
        [mergeMap]((x) => Observable.from([x]));
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should unsubscribe when the predicate is matched', async () => {
    function truePredicate(x) {
      return true;
    }
    await rxTest(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b---c-|');
      const e1subs = '  ^----!      ';
      const t = time('    --|       ');
      //                     --|
      const expected = '-------(x|) ';
      const result = e1[findIndex]((value) => value === 'b')[delay](t);
      expectObservable(result).toBe(expected, { x: 1 });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should raise if source raise error while element does not match with predicate', async () => {
    function truePredicate(x) {
      return true;
    }
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--#');
      const e1subs = '  ^-------!';
      const expected = '--------#';
      const predicate = function (value) {
        return value === 'z';
      };
      expectObservable(e1[findIndex](predicate)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should raise error if predicate throws error', async () => {
    function truePredicate(x) {
      return true;
    }
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--|');
      const e1subs = '  ^-!         ';
      const expected = '--#         ';
      const predicate = function (value) {
        throw 'error';
      };
      expectObservable(e1[findIndex](predicate)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
});
