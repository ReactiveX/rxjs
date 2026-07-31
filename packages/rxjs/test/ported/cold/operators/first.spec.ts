// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/first-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { ColdObservable } from 'rxjs/cold-observable';
import { delay } from 'rxjs/delay';
import { EmptyError } from 'rxjs/empty-error';
import { first } from 'rxjs/first';
import { mergeMap } from 'rxjs/merge-map';
describe('first (cold)', () => {
  it('should take the first value of an observable with many values', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -----a--b--c---d---|');
      const e1subs = '  ^----!              ';
      const expected = '-----(a|)           ';
      expectObservable(e1[first]()).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should take the first value of an observable with one value', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ---(a|)');
      const e1subs = '  ^--!   ';
      const expected = '---(a|)';
      expectObservable(e1[first]()).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should allow undefined as a default value', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -----a--a---a-|   ');
      const e1subs = '  ^-------------!   ';
      const expected = '--------------(U|)';
      expectObservable(e1[first]((value) => value === 'b', undefined)).toBe(expected, { U: undefined });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should error on empty', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^----|');
      const e1subs = '     ^----!';
      const expected = '   -----#';
      expectObservable(e1[first]()).toBe(expected, null, new EmptyError());
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should return the default value if source observable was empty', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-----^----|   ');
      const e1subs = '     ^----!   ';
      const expected = '   -----(a|)';
      expectObservable(e1[first](null, 'a')).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should propagate error from the source observable', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('---^---#');
      const e1subs = '   ^---!';
      const expected = ' ----#';
      expectObservable(e1[first]()).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should go on forever on never', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--^-------');
      const e1subs = '^-------!';
      const expected = '--------';
      expectObservable(e1[first](), '^-------!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should allow unsubscribing early and explicitly', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^-----b----c---d--|');
      const e1subs = '     ^--!               ';
      const expected = '   ----               ';
      const unsub = '      ---!               ';
      expectObservable(e1[first](), unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not break unsubscription chains when result is unsubscribed explicitly', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^-----b----c---d--|');
      const e1subs = '     ^--!               ';
      const expected = '   ----               ';
      const unsub = '      ---!               ';
      const result = e1[mergeMap]((x) => ColdObservable.from([x]))
        [first]()
        [mergeMap]((x) => ColdObservable.from([x]));
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should unsubscribe when the first value is received', async () => {
    await rxTest(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b---c-|');
      const e1subs = '  ^-!         ';
      const t = time('    --|       ');
      const expected = '----(a|)    ';
      const result = e1[first]()[delay](t);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should return first value that matches a predicate', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a-^--b--c--a--c--|');
      const e1subs = '    ^-----!         ';
      const expected = '  ------(c|)      ';
      expectObservable(e1[first]((value) => value === 'c')).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should return first value that matches a predicate for odd numbers', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const values = { a: 1, b: 2, c: 3, d: 4, e: 5 };
      const e1 = hot('--a-^--b--c--d--e--|', values);
      const e1subs = '    ^-----!         ';
      const expected = '  ------(c|)      ';
      expectObservable(e1[first]((x) => x % 2 === 1)).toBe(expected, { c: 3 });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should error when no value matches the predicate', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a-^--b--c--a--c--|');
      const e1subs = '    ^--------------!';
      const expected = '  ---------------#';
      expectObservable(e1[first]((x) => x === 's')).toBe(expected, null, new EmptyError());
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should return the default value when no value matches the predicate', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a-^--b--c--a--c--|   ');
      const e1subs = '    ^--------------!   ';
      const expected = '  ---------------(d|)';
      expectObservable(e1[first]((x) => x === 's', 'd')).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should propagate error when no value matches the predicate', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a-^--b--c--a--#');
      const e1subs = '    ^-----------!';
      const expected = '  ------------#';
      expectObservable(e1[first]((x) => x === 's')).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should return first value that matches the index in the predicate', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a-^--b--c--a--c--|');
      const e1subs = '    ^--------!      ';
      const expected = '  ---------(a|)   ';
      expectObservable(e1[first]((_, i) => i === 2)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should propagate error from predicate', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const values = { a: 1, b: 2, c: 3, d: 4, e: 5 };
      const e1 = hot('--a-^--b--c--d--e--|', values);
      const e1subs = '    ^--------!      ';
      const expected = '  ---------#      ';
      const predicate = function (value) {
        if (value < 4) {
          return false;
        } else {
          throw 'error';
        }
      };
      expectObservable(e1[first](predicate)).toBe(expected, null, 'error');
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
});
