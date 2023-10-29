/** @prettier */
import { onErrorResumeNext, of } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { expect } from 'chai';
import { TestScheduler } from 'rxjs/testing';
import { observableMatcher } from '../helpers/observableMatcher';

describe('onErrorResumeNext', () => {
  let rxTestScheduler: TestScheduler;

  beforeEach(() => {
    rxTestScheduler = new TestScheduler(observableMatcher);
  });

  it('should continue with observables', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const s1 = hot('  --a--b--#                     ');
      const s2 = cold('         --c--d--#             ');
      const s3 = cold('                 --e--#        ');
      const s4 = cold('                      --f--g--|');
      const subs1 = '   ^-------!                     ';
      const subs2 = '   --------^-------!             ';
      const subs3 = '   ----------------^----!        ';
      const subs4 = '   ---------------------^-------!';
      const expected = '--a--b----c--d----e----f--g--|';

      expectObservable(onErrorResumeNext(s1, s2, s3, s4)).toBe(expected);
      expectSubscriptions(s1.subscriptions).toBe(subs1);
      expectSubscriptions(s2.subscriptions).toBe(subs2);
      expectSubscriptions(s3.subscriptions).toBe(subs3);
      expectSubscriptions(s4.subscriptions).toBe(subs4);
    });
  });

  it('should continue array of observables', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const s1 = hot('  --a--b--#                     ');
      const s2 = cold('         --c--d--#             ');
      const s3 = cold('                 --e--#        ');
      const s4 = cold('                      --f--g--|');
      const subs1 = '   ^-------!                     ';
      const subs2 = '   --------^-------!             ';
      const subs3 = '   ----------------^----!        ';
      const subs4 = '   ---------------------^-------!';
      const expected = '--a--b----c--d----e----f--g--|';

      expectObservable(onErrorResumeNext([s1, s2, s3, s4])).toBe(expected);
      expectSubscriptions(s1.subscriptions).toBe(subs1);
      expectSubscriptions(s2.subscriptions).toBe(subs2);
      expectSubscriptions(s3.subscriptions).toBe(subs3);
      expectSubscriptions(s4.subscriptions).toBe(subs4);
    });
  });

  it('should complete single observable throws', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('#   ');
      const subs = '      (^!)';
      const expected = '  |   ';

      expectObservable(onErrorResumeNext(source)).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });

  it('should skip invalid sources and move on', () => {
    const results: any[] = [];

    onErrorResumeNext(of(1), [2, 3, 4], { notValid: 'LOL' } as any, of(5, 6)).subscribe({
      next: (value) => results.push(value),
      complete: () => results.push('complete'),
    });

    expect(results).to.deep.equal([1, 2, 3, 4, 5, 6, 'complete']);
  });

  it('should call finalize after each sync observable', () => {
    const results: any[] = [];

    onErrorResumeNext(
      of(1).pipe(finalize(() => results.push('finalize 1'))),
      of(2).pipe(finalize(() => results.push('finalize 2'))),
      of(3).pipe(finalize(() => results.push('finalize 3'))),
      of(4).pipe(finalize(() => results.push('finalize 4')))
    ).subscribe({
      next: (value) => results.push(value),
      complete: () => results.push('complete'),
    });

    expect(results).to.deep.equal([1, 'finalize 1', 2, 'finalize 2', 3, 'finalize 3', 4, 'finalize 4', 'complete']);
  });
});
