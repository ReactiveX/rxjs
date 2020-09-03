import { expect } from 'chai';
import { hot, cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';
import { onErrorResumeNext, take, finalize } from 'rxjs/operators';
import { concat, throwError, of, Observable } from 'rxjs';
import { asInteropObservable } from '../helpers/interop-helper';

describe('onErrorResumeNext operator', () => {
  it('should continue observable sequence with next observable', () => {
    const source =  hot('--a--b--#');
    const next   = cold(        '--c--d--|');
    const subs =        '^       !';
    const expected =    '--a--b----c--d--|';

    expectObservable(source.pipe(onErrorResumeNext(next))).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should continue with hot observables', () => {
    const source =  hot('--a--b--#');
    const next   =  hot('-----x----c--d--|');
    const subs =        '^       !';
    const expected =    '--a--b----c--d--|';

    expectObservable(source.pipe(onErrorResumeNext(next))).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should continue with array of multiple observables throw error', () => {
    const source =   hot('--a--b--#');
    const next   = [cold(        '--c--d--#'),
                    cold(                '--e--#'),
                    cold(                     '--f--g--|')];
    const subs =         '^       !';
    const expected =     '--a--b----c--d----e----f--g--|';

    expectObservable(source.pipe(onErrorResumeNext(next))).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should continue with multiple observables throw error', () => {
    const source =   hot('--a--b--#');
    const next1  =  cold(        '--c--d--#');
    const next2  =  cold(                '--e--#');
    const next3  =  cold(                     '--f--g--|');
    const subs =         '^       !';
    const expected =     '--a--b----c--d----e----f--g--|';

    expectObservable(source.pipe(onErrorResumeNext(next1, next2, next3))).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should continue with multiple observables does not throw error', () => {
    const source =   hot('--a--b--|');
    const next1  =  cold(        '--c--d--|');
    const next2  =  cold(                '--e--|');
    const next3  =  cold(                     '--f--g--|');
    const subs =         '^       !';
    const expected =     '--a--b----c--d----e----f--g--|';

    expectObservable(source.pipe(onErrorResumeNext(next1, next2, next3))).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should continue after empty observable', () => {
    const source =   hot('|');
    const next1  =  cold('--c--d--|');
    const next2  =  cold(        '--e--#');
    const next3  =  cold(             '--f--g--|');
    const subs =         '(^!)';
    const expected =     '--c--d----e----f--g--|';

    expectObservable(source.pipe(onErrorResumeNext(next1, next2, next3))).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should not complete with observble does not ends', () => {
    const source =   hot('--a--b--|');
    const next1  =  cold(        '--');
    const subs =         '^       !';
    const expected =     '--a--b----';

    expectObservable(source.pipe(onErrorResumeNext(next1))).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should not continue with observble does not ends', () => {
    const source =   hot('--');
    const next1  =  cold(  '-a--b-');
    const subs =         '^       ';
    const expected =     '-';

    expectObservable(source.pipe(onErrorResumeNext(next1))).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should complete observable with next observable throws', () => {
    const source =  hot('--a--b--#');
    const next   = cold(        '--c--d--#');
    const subs =        '^       !';
    const expected =    '--a--b----c--d--|';

    expectObservable(source.pipe(onErrorResumeNext(next))).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should stop listening to a synchronous observable when unsubscribed', () => {
    const sideEffects: number[] = [];
    const synchronousObservable = new Observable(subscriber => {
      // This will check to see if the subscriber was closed on each loop
      // when the unsubscribe hits (from the `take`), it should be closed
      for (let i = 0; !subscriber.closed && i < 10; i++) {
        sideEffects.push(i);
        subscriber.next(i);
      }
    });

    throwError(new Error('Some error')).pipe(
      onErrorResumeNext(synchronousObservable),
      take(3),
    ).subscribe(() => { /* noop */ });

    expect(sideEffects).to.deep.equal([0, 1, 2]);
  });

  it('should unsubscribe from an interop observble upon explicit unsubscription', () => {
    const source =  hot('--a--b--#');
    const next   = cold(        '--c--d--');
    const nextSubs =    '        ^   !';
    const subs =        '^           !';
    const expected =    '--a--b----c--';

    // This test manipulates the observable to make it look like an interop
    // observable - an observable from a foreign library. Interop subscribers
    // are treated differently: they are wrapped in a safe subscriber. This
    // test ensures that unsubscriptions are chained all the way to the
    // interop subscriber.

    expectObservable(source.pipe(onErrorResumeNext(asInteropObservable(next))), subs).toBe(expected);
    expectSubscriptions(next.subscriptions).toBe(nextSubs);
  });

  it('should work with promise', (done: MochaDone) => {
    const expected = [1, 2];
    const source = concat(of(1), throwError('meh'));

    source.pipe(onErrorResumeNext(Promise.resolve(2)))
      .subscribe(x => {
        expect(expected.shift()).to.equal(x);
      }, () => {
        done(new Error('should not be called'));
      }, () => {
        expect(expected).to.be.empty;
        done();
      });
  });

  it('should skip invalid sources and move on', () => {
    const results: any[] = [];

    of(1).pipe(
      onErrorResumeNext(
        [2, 3, 4],
        { notValid: 'LOL' } as any,
        of(5, 6),
      )
    )
    .subscribe({
      next: value => results.push(value),
      complete: () => results.push('complete')
    });

    expect(results).to.deep.equal([1, 2, 3, 4, 5, 6, 'complete']);
  });

  it('should call finalize after each sync observable', () => {
    let results: any[] = []

    of(1).pipe(
      finalize(() => results.push('finalize 1')),
      onErrorResumeNext(of(2).pipe(
        finalize(() => results.push('finalize 2'))
      ), of(3).pipe(
        finalize(() => results.push('finalize 3'))
      ), of(4).pipe(
        finalize(() => results.push('finalize 4'))
      ))
    ).subscribe({
      next: value => results.push(value),
      complete: () => results.push('complete')
    });

    expect(results).to.deep.equal([
      1, 'finalize 1',
      2, 'finalize 2',
      3, 'finalize 3',
      4, 'finalize 4',
      'complete'
    ]);
  });
});
