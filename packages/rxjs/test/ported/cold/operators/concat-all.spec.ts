// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/concatAll-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { ColdObservable } from 'rxjs/cold-observable';
import { mergeMap } from 'rxjs/merge-map';
import { take } from 'rxjs/take';
describe('concatAll (cold)', () => {
  it('should concat an observable of observables', async () => {
    await rxTest(({ cold, hot, expectObservable }) => {
      const x = cold('    ----a------b------|                 ');
      const y = cold('                      ---c-d---|        ');
      const z = cold('                               ---e--f-|');
      const outer = hot('-x---y----z------|', { x: x, y: y, z: z });
      const expected = ' -----a------b---------c-d------e--f-|';
      const result = outer[mergeMap]((value) => value, { concurrent: 1 });
      expectObservable(result).toBe(expected);
    });
  });
  it('should concat all observables in an observable', async () => {
    await rxTest(({ expectObservable }) => {
      const e1 = ColdObservable.from([ColdObservable.from(['a']), ColdObservable.from(['b']), ColdObservable.from(['c'])])[take](10);
      const expected = '(abc|)';
      expectObservable(e1[mergeMap]((value) => value, { concurrent: 1 })).toBe(expected);
    });
  });
  it('should throw if any child observable throws', async () => {
    await rxTest(({ expectObservable }) => {
      const e1 = ColdObservable.from([
        ColdObservable.from(['a']),
        new ColdObservable((subscriber) => {
          subscriber.error('error');
        }),
        ColdObservable.from(['c']),
      ])[take](10);
      const expected = '(a#)';
      expectObservable(e1[mergeMap]((value) => value, { concurrent: 1 })).toBe(expected);
    });
  });
  it('should concat merging a hot observable of non-overlapped observables', async () => {
    await rxTest(({ cold, hot, expectObservable }) => {
      const values = {
        x: cold('       a-b---------|'),
        y: cold('                 c-d-e-f-|'),
        z: cold('                          g-h-i-j-k-|'),
      };
      const e1 = hot('  --x---------y--------z--------|', values);
      const expected = '--a-b---------c-d-e-f-g-h-i-j-k-|';
      expectObservable(e1[mergeMap]((value) => value, { concurrent: 1 })).toBe(expected);
    });
  });
  it('should raise error if inner observable raises error', async () => {
    await rxTest(({ cold, hot, expectObservable }) => {
      const values = {
        x: cold('       a-b---------|'),
        y: cold('                 c-d-e-f-#'),
        z: cold('                         g-h-i-j-k-|'),
      };
      const e1 = hot('  --x---------y--------z--------|', values);
      const expected = '--a-b---------c-d-e-f-#';
      expectObservable(e1[mergeMap]((value) => value, { concurrent: 1 })).toBe(expected);
    });
  });
  it('should raise error if outer observable raises error', async () => {
    await rxTest(({ cold, hot, expectObservable }) => {
      const values = {
        y: cold('       a-b---------|'),
        z: cold('                 c-d-e-f-|'),
      };
      const e1 = hot('  --y---------z---#    ', values);
      const expected = '--a-b---------c-#';
      expectObservable(e1[mergeMap]((value) => value, { concurrent: 1 })).toBe(expected);
    });
  });
  it('should complete without emit if both sources are empty', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('  --|');
      const e1subs = '   ^-!';
      const e2 = cold('    ----|');
      const e2subs = '   --^---!';
      const expected = ' ------|';
      const result = ColdObservable.from([e1, e2])[mergeMap]((value) => value, { concurrent: 1 });
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should not complete if first source does not completes', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('  -');
      const e1subs = '^!';
      const e2 = cold('  --|');
      const e2subs = [];
      const expected = ' -';
      const result = ColdObservable.from([e1, e2])[mergeMap]((value) => value, { concurrent: 1 });
      expectObservable(result, '^!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should not complete if second source does not completes', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('  --|');
      const e1subs = '   ^-!';
      const e2 = cold('  ---');
      const e2subs = '--^!';
      const expected = ' ---';
      const result = ColdObservable.from([e1, e2])[mergeMap]((value) => value, { concurrent: 1 });
      expectObservable(result, '^--!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should not complete if both sources do not complete', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('  -');
      const e1subs = '^!';
      const e2 = cold('  -');
      const e2subs = [];
      const expected = ' -';
      const result = ColdObservable.from([e1, e2])[mergeMap]((value) => value, { concurrent: 1 });
      expectObservable(result, '^!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should raise error when first source is empty, second source raises error', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('  --|');
      const e1subs = '   ^-!';
      const e2 = cold('    ----#');
      const e2subs = '   --^---!';
      const expected = ' ------#';
      const result = ColdObservable.from([e1, e2])[mergeMap]((value) => value, { concurrent: 1 });
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should raise error when first source raises error, second source is empty', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('  ---#');
      const e1subs = '   ^--!';
      const e2 = cold('  ----|');
      const e2subs = [];
      const expected = ' ---#';
      const result = ColdObservable.from([e1, e2])[mergeMap]((value) => value, { concurrent: 1 });
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should raise first error when both source raise error', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('  ---#');
      const e1subs = '   ^--!';
      const e2 = cold('  ------#');
      const e2subs = [];
      const expected = ' ---#';
      const result = ColdObservable.from([e1, e2])[mergeMap]((value) => value, { concurrent: 1 });
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should concat if first source emits once, second source is empty', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('  --a--|');
      const e1subs = '   ^----!';
      const e2 = cold('       --------|');
      const e2subs = '   -----^-------!';
      const expected = ' --a----------|';
      const result = ColdObservable.from([e1, e2])[mergeMap]((value) => value, { concurrent: 1 });
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should concat if first source is empty, second source emits once', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('  --|');
      const e1subs = '   ^-!';
      const e2 = cold('    --a--|');
      const e2subs = '   --^----!';
      const expected = ' ----a--|';
      const result = ColdObservable.from([e1, e2])[mergeMap]((value) => value, { concurrent: 1 });
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should emit element from first source, and should not complete if second source does not completes', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('  --a--|');
      const e1subs = '   ^----!';
      const e2 = cold('       -');
      const e2subs = '-----^!';
      const expected = ' --a---';
      const result = ColdObservable.from([e1, e2])[mergeMap]((value) => value, { concurrent: 1 });
      expectObservable(result, '^-----!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should not complete if first source does not complete', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('  -');
      const e1subs = '^!';
      const e2 = cold('  --a--|');
      const e2subs = [];
      const expected = ' -';
      const result = ColdObservable.from([e1, e2])[mergeMap]((value) => value, { concurrent: 1 });
      expectObservable(result, '^!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should emit elements from each source when source emit once', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('  ---a|');
      const e1subs = '   ^---!';
      const e2 = cold('      -----b--|');
      const e2subs = '   ----^-------!';
      const expected = ' ---a-----b--|';
      const result = ColdObservable.from([e1, e2])[mergeMap]((value) => value, { concurrent: 1 });
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should unsubscribe to inner source if outer is unsubscribed early', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('  ---a-a--a|            ');
      const e1subs = '   ^--------!            ';
      const e2 = cold('           -----b-b--b-|');
      const e2subs = '   ---------^-------!    ';
      const unsub = '    -----------------!    ';
      const expected = ' ---a-a--a-----b-b     ';
      const result = ColdObservable.from([e1, e2])[mergeMap]((value) => value, { concurrent: 1 });
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should not break unsubscription chains when result is unsubscribed explicitly', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('  ---a-a--a|            ');
      const e1subs = '   ^--------!            ';
      const e2 = cold('           -----b-b--b-|');
      const e2subs = '   ---------^-------!    ';
      const expected = ' ---a-a--a-----b-b-    ';
      const unsub = '    -----------------!    ';
      const result = ColdObservable.from([e1, e2])
        [mergeMap]((x) => ColdObservable.from([x]))
        [mergeMap]((value) => value, { concurrent: 1 })
        [mergeMap]((x) => ColdObservable.from([x]));
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should raise error from first source and does not emit from second source', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('  --#');
      const e1subs = '   ^-!';
      const e2 = cold('  ----a--|');
      const e2subs = [];
      const expected = ' --#';
      const result = ColdObservable.from([e1, e2])[mergeMap]((value) => value, { concurrent: 1 });
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should emit element from first source then raise error from second source', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('  --a--|');
      const e1subs = '   ^----!';
      const e2 = cold('       -------#');
      const e2subs = '   -----^------!';
      const expected = ' --a---------#';
      const result = ColdObservable.from([e1, e2])[mergeMap]((value) => value, { concurrent: 1 });
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should emit all elements from both hot observable sources if first source completes before second source starts emit', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b-|');
      const e1subs = '  ^------!';
      const e2 = hot('  --------x--y--|');
      const e2subs = '  -------^------!';
      const expected = '--a--b--x--y--|';
      const result = ColdObservable.from([e1, e2])[mergeMap]((value) => value, { concurrent: 1 });
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should emit elements from second source regardless of completion time when second source is cold observable', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c---|');
      const e1subs = '  ^-----------!';
      const e2 = cold(' -x-y-z-|');
      const e2subs = '  ------------^------!';
      const expected = '--a--b--c----x-y-z-|';
      const result = ColdObservable.from([e1, e2])[mergeMap]((value) => value, { concurrent: 1 });
      expectObservable(result).toBe(expected);
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
      const result = ColdObservable.from([e1, e2])[mergeMap]((value) => value, { concurrent: 1 });
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should be able to work on a different scheduler', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions, schedule }) => {
      const first = cold('---a|');
      const second = cold('---b--|');
      const third = cold('---c--|');
      const outer = new globalThis.Observable((subscriber) => {
        schedule(
          () => {
            for (const source of [first, second, third]) {
              subscriber.next(source);
            }
            subscriber.complete();
          },
          0,
          { signal: subscriber.signal }
        );
      });
      // The local outer source retains the legacy scheduler's frame-zero handoff;
      // exact concatAll flattening retains ordering and inner subscription timing.
      const result = outer[mergeMap]((value) => value, { concurrent: 1 });
      expectObservable(result).toBe('---a---b-----c--|');
      expectSubscriptions(first.subscriptions).toBe('^---!');
      expectSubscriptions(second.subscriptions).toBe('----^-----!');
      expectSubscriptions(third.subscriptions).toBe('----------^-----!');
    });
  });
  it('should concatAll a nested observable with a single inner observable', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('  ---a-|');
      const e1subs = '   ^----!';
      const expected = ' ---a-|';
      const result = ColdObservable.from([e1])[mergeMap]((value) => value, { concurrent: 1 });
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should concatAll a nested observable with a single inner observable, and a scheduler', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions, schedule }) => {
      const first = cold('---a-|');
      const outer = new globalThis.Observable((subscriber) => {
        schedule(
          () => {
            for (const source of [first]) {
              subscriber.next(source);
            }
            subscriber.complete();
          },
          0,
          { signal: subscriber.signal }
        );
      });
      // The local outer source retains the legacy scheduler's frame-zero handoff;
      // exact concatAll flattening retains ordering and inner subscription timing.
      const result = outer[mergeMap]((value) => value, { concurrent: 1 });
      expectObservable(result).toBe('---a-|');
      expectSubscriptions(first.subscriptions).toBe('^----!');
    });
  });
});
