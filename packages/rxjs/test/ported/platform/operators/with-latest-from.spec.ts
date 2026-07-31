// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/withLatestFrom-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { mergeMap } from 'rxjs/merge-map';
import { withLatestFrom } from 'rxjs/with-latest-from';
describe('withLatestFrom (platform)', () => {
  it('should combine events from cold observables', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e2 = observable(' --1--2-3-4---|   ');
      const e2subs = '  ^------------!   ';
      const e1 = observable(' -a--b-----c-d-e-|');
      const e1subs = '  ^---------------!';
      const expected = '----B-----C-D-E-|';
      const result = e1[withLatestFrom]([e2], (a, b) => String(a) + String(b));
      expectObservable(result).toBe(expected, { B: 'b1', C: 'c4', D: 'd4', E: 'e4' });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should merge the value with the latest values from the other observables into arrays', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e2 = hot('  --e--^-f---g---h------|');
      const e2subs = '       ^-------------!   ';
      const e3 = hot('  --i--^-j---k---l------|');
      const e3subs = '       ^-------------!   ';
      const e1 = hot('  --a--^---b---c---d-|   ');
      const e1subs = '       ^-------------!   ';
      const expected = '     ----x---y---z-|   ';
      const values = {
        x: ['b', 'f', 'j'],
        y: ['c', 'g', 'k'],
        z: ['d', 'h', 'l'],
      };
      const result = e1[withLatestFrom]([e2, e3]);
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
      expectSubscriptions(e3.subscriptions).toBe(e3subs);
    });
  });
  it('should merge the value with the latest values from the other observables into arrays and a project argument', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e2 = hot('  --e--^-f---g---h------|');
      const e2subs = '       ^-------------!   ';
      const e3 = hot('  --i--^-j---k---l------|');
      const e3subs = '       ^-------------!   ';
      const e1 = hot('  --a--^---b---c---d-|   ');
      const e1subs = '       ^-------------!   ';
      const expected = '     ----x---y---z-|   ';
      const values = {
        x: 'bfj',
        y: 'cgk',
        z: 'dhl',
      };
      const project = (a, b, c) => a + b + c;
      const result = e1[withLatestFrom]([e2, e3], project);
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
      expectSubscriptions(e3.subscriptions).toBe(e3subs);
    });
  });
  it('should allow unsubscribing early and explicitly', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e2 = hot('  --e--^-f---g---h------|');
      const e2subs = '       ^----------!      ';
      const e3 = hot('  --i--^-j---k---l------|');
      const e3subs = '       ^----------!      ';
      const e1 = hot('  --a--^---b---c---d-|   ');
      const e1subs = '       ^----------!      ';
      const expected = '     ----x---y---      ';
      const unsub = '        -----------!      ';
      const values = {
        x: 'bfj',
        y: 'cgk',
        z: 'dhl',
      };
      const project = (a, b, c) => a + b + c;
      const result = e1[withLatestFrom]([e2, e3], project);
      expectObservable(result, unsub).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
      expectSubscriptions(e3.subscriptions).toBe(e3subs);
    });
  });
  it('should not break unsubscription chains when result is unsubscribed explicitly', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e2 = hot('  --e--^-f---g---h------|');
      const e2subs = '       ^----------!      ';
      const e3 = hot('  --i--^-j---k---l------|');
      const e3subs = '       ^----------!      ';
      const e1 = hot('  --a--^---b---c---d-|   ');
      const e1subs = '       ^----------!      ';
      const expected = '     ----x---y---      ';
      const unsub = '        -----------!      ';
      const values = {
        x: 'bfj',
        y: 'cgk',
        z: 'dhl',
      };
      const project = (a, b, c) => a + b + c;
      const result = e1[mergeMap]((x) => Observable.from([x]))
        [withLatestFrom]([e2, e3], project)
        [mergeMap]((x) => Observable.from([x]));
      expectObservable(result, unsub).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
      expectSubscriptions(e3.subscriptions).toBe(e3subs);
    });
  });
  it('should handle empty', async () => {
    await rxTest(({ hot, observable, expectObservable, expectSubscriptions }) => {
      const e2 = hot('  --e--^-f---g---h----|');
      const e2subs = '       (^!)            ';
      const e3 = hot('  --i--^-j---k---l----|');
      const e3subs = '       (^!)            ';
      const e1 = observable('      |               ');
      const e1subs = '       (^!)            ';
      const expected = '     |               '; // empty
      const result = e1[withLatestFrom]([e2, e3]);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
      expectSubscriptions(e3.subscriptions).toBe(e3subs);
    });
  });
  it('should handle never', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const e2 = hot('   --e--^-f---g---h----|  ');
      const e2subs = '        ^--------------!  ';
      const e3 = hot('   --i--^-j---k---l----|  ');
      const e3subs = '        ^--------------!  ';
      const e1 = observable('        -                ');
      const e1subs = '^-------------------!';
      const expected = '    --------------------'; // never
      const result = e1[withLatestFrom]([e2, e3]);
      expectObservable(result, '^-------------------!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
      expectSubscriptions(e3.subscriptions).toBe(e3subs);
    });
  });
  it('should handle throw', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const e2 = hot('  --e--^-f---g---h----|');
      const e2subs = '       (^!)            ';
      const e3 = hot('  --i--^-j---k---l----|');
      const e3subs = '       (^!)            ';
      const e1 = observable('      #               ');
      const e1subs = '       (^!)            ';
      const expected = '     #               '; // throw
      const result = e1[withLatestFrom]([e2, e3]);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
      expectSubscriptions(e3.subscriptions).toBe(e3subs);
    });
  });
  it('should handle error', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e2 = hot('  --e--^-f---g---h----|');
      const e2subs = '       ^-------!       ';
      const e3 = hot('  --i--^-j---k---l----|');
      const e3subs = '       ^-------!       ';
      const e1 = hot('  --a--^---b---#       ', undefined, new Error('boo-hoo'));
      const e1subs = '       ^-------!       ';
      const expected = '     ----x---#       '; // throw
      const values = {
        x: ['b', 'f', 'j'],
      };
      const result = e1[withLatestFrom]([e2, e3]);
      expectObservable(result).toBe(expected, values, new Error('boo-hoo'));
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
      expectSubscriptions(e3.subscriptions).toBe(e3subs);
    });
  });
  it('should handle error with project argument', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e2 = hot('  --e--^-f---g---h----|');
      const e2subs = '       ^-------!       ';
      const e3 = hot('  --i--^-j---k---l----|');
      const e3subs = '       ^-------!       ';
      const e1 = hot('  --a--^---b---#       ', undefined, new Error('boo-hoo'));
      const e1subs = '       ^-------!       ';
      const expected = '     ----x---#       '; // throw
      const values = {
        x: 'bfj',
      };
      const project = (a, b, c) => a + b + c;
      const result = e1[withLatestFrom]([e2, e3], project);
      expectObservable(result).toBe(expected, values, new Error('boo-hoo'));
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
      expectSubscriptions(e3.subscriptions).toBe(e3subs);
    });
  });
  it('should handle merging with empty', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const e2 = observable('      |                 ');
      const e2subs = '       (^!)              ';
      const e3 = hot('  --i--^-j---k---l------|');
      const e3subs = '       ^-------------!   ';
      const e1 = hot('  --a--^---b---c---d-|   ');
      const e1subs = '       ^-------------!   ';
      const expected = '     --------------|   ';
      const result = e1[withLatestFrom]([e2, e3]);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
      expectSubscriptions(e3.subscriptions).toBe(e3subs);
    });
  });
  it('should handle merging with never', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const e2 = observable('      -                 ');
      const e2subs = '       ^-------------!   ';
      const e3 = hot('  --i--^-j---k---l------|');
      const e3subs = '       ^-------------!   ';
      const e1 = hot('  --a--^---b---c---d-|   ');
      const e1subs = '       ^-------------!   ';
      const expected = '     --------------|   ';
      const result = e1[withLatestFrom]([e2, e3]);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
      expectSubscriptions(e3.subscriptions).toBe(e3subs);
    });
  });
});
