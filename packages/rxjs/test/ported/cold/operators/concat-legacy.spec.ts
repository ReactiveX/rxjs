// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/concat-legacy-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { ColdObservable } from 'rxjs/cold-observable';
import { concat } from 'rxjs/concat';
import { mergeMap } from 'rxjs/merge-map';
describe('concat-legacy (cold)', () => {
  it('should concatenate two cold observables', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const first = cold('--a--b-|');
      const second = cold('--x---y--|');
      const result = first[concat]([second]);
      // The original case passed its TestScheduler as a trailing legacy overload,
      // but its behavioral claim and timing only assert sequential subscription.
      // Preserve that claim without treating the scheduler object as a source.
      expectObservable(result).toBe('--a--b---x---y--|');
      expectSubscriptions(first.subscriptions).toBe('^------!');
      expectSubscriptions(second.subscriptions).toBe('-------^--------!');
    });
  });
  it('should complete without emit if both sources are empty', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('  --|');
      const e1subs = '   ^-!';
      const e2 = cold('    ----|');
      const e2subs = '   --^---!';
      const expected = ' ------|';
      expectObservable(e1[concat]([e2])).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should not complete if first source does not complete', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('  -');
      const e1subs = '^!';
      const e2 = cold('  --|');
      const e2subs = [];
      const expected = ' -';
      expectObservable(e1[concat]([e2]), '^!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should not complete if second source does not complete', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('  --|');
      const e1subs = '   ^-!';
      const e2 = cold('  ---');
      const e2subs = '--^!';
      const expected = ' ---';
      expectObservable(e1[concat]([e2]), '^--!').toBe(expected);
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
      expectObservable(e1[concat]([e2]), '^!').toBe(expected);
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
      expectObservable(e1[concat]([e2])).toBe(expected);
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
      expectObservable(e1[concat]([e2])).toBe(expected);
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
      expectObservable(e1[concat]([e2])).toBe(expected);
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
      expectObservable(e1[concat]([e2])).toBe(expected);
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
      expectObservable(e1[concat]([e2])).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should emit element from first source, and should not complete if second source does not complete', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('  --a--|');
      const e1subs = '   ^----!';
      const e2 = cold('       -');
      const e2subs = '-----^!';
      const expected = ' --a---';
      expectObservable(e1[concat]([e2]), '^-----!').toBe(expected);
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
      expectObservable(e1[concat]([e2]), '^!').toBe(expected);
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
      expectObservable(e1[concat]([e2])).toBe(expected);
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
      expectObservable(e1[concat]([e2]), unsub).toBe(expected);
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
      const result = e1[mergeMap]((x) => ColdObservable.from([x]))
        [concat]([e2])
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
      expectObservable(e1[concat]([e2])).toBe(expected);
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
      expectObservable(e1[concat]([e2])).toBe(expected);
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
      expectObservable(e1[concat]([e2])).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should emit elements from second source regardless of completion time when second source is cold observable', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c---|');
      const e1subs = '  ^-----------!';
      const e2 = cold(' -x-y-z-|');
      const e2subs = '  ------------^------!';
      const expected = '--a--b--c----x-y-z-|';
      expectObservable(e1[concat]([e2])).toBe(expected);
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
      expectObservable(e1[concat]([e2])).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should accept scheduler with multiple observables', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const first = cold('---a|');
      const second = cold('---b--|');
      const third = cold('---c--|');
      const result = first[concat]([second, third]);
      // The trailing scheduler controlled subscription dispatch only. Preserve
      // the exact sequential-source claim without treating that object as input.
      expectObservable(result).toBe('---a---b-----c--|');
      expectSubscriptions(first.subscriptions).toBe('^---!');
      expectSubscriptions(second.subscriptions).toBe('----^-----!');
      expectSubscriptions(third.subscriptions).toBe('----------^-----!');
    });
  });
  it('should accept scheduler without observable parameters', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const first = cold('---a-|');
      const result = first[concat]([]);
      // The trailing scheduler controlled subscription dispatch only. Preserve
      // the exact sequential-source claim without treating that object as input.
      expectObservable(result).toBe('---a-|');
      expectSubscriptions(first.subscriptions).toBe('^----!');
    });
  });
  it('should emit self without parameters', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('  ---a-|');
      const e1subs = '   ^----!';
      const expected = ' ---a-|';
      expectObservable(e1[concat]([])).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
});
