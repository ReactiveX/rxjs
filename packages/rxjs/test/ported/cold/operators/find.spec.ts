// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/find-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { ColdObservable } from 'rxjs/cold-observable';
import { delay } from 'rxjs/delay';
import { find } from 'rxjs/find';
import { mergeMap } from 'rxjs/merge-map';
describe('find (cold)', () => {
  it('should return matching element from source emits single element', async () => {
    function truePredicate(x) {
      return true;
    }
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const values = { a: 3, b: 9, c: 15, d: 20 };
      const e1 = hot('  ---a--b--c--d---|', values);
      const e1subs = '  ^--------!       ';
      const expected = '---------(c|)    ';
      const predicate = function (x) {
        return x % 5 === 0;
      };
      expectObservable(e1[find](predicate)).toBe(expected, values);
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
      expectObservable(e1[find](truePredicate), '^!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should return undefined if source is empty to match predicate', async () => {
    function truePredicate(x) {
      return true;
    }
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' |   ');
      const e1subs = '  (^!)';
      const expected = '(x|)';
      const result = e1[find](truePredicate);
      expectObservable(result).toBe(expected, { x: undefined });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should return matching element from source emits single element', async () => {
    function truePredicate(x) {
      return true;
    }
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--|');
      const e1subs = '  ^-!   ';
      const expected = '--(a|)';
      const predicate = function (value) {
        return value === 'a';
      };
      expectObservable(e1[find](predicate)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should return matching element from source emits multiple elements', async () => {
    function truePredicate(x) {
      return true;
    }
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b---c-|');
      const e1subs = '  ^----!      ';
      const expected = '-----(b|)   ';
      const predicate = function (value) {
        return value === 'b';
      };
      expectObservable(e1[find](predicate)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should work with a bound predicate', async () => {
    function truePredicate(x) {
      return true;
    }
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b---c-|');
      const e1subs = '  ^----!      ';
      const expected = '-----(b|)   ';
      const finder = {
        target: 'b',
      };
      const predicate = function (value) {
        return value === this.target;
      };
      expectObservable(e1[find](predicate.bind(finder))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should return undefined if element does not match with predicate', async () => {
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
      expectObservable(e1[find](predicate)).toBe(expected, { x: undefined });
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
      const result = e1[find]((value) => value === 'z');
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
      const result = e1[mergeMap]((x) => ColdObservable.from([x]))
        [find]((value) => value === 'z')
        [mergeMap]((x) => ColdObservable.from([x]));
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
      const expected = '-------(b|) ';
      const result = e1[find]((value) => value === 'b')[delay](t);
      expectObservable(result).toBe(expected);
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
      expectObservable(e1[find](predicate)).toBe(expected);
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
      expectObservable(e1[find](predicate)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
});
