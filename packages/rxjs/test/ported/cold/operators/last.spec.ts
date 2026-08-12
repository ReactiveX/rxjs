// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/last-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { ColdObservable } from 'rxjs/cold-observable';
import { EmptyError } from 'rxjs/empty-error';
import { last } from 'rxjs/last';
import { mergeMap } from 'rxjs/merge-map';
describe('last (cold)', () => {
  it('should take the last value of an observable', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a----b--c--|   ');
      const e1subs = '  ^------------!   ';
      const expected = '-------------(c|)';
      expectObservable(e1[last]()).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should error on nothing sent but completed', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^----|');
      const e1subs = '     ^----!';
      const expected = '   -----#';
      expectObservable(e1[last]()).toBe(expected, null, new EmptyError());
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should error on empty', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' |   ');
      const e1subs = '  (^!)';
      const expected = '#   ';
      expectObservable(e1[last]()).toBe(expected, null, new EmptyError());
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should go on forever on never', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' -');
      const e1subs = '^!';
      const expected = '-';
      expectObservable(e1[last](), '^!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should allow undefined as a default value', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -----a--a---a-|   ');
      const e1subs = '  ^-------------!   ';
      const expected = '--------------(U|)';
      expectObservable(e1[last]((value) => value === 'b', undefined)).toBe(expected, { U: undefined });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should return last element matches with predicate', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--a--b--|   ');
      const e1subs = '  ^-------------!   ';
      const expected = '--------------(b|)';
      expectObservable(e1[last]((value) => value === 'b')).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should allow unsubscribing explicitly and early', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--d--|');
      const e1subs = '  ^------!       ';
      const expected = '--------       ';
      const unsub = '   -------!       ';
      expectObservable(e1[last](), unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not break unsubscription chains when result is unsubscribed explicitly', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--d--|');
      const e1subs = '  ^------!       ';
      const expected = '--------       ';
      const unsub = '   -------!       ';
      const result = e1[mergeMap]((x) => ColdObservable.from([x]))
        [last]()
        [mergeMap]((x) => ColdObservable.from([x]));
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should return a default value if no element found', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' |   ');
      const e1subs = '  (^!)';
      const expected = '(a|)';
      expectObservable(e1[last](null, 'a')).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not return default value if an element is found', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a---^---b---c---d---|   ');
      const e1subs = '      ^---------------!   ';
      const expected = '    ----------------(d|)';
      expectObservable(e1[last](null, 'x')).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should raise error when predicate throws', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^---b---c---d---e--|');
      const e1subs = '     ^-------!           ';
      const expected = '   --------#           ';
      const predicate = function (x) {
        if (x === 'c') {
          throw 'error';
        } else {
          return false;
        }
      };
      expectObservable(e1[last](predicate)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
});
