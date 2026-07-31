// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/tap-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { ColdObservable } from 'rxjs/cold-observable';
import { mergeMap } from 'rxjs/merge-map';
import { tap } from 'rxjs/tap';
describe('tap (cold)', () => {
  it('should mirror multiple values and complete', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' --1--2--3--|');
      const e1subs = '  ^----------!';
      const expected = '--1--2--3--|';
      const result = e1[tap](() => {
        //noop
      });
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should allow unsubscribing explicitly and early', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --1--2--3--#');
      const unsub = '   -------!    ';
      const e1subs = '  ^------!    ';
      const expected = '--1--2--    ';
      const result = e1[tap](() => {
        //noop
      });
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not break unsubscription chains when result is unsubscribed explicitly', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --1--2--3--#');
      const e1subs = '  ^------!    ';
      const expected = '--1--2--    ';
      const unsub = '   -------!    ';
      const result = e1[mergeMap]((x) => ColdObservable.from([x]))
        [tap](() => {
          //noop
        })
        [mergeMap]((x) => ColdObservable.from([x]));
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should mirror multiple values and complete', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' --1--2--3--|');
      const e1subs = '  ^----------!';
      const expected = '--1--2--3--|';
      const result = e1[tap](() => {
        //noop
      });
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should mirror multiple values and terminate with error', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' --1--2--3--#');
      const e1subs = '  ^----------!';
      const expected = '--1--2--3--#';
      const result = e1[tap](() => {
        //noop
      });
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
});
