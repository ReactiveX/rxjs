// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/isEmpty-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { ColdObservable } from 'rxjs/cold-observable';
import { isEmpty } from 'rxjs/is-empty';
import { mergeMap } from 'rxjs/merge-map';
describe('isEmpty (cold)', () => {
  it('should return true if source is empty', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -----|   ');
      const e1subs = '  ^----!   ';
      const expected = '-----(T|)';
      expectObservable(e1[isEmpty]()).toBe(expected, { T: true });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should return false if source emits element', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^--b--|');
      const e1subs = '     ^--!   ';
      const expected = '   ---(F|)';
      expectObservable(e1[isEmpty]()).toBe(expected, { F: false });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should raise error if source raises error', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --#');
      const e1subs = '  ^-!';
      const expected = '--#';
      expectObservable(e1[isEmpty]()).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not complete if source never emits', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' -');
      const e1subs = '^!';
      const expected = '-';
      expectObservable(e1[isEmpty](), '^!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should return true if source is empty', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' |   ');
      const e1subs = '  (^!)';
      const expected = '(T|)';
      expectObservable(e1[isEmpty]()).toBe(expected, { T: true });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should allow unsubscribing explicitly and early', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' -----------a--b--|');
      const e1subs = '  ^-----!           ';
      const expected = '-------           ';
      const unsub = '   ------!           ';
      expectObservable(e1[isEmpty](), unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not break unsubscription chains when result is unsubscribed explicitly', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' -----------a--b--|');
      const e1subs = '  ^-----!           ';
      const expected = '-------           ';
      const unsub = '   ------!           ';
      const result = e1[mergeMap]((x) => ColdObservable.from([x]))
        [isEmpty]()
        [mergeMap]((x) => ColdObservable.from([x]));
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
});
