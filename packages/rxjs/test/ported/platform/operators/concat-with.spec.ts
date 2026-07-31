// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/concatWith-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { concat } from 'rxjs/concat';
import { mergeMap } from 'rxjs/merge-map';
describe('concatWith (platform)', () => {
  it('should concatenate two cold observables', async () => {
    await rxTest(({ observable, expectObservable }) => {
      const e1 = observable(' --a--b-|');
      const e2 = observable('        --x---y--|');
      const expected = '--a--b---x---y--|';
      expectObservable(e1[concat]([e2])).toBe(expected);
    });
  });
  it('should complete without emit if both sources are empty', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' --|');
      const e1subs = '  ^-!';
      const e2 = observable('   ----|');
      const e2subs = '  --^---!';
      const expected = '------|';
      expectObservable(e1[concat]([e2])).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should not complete if first source does not completes', async () => {
    const NO_SUBS = [];
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' ---');
      const e1subs = '^!';
      const e2 = observable('    --|');
      const e2subs = NO_SUBS;
      const expected = '---';
      expectObservable(e1[concat]([e2]), '^!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should not complete if second source does not completes', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' --|');
      const e1subs = '  ^-!';
      const e2 = observable('   ---');
      const e2subs = '--^!';
      const expected = '-----';
      expectObservable(e1[concat]([e2]), '^--!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should not complete if both sources do not complete', async () => {
    const NO_SUBS = [];
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' ---');
      const e1subs = '^!';
      const e2 = observable('    ---');
      const e2subs = NO_SUBS;
      const expected = '---';
      expectObservable(e1[concat]([e2]), '^!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should raise error when first source is empty, second source raises error', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' --|');
      const e1subs = '  ^-!';
      const e2 = observable('   ----#');
      const e2subs = '  --^---!';
      const expected = '------#';
      expectObservable(e1[concat]([e2])).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should raise error when first source raises error, second source is empty', async () => {
    const NO_SUBS = [];
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' ---#');
      const e1subs = '  ^--!';
      const e2 = observable('    ----|');
      const expected = '---#';
      const e2subs = NO_SUBS;
      expectObservable(e1[concat]([e2])).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should raise first error when both source raise error', async () => {
    const NO_SUBS = [];
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' ---#');
      const e1subs = '  ^--!';
      const e2 = observable('    ------#');
      const expected = '---#';
      const e2subs = NO_SUBS;
      expectObservable(e1[concat]([e2])).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should concat if first source emits once, second source is empty', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' --a--|');
      const e1subs = '  ^----!';
      const e2 = observable('      --------|');
      const e2subs = '  -----^-------!';
      const expected = '--a----------|';
      expectObservable(e1[concat]([e2])).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should concat if first source is empty, second source emits once', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' --|');
      const e1subs = '  ^-!';
      const e2 = observable('   --a--|');
      const e2subs = '  --^----!';
      const expected = '----a--|';
      expectObservable(e1[concat]([e2])).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should emit element from first source, and should not complete if second source does not completes', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' --a--|');
      const e1subs = '  ^----!';
      const e2 = observable('      ---');
      const e2subs = '-----^!';
      const expected = '--a-----';
      expectObservable(e1[concat]([e2]), '^-----!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should not complete if first source does not complete', async () => {
    const NO_SUBS = [];
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' ---');
      const e1subs = '^!';
      const e2 = observable('    --a--|');
      const e2subs = NO_SUBS;
      const expected = '---';
      expectObservable(e1[concat]([e2]), '^!').toBe(expected);
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
      expectObservable(e1[concat]([e2])).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should unsubscribe to inner source if outer is unsubscribed early', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable('  ---a-a--a|            ');
      const e1subs = '   ^--------!            ';
      const e2 = observable('           -----b-b--b-|');
      const e2subs = '   ---------^-------!';
      const unsub = '    -----------------!  ';
      const expected = ' ---a-a--a-----b-b     ';
      expectObservable(e1[concat]([e2]), unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should not break unsubscription chains when result is unsubscribed explicitly', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' ---a-a--a|            ');
      const e1subs = '  ^--------!            ';
      const e2 = observable('          -----b-b--b-|');
      const e2subs = '  ---------^--------!    ';
      const expected = '---a-a--a-----b-b-    ';
      const unsub = '   ------------------!    ';
      const result = e1[mergeMap]((x) => Observable.from([x]))
        [concat]([e2])
        [mergeMap]((x) => Observable.from([x]));
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should raise error from first source and does not emit from second source', async () => {
    const NO_SUBS = [];
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' --#');
      const e1subs = '  ^-!';
      const e2 = observable('   ----a--|');
      const e2subs = NO_SUBS;
      const expected = '--#';
      expectObservable(e1[concat]([e2])).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should emit element from first source then raise error from second source', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' --a--|');
      const e1subs = '  ^----!';
      const e2 = observable('      -------#');
      const e2subs = '  -----^------!';
      const expected = '--a---------#';
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
    await rxTest(({ hot, observable, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c---|');
      const e1subs = '  ^-----------!';
      const e2 = observable('           -x-y-z-|');
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
  it('should emit self without parameters', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' ---a-|');
      const e1subs = '  ^----!';
      const expected = '---a-|';
      expectObservable(e1[concat]([])).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
});
