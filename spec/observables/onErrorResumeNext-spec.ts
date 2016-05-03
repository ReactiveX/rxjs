import * as Rx from '../../dist/cjs/Rx';
declare const {hot, cold, asDiagram, expectObservable, expectSubscriptions};

const Observable = Rx.Observable;

describe('Observable.onErrorResumeNext', () => {
  it('should continue with observables', () => {
    const source =   hot('--a--b--#');
    const next1  =  cold(        '--c--d--#');
    const next2  =  cold(                '--e--#');
    const next3  =  cold(                     '--f--g--|');
    const subs =         '^                            !';
    const expected =     '--a--b----c--d----e----f--g--|';

    expectObservable(Observable.onErrorResumeNext(source, next1, next2, next3)).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should continue array of observables', () => {
    const source = hot('--a--b--#');
    const next  = [ source,
                   cold(        '--c--d--#'),
                   cold(                '--e--#'),
                   cold(                     '--f--g--|')];
    const subs =        '^                            !';
    const expected =    '--a--b----c--d----e----f--g--|';

    expectObservable(Observable.onErrorResumeNext(next)).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should complete single observable throws', () => {
    const source =   hot('#');
    const subs =         '(^!)';
    const expected =     '|';

    expectObservable(Observable.onErrorResumeNext(source)).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });
});