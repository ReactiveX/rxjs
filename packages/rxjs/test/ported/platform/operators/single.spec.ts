// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/single-spec.ts
import { describe, expect, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { EmptyError } from 'rxjs/empty-error';
import { mergeMap } from 'rxjs/merge-map';
import { NotFoundError } from 'rxjs/not-found-error';
import { SequenceError } from 'rxjs/sequence-error';
import { single } from 'rxjs/single';
import { tap } from 'rxjs/tap';
describe('single (platform)', () => {
  it('should raise error from empty predicate if observable emits multiple time', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--|');
      const e1subs = '  ^----!      ';
      const expected = '-----#      ';
      expectObservable(e1[single]()).toBe(expected, null, new SequenceError('Too many matching values'));
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should raise error from empty predicate if observable does not emit', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^--|');
      const e1subs = '     ^--!';
      const expected = '   ---#';
      expectObservable(e1[single]()).toBe(expected, null, new EmptyError());
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should return only element from empty predicate if observable emits only once', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--|');
      const e1subs = '  ^----!';
      const expected = '-----(a|)';
      expectObservable(e1[single]()).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should allow unsubscribing explicitly and early', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--|');
      const unsub = '   ----!        ';
      const e1subs = '  ^---!        ';
      const expected = '------------';
      expectObservable(e1[single](), unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not break unsubscription chains when result is unsubscribed explicitly', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--|');
      const e1subs = '  ^--!        ';
      const expected = '----        ';
      const unsub = '   ---!        ';
      const result = e1[mergeMap]((x) => Observable.from([x]))
        [single]()
        [mergeMap]((x) => Observable.from([x]));
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should raise error from empty predicate if observable emits error', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b^--#');
      const e1subs = '        ^--!';
      const expected = '      ---#';
      expectObservable(e1[single]()).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should raise error from predicate if observable emits error', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--b^--#');
      const e1subs = '      ^--!';
      const expected = '    ---#';
      expectObservable(e1[single]((v) => v === 'c')).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should raise error if predicate throws error', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--d--|');
      const e1subs = '  ^----------!   ';
      const expected = '-----------#   ';
      expectObservable(
        e1[single]((v) => {
          if (v !== 'd') {
            return false;
          }
          throw 'error';
        })
      ).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should return element from predicate if observable have single matching element', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--|');
      const e1subs = '  ^----------!';
      const expected = '-----------(b|)';
      expectObservable(e1[single]((v) => v === 'b')).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should raise error from predicate if observable have multiple matching element', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--a--b--b--|');
      const e1subs = '  ^----------!      ';
      const expected = '-----------#      ';
      expectObservable(e1[single]((v) => v === 'b')).toBe(expected, null, new SequenceError('Too many matching values'));
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should raise error from predicate if observable does not emit', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^--|');
      const e1subs = '     ^--!';
      const expected = '   ---#';
      expectObservable(e1[single]((v) => v === 'a')).toBe(expected, null, new EmptyError());
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should raise error from predicate if observable does not contain matching element', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--|');
      const e1subs = '  ^----------!';
      const expected = '-----------#';
      expectObservable(e1[single]((v) => v === 'x')).toBe(expected, undefined, new NotFoundError('No matching values'));
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should call predicate with indices starting at 0', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--|');
      const e1subs = '  ^----------!';
      const expected = '-----------(b|)';
      let indices = [];
      const predicate = function (value, index) {
        indices.push(index);
        return value === 'b';
      };
      expectObservable(
        e1[single](predicate)[tap]({
          complete: () => {
            expect(indices).toEqual([0, 1, 2]);
          },
        })
      ).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should error for synchronous empty observables when no arguments are provided', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const source = observable('|');
      const expected = '   #';
      const subs = ['      (^!)'];
      const result = source[single]();
      expectObservable(result).toBe(expected, undefined, new EmptyError());
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should error for async empty observables when no arguments are provided', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const source = observable('-------|');
      const expected = '   -------#';
      const subs = ['      ^------!'];
      const result = source[single]();
      expectObservable(result).toBe(expected, undefined, new EmptyError());
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should error for hot observables that do not emit while active when no arguments are provided', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('--a--b--^----|');
      const expected = '          -----#';
      const subs = ['             ^----!'];
      const result = source[single]();
      expectObservable(result).toBe(expected, undefined, new EmptyError());
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should error for synchronous empty observables when predicate never passes', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const source = observable('|');
      const expected = '   #';
      const subs = ['      (^!)'];
      const result = source[single](() => false);
      expectObservable(result).toBe(expected, undefined, new EmptyError());
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should error for async empty observables when predicate never passes', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const source = observable('-------|');
      const expected = '   -------#';
      const subs = ['      ^------!'];
      const result = source[single](() => false);
      expectObservable(result).toBe(expected, undefined, new EmptyError());
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should error for hot observables that do not emit while active when predicate never passes', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('--a--b--^----|');
      const expected = '          -----#';
      const subs = ['             ^----!'];
      const result = source[single](() => false);
      expectObservable(result).toBe(expected, undefined, new EmptyError());
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should error for synchronous observables that emit when predicate never passes', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const source = observable('(a|)');
      const expected = '   #';
      const subs = ['      (^!)'];
      const result = source[single](() => false);
      expectObservable(result).toBe(expected, undefined, new NotFoundError('No matching values'));
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should error for async observables that emit when predicate never passes', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const source = observable('--a--b-|');
      const expected = '   -------#';
      const subs = ['      ^------!'];
      const result = source[single](() => false);
      expectObservable(result).toBe(expected, undefined, new NotFoundError('No matching values'));
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should error for hot observables that emit while active when predicate never passes', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('--a--b--^--c--d--|');
      const expected = '          ---------#';
      const subs = ['             ^--------!'];
      const result = source[single](() => false);
      expectObservable(result).toBe(expected, undefined, new NotFoundError('No matching values'));
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should error for synchronous observables when the predicate passes more than once', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const source = observable('(axbxc|)');
      const expected = '   #';
      const subs = ['      (^!)'];
      const result = source[single]((v) => v === 'x');
      expectObservable(result).toBe(expected, undefined, new SequenceError('Too many matching values'));
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should error for async observables that emit when the predicate passes more than once', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const source = observable('--a-x-b-x-c-|');
      const expected = '   --------#';
      const subs = ['      ^-------!'];
      const result = source[single]((v) => v === 'x');
      expectObservable(result).toBe(expected, undefined, new SequenceError('Too many matching values'));
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should error for hot observables that emit while active when the predicate passes more than once', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('--a--b--^--c--x--d--x--|');
      const expected = '          ------------#';
      const subs = ['             ^-----------!'];
      const result = source[single]((v) => v === 'x');
      expectObservable(result).toBe(expected, undefined, new SequenceError('Too many matching values'));
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
});
