// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/observables/concat-spec.ts
import { describe, expect, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { concat } from 'rxjs/concat';
import { mergeMap } from 'rxjs/merge-map';
describe('concat (platform)', () => {
  it('should emit elements from multiple sources', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' -a-b-c-|');
      const e1subs = '  ^------!';
      const e2 = observable('        -0-1-|');
      const e2subs = '  -------^----!';
      const e3 = observable('             -w-x-y-z-|');
      const e3subs = '  ------------^--------!';
      const expected = '-a-b-c--0-1--w-x-y-z-|';
      expectObservable(Observable[concat]([e1, e2, e3])).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
      expectSubscriptions(e3.subscriptions).toBe(e3subs);
    });
  });
  it('should concat the same cold observable multiple times', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const inner = observable('--i-j-k-l-|');
      const innersubs = [
        '                 ^---------!                              ',
        '                 ----------^---------!                    ',
        '                 --------------------^---------!          ',
        '                 ------------------------------^---------!',
      ];
      const expected = '  --i-j-k-l---i-j-k-l---i-j-k-l---i-j-k-l-|';
      const result = Observable[concat]([inner, inner, inner, inner]);
      expectObservable(result).toBe(expected);
      expectSubscriptions(inner.subscriptions).toBe(innersubs);
    });
  });
  it('should concat the same cold observable multiple times, but the result is unsubscribed early', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const innersubs = [];
      const inner = observable('--i-j-k-l-|     ');
      const unsub = '     ---------------!';
      innersubs[0] = '    ^---------!     ';
      innersubs[1] = '    ----------^----!';
      const expected = '  --i-j-k-l---i-j-';
      const result = Observable[concat]([inner, inner, inner, inner]);
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(inner.subscriptions).toBe(innersubs);
    });
  });
  it('should not break unsubscription chains when result is unsubscribed explicitly', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const innersubs = [];
      const inner = observable('--i-j-k-l-|');
      innersubs[0] = '    ^---------!';
      innersubs[1] = '    ----------^----!';
      const expected = '  --i-j-k-l---i-j-';
      const unsub = '     ---------------!';
      const innerWrapped = inner[mergeMap]((x) => Observable.from([x]));
      const result = Observable[concat]([innerWrapped, innerWrapped, innerWrapped, innerWrapped])[mergeMap]((x) => Observable.from([x]));
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(inner.subscriptions).toBe(innersubs);
    });
  });
  it('should complete without emit if both sources are empty', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' --|');
      const e1subs = '  ^-!';
      const e2 = observable(' ----|');
      const e2subs = '  --^---!';
      const expected = '------|';
      expectObservable(Observable[concat]([e1, e2])).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should not complete if first source does not completes', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' -');
      const e1subs = '^!';
      const e2 = observable(' --|');
      const e2subs = '  -';
      const expected = '-';
      expectObservable(Observable[concat]([e1, e2]), '^!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should not complete if second source does not completes', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' --|');
      const e1subs = '  ^-!';
      const e2 = observable(' ---');
      const e2subs = '--^!';
      const expected = '---';
      expectObservable(Observable[concat]([e1, e2]), '^--!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should not complete if both sources do not complete', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' -');
      const e1subs = '^!';
      const e2 = observable(' -');
      const e2subs = '  -';
      const expected = '-';
      expectObservable(Observable[concat]([e1, e2]), '^!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should raise error when first source is empty, second source raises error', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' --|');
      const e1subs = '  ^-!';
      const e2 = observable(' ----#');
      const e2subs = '  --^---!';
      const expected = '------#';
      expectObservable(Observable[concat]([e1, e2])).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should raise error when first source raises error, second source is empty', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' ---#');
      const e1subs = '  ^--!';
      const e2 = observable(' ----|');
      const e2subs = '     -';
      const expected = '---#';
      expectObservable(Observable[concat]([e1, e2])).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should raise first error when both source raise error', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' ---#');
      const e1subs = '  ^--!';
      const e2 = observable(' ------#');
      const e2subs = '     -';
      const expected = '---#';
      expectObservable(Observable[concat]([e1, e2])).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should concat if first source emits once, second source is empty', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' --a--|');
      const e1subs = '  ^----!';
      const e2 = observable(' --------|');
      const e2subs = '  -----^-------!';
      const expected = '--a----------|';
      expectObservable(Observable[concat]([e1, e2])).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should concat if first source is empty, second source emits once', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' --|');
      const e1subs = '  ^-!';
      const e2 = observable(' --a--|');
      const e2subs = '  --^----!';
      const expected = '----a--|';
      expectObservable(Observable[concat]([e1, e2])).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it("'should emit element from first source, and should not complete if second ' + 'source does not completes'", async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' --a--|');
      const e1subs = '  ^----!';
      const e2 = observable(' -');
      const e2subs = '-----^!';
      const expected = '--a---';
      expectObservable(Observable[concat]([e1, e2]), '^-----!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should not complete if first source does not complete', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' -');
      const e1subs = '^!';
      const e2 = observable(' --a--|');
      const e2subs = '  -';
      const expected = '-';
      expectObservable(Observable[concat]([e1, e2]), '^!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should emit elements from each source when source emit once', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' ---a|');
      const e1subs = '  ^---!';
      const e2 = observable('     -----b--|');
      const e2subs = '  ----^-------!';
      const expected = '---a-----b--|';
      expectObservable(Observable[concat]([e1, e2])).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should unsubscribe to inner source if outer is unsubscribed early', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' ---a-a--a|            ');
      const e1subs = '  ^--------!            ';
      const e2 = observable('          -----b-b--b-|');
      const e2subs = '  ---------^-------!    ';
      const unsub = '   -----------------!    ';
      const expected = '---a-a--a-----b-b-    ';
      expectObservable(Observable[concat]([e1, e2]), unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should raise error from first source and does not emit from second source', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' --#');
      const e1subs = '  ^-!';
      const e2 = observable(' ----a--|');
      const e2subs = '  -';
      const expected = '--#';
      expectObservable(Observable[concat]([e1, e2])).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should emit element from first source then raise error from second source', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' --a--|');
      const e1subs = '  ^----!';
      const e2 = observable(' -------#');
      const e2subs = '  -----^------!';
      const expected = '--a---------#';
      expectObservable(Observable[concat]([e1, e2])).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it("'should emit all elements from both hot observable sources if first source ' + 'completes before second source starts emit'", async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b-|');
      const e1subs = '  ^------!';
      const e2 = hot('  --------x--y--|');
      const e2subs = '  -------^------!';
      const expected = '--a--b--x--y--|';
      expectObservable(Observable[concat]([e1, e2])).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it("'should emit elements from second source regardless of completion time ' + 'when second source is cold observable'", async () => {
    await rxTest(({ hot, observable, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c---|');
      const e1subs = '  ^-----------!';
      const e2 = observable('             -x-y-z-|');
      const e2subs = '  ------------^------!';
      const expected = '--a--b--c----x-y-z-|';
      expectObservable(Observable[concat]([e1, e2])).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should not emit collapsing element from second source', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--|');
      const e1subs = '  ^----------!';
      const e2 = hot('  --------x--y--z--|');
      const e2subs = '  -----------^-----!';
      const expected = '--a--b--c--y--z--|';
      expectObservable(Observable[concat]([e1, e2])).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should return empty if concatenating an empty source', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable('|');
      const e1subs = ['(^!)', '(^!)'];
      const expected = '|';
      const result = Observable[concat]([e1, e1]);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should error immediately if given a just-throw source', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' #');
      const e1subs = '  (^!)';
      const expected = '#';
      const result = Observable[concat]([e1, e1]);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it("'should emit elements from second source regardless of completion time ' + 'when second source is cold observable'", async () => {
    await rxTest(({ hot, observable, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c---|');
      const e1subs = '  ^-----------!';
      const e2 = observable('             -x-y-z-|');
      const e2subs = '  ------------^------!';
      const expected = '--a--b--c----x-y-z-|';
      expectObservable(Observable[concat]([e1, e2])).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should not emit collapsing element from second source', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--|');
      const e1subs = '  ^----------!';
      const e2 = hot('  --------x--y--z--|');
      const e2subs = '  -----------^-----!';
      const expected = '--a--b--c--y--z--|';
      expectObservable(Observable[concat]([e1, e2])).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should return passed observable if no scheduler was passed', async () => {
    await rxTest(({ observable, expectObservable }) => {
      const source = observable('--a---b----c---|');
      const expected = '   --a---b----c---|';
      const result = Observable[concat]([source]);
      expectObservable(result).toBe(expected);
    });
  });
  it('should return RxJS Observable when single lowerCaseO was passed', async () => {
    const lowerCaseO = (...values) => {
      const source = {
        subscribe(observer) {
          const destination = typeof observer === 'function' ? { next: observer } : observer;
          for (const value of values) destination.next?.(value);
          destination.complete?.();
          return { unsubscribe() {} };
        },
      };
      const observableKey = Symbol.observable ?? '@@observable';
      source[observableKey] = function () {
        return this;
      };
      return source;
    };
    await rxTest(({ expectObservable }) => {
      const source = lowerCaseO('a', 'b', 'c');
      const result = Observable[concat]([source]);
      expect(result).toBeInstanceOf(Observable);
      expectObservable(result).toBe('(abc|)');
    });
  });
});
