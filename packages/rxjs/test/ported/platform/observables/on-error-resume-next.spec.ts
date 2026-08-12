// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/observables/onErrorResumeNext-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { onErrorResumeNext } from 'rxjs/on-error-resume-next';
describe('onErrorResumeNext (platform)', () => {
  it('should continue with observables', async () => {
    await rxTest(({ hot, observable, expectObservable, expectSubscriptions }) => {
      const s1 = hot('  --a--b--#                     ');
      const s2 = observable('         --c--d--#             ');
      const s3 = observable('                 --e--#        ');
      const s4 = observable('                      --f--g--|');
      const subs1 = '   ^-------!                     ';
      const subs2 = '   --------^-------!             ';
      const subs3 = '   ----------------^----!        ';
      const subs4 = '   ---------------------^-------!';
      const expected = '--a--b----c--d----e----f--g--|';
      expectObservable(Observable[onErrorResumeNext]([s1, s2, s3, s4])).toBe(expected);
      expectSubscriptions(s1.subscriptions).toBe(subs1);
      expectSubscriptions(s2.subscriptions).toBe(subs2);
      expectSubscriptions(s3.subscriptions).toBe(subs3);
      expectSubscriptions(s4.subscriptions).toBe(subs4);
    });
  });
  it('should continue array of observables', async () => {
    await rxTest(({ hot, observable, expectObservable, expectSubscriptions }) => {
      const s1 = hot('  --a--b--#                     ');
      const s2 = observable('         --c--d--#             ');
      const s3 = observable('                 --e--#        ');
      const s4 = observable('                      --f--g--|');
      const subs1 = '   ^-------!                     ';
      const subs2 = '   --------^-------!             ';
      const subs3 = '   ----------------^----!        ';
      const subs4 = '   ---------------------^-------!';
      const expected = '--a--b----c--d----e----f--g--|';
      expectObservable(Observable[onErrorResumeNext]([s1, s2, s3, s4])).toBe(expected);
      expectSubscriptions(s1.subscriptions).toBe(subs1);
      expectSubscriptions(s2.subscriptions).toBe(subs2);
      expectSubscriptions(s3.subscriptions).toBe(subs3);
      expectSubscriptions(s4.subscriptions).toBe(subs4);
    });
  });
  it('should complete single observable throws', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('#   ');
      const subs = '      (^!)';
      const expected = '  |   ';
      expectObservable(Observable[onErrorResumeNext]([source])).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
});
