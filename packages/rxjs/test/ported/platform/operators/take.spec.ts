// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/take-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { merge } from 'rxjs/merge';
import { mergeMap } from 'rxjs/merge-map';
import { Subject } from 'rxjs/subject';
import { take } from 'rxjs/take';
import { tap } from 'rxjs/tap';
describe('take (platform)', () => {
  it('should take two values of an observable with many values', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' --a-----b----c---d--|');
      const e1subs = '  ^-------!------------';
      const expected = '--a-----(b|)         ';
      expectObservable(e1[take](2)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should work with empty', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' |');
      const e1subs = '  (^!)';
      const expected = '|';
      expectObservable(e1[take](42)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should go on forever on never', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' -');
      const e1subs = '^!';
      const expected = '-';
      expectObservable(e1[take](42), '^!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should be empty on take(0)', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^--b----c---d--|');
      const e1subs = []; // Don't subscribe at all
      const expected = '   |';
      expectObservable(e1[take](0)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should be empty if provided with negative value', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' --a-----b----c---d--|');
      const expected = '|';
      const e1subs = []; // Don't subscribe at all
      expectObservable(e1[take](-42)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should take one value of an observable with one value', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ---(a|)');
      const e1subs = '  ^--!---';
      const expected = '---(a|)';
      expectObservable(e1[take](1)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should take one values of an observable with many values', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^--b----c---d--|');
      const e1subs = '     ^--!------------';
      const expected = '   ---(b|)         ';
      expectObservable(e1[take](1)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should error on empty', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^----|');
      const e1subs = '     ^----!';
      const expected = '   -----|';
      expectObservable(e1[take](42)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should propagate error from the source observable', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('---^---#', undefined, 'too bad');
      const e1subs = '   ^---!';
      const expected = ' ----#';
      expectObservable(e1[take](42)).toBe(expected, null, 'too bad');
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should propagate error from an observable with values', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('---^--a--b--#');
      const e1subs = '   ^--------!';
      const expected = ' ---a--b--#';
      expectObservable(e1[take](42)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should allow unsubscribing explicitly and early', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('---^--a--b-----c--d--e--|');
      const unsub = '    ---------!------------';
      const e1subs = '   ^--------!------------';
      const expected = ' ---a--b---            ';
      expectObservable(e1[take](42), unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should work with throw', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' #');
      const e1subs = '  (^!)';
      const expected = '#';
      expectObservable(e1[take](42)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not break unsubscription chain when unsubscribed explicitly', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('---^--a--b-----c--d--e--|');
      const unsub = '    ---------!            ';
      const e1subs = '   ^--------!            ';
      const expected = ' ---a--b---            ';
      const result = e1[mergeMap]((x) => Observable.from([x]))
        [take](42)
        [mergeMap]((x) => Observable.from([x]));
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should complete even if the parameter is a string', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' --a-----b----c---d--|');
      const e1subs = '  ^-------!------------';
      const expected = '--a-----(b|)         ';
      expectObservable(e1[take]('2')).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should unsubscribe from the source when it reaches the limit before a recursive synchronous upstream error is notified', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const subject = new Subject();
      const e1 = observable(' (a|)');
      const e1subs = '  (^!)';
      const expected = '(a|)';
      const result = Observable[merge]([e1, subject])
        [take](1)
        [tap](() => subject.error('error'));
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
});
