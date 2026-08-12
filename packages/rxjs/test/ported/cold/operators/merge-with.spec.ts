// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/mergeWith-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { map } from 'rxjs/map';
import { merge } from 'rxjs/merge';
describe('mergeWith (cold)', () => {
  it('should handle merging two hot observables', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a-----b-----c----|');
      const e1subs = '  ^------------------!';
      const e2 = hot('-----d-----e-----f---|');
      const e2subs = '  ^--------------------!';
      const expected = '--a--d--b--e--c--f---|';
      const result = e1[merge]([e2]);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should merge cold and cold', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' ---a-----b-----c----|');
      const e1subs = '  ^-------------------!';
      const e2 = cold(' ------x-----y-----z----|');
      const e2subs = '  ^----------------------!';
      const expected = '---a--x--b--y--c--z----|';
      const result = e1[merge]([e2]);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should merge hot and hot', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('---a---^-b-----c----|');
      const e1subs = '       ^------------!';
      const e2 = hot('-----x-^----y-----z----|');
      const e2subs = '       ^---------------!';
      const expected = '     --b--y--c--z----|';
      const result = e1[merge]([e2]);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should merge hot and cold', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e1 = hot('---a-^---b-----c----|');
      const e1subs = '     ^--------------!';
      const e2 = cold('    --x-----y-----z----|');
      const e2subs = '     ^------------------!';
      const expected = '   --x-b---y-c---z----|';
      const result = e1[merge]([e2]);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should merge parallel emissions', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ---a----b----c----|');
      const e1subs = '  ^-----------------!';
      const e2 = hot('  ---x----y----z----|');
      const e2subs = '  ^-----------------!';
      const expected = '---(ax)-(by)-(cz)-|';
      const result = e1[merge]([e2]);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should allow unsubscribing explicitly and early', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a-----b-----c----|  ');
      const e1subs = '  ^---------!           ';
      const e2 = hot('  -----d-----e-----f---|');
      const e2subs = '  ^---------!           ';
      const expected = '--a--d--b--           ';
      const unsub = '   ----------!           ';
      const result = e1[merge]([e2]);
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should not break unsubscription chains when result is unsubscribed explicitly', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a-----b-----c----|  ');
      const e1subs = '  ^---------!           ';
      const e2 = hot('  -----d-----e-----f---|');
      const e2subs = '  ^---------!           ';
      const expected = '--a--d--b--           ';
      const unsub = '   ----------!           ';
      const result = e1[map]((x) => x)
        [merge]([e2])
        [map]((x) => x);
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should merge empty and empty', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('|   ');
      const e1subs = ' (^!)';
      const e2 = cold('|   ');
      const e2subs = ' (^!)';
      const result = e1[merge]([e2]);
      expectObservable(result).toBe('|');
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should merge three empties', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('|');
      const e1subs = ' (^!)';
      const e2 = cold('|');
      const e2subs = ' (^!)';
      const e3 = cold('|');
      const e3subs = ' (^!)';
      const result = e1[merge]([e2, e3]);
      expectObservable(result).toBe('|');
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
      expectSubscriptions(e3.subscriptions).toBe(e3subs);
    });
  });
  it('should merge never and empty', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('-');
      const e1subs = '^!';
      const e2 = cold('|');
      const e2subs = ' (^!)';
      const result = e1[merge]([e2]);
      expectObservable(result, '^!').toBe('-');
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should merge never and never', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('-');
      const e1subs = '^!';
      const e2 = cold('-');
      const e2subs = '^!';
      const result = e1[merge]([e2]);
      expectObservable(result, '^!').toBe('-');
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should merge empty and throw', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('|');
      const e1subs = ' (^!)';
      const e2 = cold('#');
      const e2subs = ' (^!)';
      const result = e1[merge]([e2]);
      expectObservable(result).toBe('#');
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should merge hot and throw', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e1 = hot(' --a--b--c--|');
      const e1subs = '(^!)';
      const e2 = cold('#');
      const e2subs = '(^!)';
      const result = e1[merge]([e2]);
      expectObservable(result).toBe('#');
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should merge never and throw', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('-');
      const e1subs = ' (^!)';
      const e2 = cold('#');
      const e2subs = ' (^!)';
      const result = e1[merge]([e2]);
      expectObservable(result).toBe('#');
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should merge empty and eventual error', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' |');
      const e1subs = '  (^!)    ';
      const e2 = hot('  -------#');
      const e2subs = '  ^------!';
      const expected = '-------#';
      const result = e1[merge]([e2]);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should merge hot and error', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--|');
      const e1subs = '  ^------!    ';
      const e2 = hot('  -------#    ');
      const e2subs = '  ^------!    ';
      const expected = '--a--b-#    ';
      const result = e1[merge]([e2]);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should merge never and error', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --------');
      const e1subs = '  ^------!';
      const e2 = hot('  -------#');
      const e2subs = '  ^------!';
      const expected = '-------#';
      const result = e1[merge]([e2]);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
});
