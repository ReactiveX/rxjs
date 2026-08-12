// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/every-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { ColdObservable } from 'rxjs/cold-observable';
import { every } from 'rxjs/every';
import { mergeMap } from 'rxjs/merge-map';
describe('every (cold)', () => {
  it('should return false if only one of elements does not match with predicate', async () => {
    function truePredicate(x) {
      return true;
    }
    function predicate(x) {
      return +x % 5 === 0;
    }
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const values = { a: 5, b: 10, c: 15, d: 18, e: 20 };
      const e1 = hot('  --a--b--c--d--e--|', values);
      const e1subs = '  ^----------!      ';
      const expected = '-----------(x|)   ';
      expectObservable(e1[every](predicate)).toBe(expected, { x: false });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should emit true if source is empty', async () => {
    function truePredicate(x) {
      return true;
    }
    function predicate(x) {
      return +x % 5 === 0;
    }
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -----|   ');
      const e1subs = '  ^----!   ';
      const expected = '-----(x|)';
      expectObservable(e1[every](predicate)).toBe(expected, { x: true });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should emit false if single source element does not match with predicate', async () => {
    function truePredicate(x) {
      return true;
    }
    function predicate(x) {
      return +x % 5 === 0;
    }
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--|');
      const e1subs = '  ^-!   ';
      const expected = '--(x|)';
      expectObservable(e1[every](predicate)).toBe(expected, { x: false });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should emit false if none of elements match with predicate', async () => {
    function truePredicate(x) {
      return true;
    }
    function predicate(x) {
      return +x % 5 === 0;
    }
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--d--e--|');
      const e1subs = '  ^-!               ';
      const expected = '--(x|)            ';
      expectObservable(e1[every](predicate)).toBe(expected, { x: false });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should return false if only some of elements matches with predicate', async () => {
    function truePredicate(x) {
      return true;
    }
    function predicate(x) {
      return +x % 5 === 0;
    }
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const values = { a: 5, b: 10, c: 15 };
      const e1 = hot('  --a--b--c--d--e--|', values);
      const e1subs = '  ^----------!      ';
      const expected = '-----------(x|)   ';
      expectObservable(e1[every](predicate)).toBe(expected, { x: false });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should allow unsubscribing early and explicitly', async () => {
    function truePredicate(x) {
      return true;
    }
    function predicate(x) {
      return +x % 5 === 0;
    }
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const values = { a: 5, b: 10, c: 15 };
      const e1 = hot('  --a--b--c--d--e--|', values);
      const e1subs = '  ^------!          ';
      const expected = '--------          ';
      const unsub = '   -------!          ';
      const result = e1[every](predicate);
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not break unsubscription chains when result observable is unsubscribed', async () => {
    function truePredicate(x) {
      return true;
    }
    function predicate(x) {
      return +x % 5 === 0;
    }
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const values = { a: 5, b: 10, c: 15 };
      const e1 = hot('  --a--b--c--d--e--|', values);
      const e1subs = '  ^------!          ';
      const expected = '--------          ';
      const unsub = '   -------!          ';
      const result = e1[mergeMap]((x) => ColdObservable.from([x]))
        [every](predicate)
        [mergeMap]((x) => ColdObservable.from([x]));
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should propagate error if predicate eventually throws', async () => {
    function truePredicate(x) {
      return true;
    }
    function predicate(x) {
      return +x % 5 === 0;
    }
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--d--e--|');
      const e1subs = '  ^-------!';
      const expected = '--------#';
      function faultyPredicate(x) {
        if (x === 'c') {
          throw 'error';
        } else {
          return true;
        }
      }
      expectObservable(e1[every](faultyPredicate)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should emit true if single source element matches with predicate', async () => {
    function truePredicate(x) {
      return true;
    }
    function predicate(x) {
      return +x % 5 === 0;
    }
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const values = { a: 5 };
      const e1 = hot('  --a--|   ', values);
      const e1subs = '  ^----!   ';
      const expected = '-----(x|)';
      expectObservable(e1[every](predicate)).toBe(expected, { x: true });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should emit true if scalar source matches with predicate', async () => {
    function truePredicate(x) {
      return true;
    }
    function predicate(x) {
      return +x % 5 === 0;
    }
    await rxTest(({ expectObservable }) => {
      const e1 = ColdObservable.from([5]);
      const expected = '(x|)';
      expectObservable(e1[every](predicate)).toBe(expected, { x: true });
    });
  });
  it('should emit false if scalar source does not match with predicate', async () => {
    function truePredicate(x) {
      return true;
    }
    function predicate(x) {
      return +x % 5 === 0;
    }
    await rxTest(({ expectObservable }) => {
      const e1 = ColdObservable.from([3]);
      const expected = '(x|)';
      expectObservable(e1[every](predicate)).toBe(expected, { x: false });
    });
  });
  it('should propagate error if predicate throws on scalar source', async () => {
    function truePredicate(x) {
      return true;
    }
    function predicate(x) {
      return +x % 5 === 0;
    }
    await rxTest(({ expectObservable }) => {
      const e1 = ColdObservable.from([3]);
      const expected = '#';
      function faultyPredicate(x) {
        throw 'error';
      }
      expectObservable(e1[every](faultyPredicate)).toBe(expected);
    });
  });
  it('should emit true if scalar array source matches with predicate', async () => {
    function truePredicate(x) {
      return true;
    }
    function predicate(x) {
      return +x % 5 === 0;
    }
    await rxTest(({ expectObservable }) => {
      const e1 = ColdObservable.from([5, 10, 15, 20]);
      const expected = '(x|)';
      expectObservable(e1[every](predicate)).toBe(expected, { x: true });
    });
  });
  it('should emit false if scalar array source does not match with predicate', async () => {
    function truePredicate(x) {
      return true;
    }
    function predicate(x) {
      return +x % 5 === 0;
    }
    await rxTest(({ expectObservable }) => {
      const e1 = ColdObservable.from([5, 9, 15, 20]);
      const expected = '(x|)';
      expectObservable(e1[every](predicate)).toBe(expected, { x: false });
    });
  });
  it('should propagate error if predicate eventually throws on scalar array source', async () => {
    function truePredicate(x) {
      return true;
    }
    function predicate(x) {
      return +x % 5 === 0;
    }
    await rxTest(({ expectObservable }) => {
      const e1 = ColdObservable.from([5, 10, 15, 20]);
      const expected = '#';
      function faultyPredicate(x) {
        if (x === 15) {
          throw 'error';
        }
        return true;
      }
      expectObservable(e1[every](faultyPredicate)).toBe(expected);
    });
  });
  it('should emit true if all source elements match with predicate', async () => {
    function truePredicate(x) {
      return true;
    }
    function predicate(x) {
      return +x % 5 === 0;
    }
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const values = { a: 5, b: 10, c: 15, d: 20, e: 25 };
      const e1 = hot('  --a--b--c--d--e--|   ', values);
      const e1subs = '  ^----------------!   ';
      const expected = '-----------------(x|)';
      expectObservable(e1[every](predicate)).toBe(expected, { x: true });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should raise error if source raises error', async () => {
    function truePredicate(x) {
      return true;
    }
    function predicate(x) {
      return +x % 5 === 0;
    }
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --#');
      const e1subs = '  ^-!';
      const expected = '--#';
      expectObservable(e1[every](truePredicate)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not complete if source never emits', async () => {
    function truePredicate(x) {
      return true;
    }
    function predicate(x) {
      return +x % 5 === 0;
    }
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' -');
      const e1subs = '^!';
      const expected = '-';
      expectObservable(e1[every](truePredicate), '^!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should emit true if source element matches with predicate after subscription', async () => {
    function truePredicate(x) {
      return true;
    }
    function predicate(x) {
      return +x % 5 === 0;
    }
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const values = { a: 5, b: 10, c: 15, d: 20, e: 25 };
      const e1 = hot('--z--^--a--b--c--d--e--|   ', values);
      const e1subs = '     ^-----------------!   ';
      const expected = '   ------------------(x|)';
      expectObservable(e1[every](predicate)).toBe(expected, { x: true });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should emit false if source element does not match with predicate after subscription', async () => {
    function truePredicate(x) {
      return true;
    }
    function predicate(x) {
      return +x % 5 === 0;
    }
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const values = { a: 5, b: 10, c: 15, d: 20 };
      const e1 = hot('--z--^--b--c--z--d--|', values);
      const e1subs = '     ^--------!      ';
      const expected = '   ---------(x|)   ';
      expectObservable(e1[every](predicate)).toBe(expected, { x: false });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should raise error if source raises error after subscription', async () => {
    function truePredicate(x) {
      return true;
    }
    function predicate(x) {
      return +x % 5 === 0;
    }
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--z--^--#');
      const e1subs = '     ^--!';
      const expected = '   ---#';
      expectObservable(e1[every](truePredicate)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should emit true if source does not emit after subscription', async () => {
    function truePredicate(x) {
      return true;
    }
    function predicate(x) {
      return +x % 5 === 0;
    }
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--z--^-----|   ');
      const e1subs = '     ^-----!   ';
      const expected = '   ------(x|)';
      expectObservable(e1[every](predicate)).toBe(expected, { x: true });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
});
