import { expect } from 'chai';
import * as Rx from '../../dist/package/Rx';
import marbleTestingSignature = require('../helpers/marble-testing'); // tslint:disable-line:no-require-imports

declare const { asDiagram };
declare const hot: typeof marbleTestingSignature.hot;
declare const cold: typeof marbleTestingSignature.cold;
declare const expectObservable: typeof marbleTestingSignature.expectObservable;
declare const expectSubscriptions: typeof marbleTestingSignature.expectSubscriptions;

const Observable = Rx.Observable;

describe('Observable.prototype.onErrorResumeNext', () => {
  asDiagram('onErrorResumeNext')('should continue observable sequence with next observable', () => {
    const source =  hot('--a--b--#');
    const next   = cold(        '--c--d--|');
    const subs =        '^               !';
    const expected =    '--a--b----c--d--|';

    expectObservable(source.onErrorResumeNext(next)).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should continue with hot observables', () => {
    const source =  hot('--a--b--#');
    const next   =  hot('-----x----c--d--|');
    const subs =        '^               !';
    const expected =    '--a--b----c--d--|';

    expectObservable(source.onErrorResumeNext(next)).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should continue with array of multiple observables throw error', () => {
    const source =   hot('--a--b--#');
    const next   = [cold(        '--c--d--#'),
                    cold(                '--e--#'),
                    cold(                     '--f--g--|')];
    const subs =         '^                            !';
    const expected =     '--a--b----c--d----e----f--g--|';

    expectObservable(source.onErrorResumeNext(next)).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should continue with multiple observables throw error', () => {
    const source =   hot('--a--b--#');
    const next1  =  cold(        '--c--d--#');
    const next2  =  cold(                '--e--#');
    const next3  =  cold(                     '--f--g--|');
    const subs =         '^                            !';
    const expected =     '--a--b----c--d----e----f--g--|';

    expectObservable(source.onErrorResumeNext(next1, next2, next3)).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should continue with multiple observables does not throw error', () => {
    const source =   hot('--a--b--|');
    const next1  =  cold(        '--c--d--|');
    const next2  =  cold(                '--e--|');
    const next3  =  cold(                     '--f--g--|');
    const subs =         '^                            !';
    const expected =     '--a--b----c--d----e----f--g--|';

    expectObservable(source.onErrorResumeNext(next1, next2, next3)).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should continue after empty observable', () => {
    const source =   hot('|');
    const next1  =  cold('--c--d--|');
    const next2  =  cold(        '--e--#');
    const next3  =  cold(             '--f--g--|');
    const subs =         '^                    !';
    const expected =     '--c--d----e----f--g--|';

    expectObservable(source.onErrorResumeNext(next1, next2, next3)).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should not complete with observble does not ends', () => {
    const source =   hot('--a--b--|');
    const next1  =  cold(        '--');
    const subs =         '^         ';
    const expected =     '--a--b----';

    expectObservable(source.onErrorResumeNext(next1)).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should not continue with observble does not ends', () => {
    const source =   hot('--');
    const next1  =  cold(  '-a--b-');
    const subs =         '^       ';
    const expected =     '-';

    expectObservable(source.onErrorResumeNext(next1)).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should complete observable with next observable throws', () => {
    const source =  hot('--a--b--#');
    const next   = cold(        '--c--d--#');
    const subs =        '^               !';
    const expected =    '--a--b----c--d--|';

    expectObservable(source.onErrorResumeNext(next)).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should work with promise', (done: MochaDone) => {
    const expected = [1, 2];
    const source = Observable.concat(Observable.of(1), Observable.throw('meh'));

    source.onErrorResumeNext(Promise.resolve(2))
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
