import { expect } from 'chai';
import { hot, cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';
import { onErrorResumeNext, takeWhile } from 'rxjs/operators';
import { concat, defer, throwError, of } from 'rxjs';

declare function asDiagram(arg: string): Function;

describe('onErrorResumeNext operator', () => {
  asDiagram('onErrorResumeNext')('should continue observable sequence with next observable', () => {
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
    const synchronousObservable = concat(
      defer(() => {
        sideEffects.push(1);
        return of(1);
      }),
      defer(() => {
        sideEffects.push(2);
        return of(2);
      }),
      defer(() => {
        sideEffects.push(3);
        return of(3);
      })
    );

    throwError(new Error('Some error')).pipe(
      onErrorResumeNext(synchronousObservable),
      takeWhile((x) => x != 2) // unsubscribe at the second side-effect
    ).subscribe(() => { /* noop */ });

    expect(sideEffects).to.deep.equal([1, 2]);
  });

  it('should work with promise', (done: MochaDone) => {
    const expected = [1, 2];
    const source = concat(of(1), throwError('meh'));

    source.pipe(onErrorResumeNext(Promise.resolve(2)))
      .subscribe(x => {
        expect(expected.shift()).to.equal(x);
      }, (err: any) => {
        done(new Error('should not be called'));
      }, () => {
        expect(expected).to.be.empty;
        done();
      });
  });
});
