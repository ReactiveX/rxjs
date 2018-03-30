
import { onErrorResumeNext } from 'rxjs';
import { hot, cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';

describe('onErrorResumeNext', () => {
  it('should continue with observables', () => {
    const s1 =   hot('--a--b--#');
    const s2  =  cold(       '--c--d--#');
    const s3  =  cold(               '--e--#');
    const s4  =  cold(                    '--f--g--|');
    const subs1 =    '^       !';
    const subs2 =    '        ^       !';
    const subs3 =    '                ^    !';
    const subs4 =    '                     ^       !';
    const expected = '--a--b----c--d----e----f--g--|';

    expectObservable(onErrorResumeNext(s1, s2, s3, s4)).toBe(expected);
    expectSubscriptions(s1.subscriptions).toBe(subs1);
    expectSubscriptions(s2.subscriptions).toBe(subs2);
    expectSubscriptions(s3.subscriptions).toBe(subs3);
    expectSubscriptions(s4.subscriptions).toBe(subs4);
  });

  it('should continue array of observables', () => {
    const s1 =   hot('--a--b--#');
    const s2  =  cold(       '--c--d--#');
    const s3  =  cold(               '--e--#');
    const s4  =  cold(                    '--f--g--|');
    const subs1 =    '^       !';
    const subs2 =    '        ^       !';
    const subs3 =    '                ^    !';
    const subs4 =    '                     ^       !';
    const expected = '--a--b----c--d----e----f--g--|';

    expectObservable(onErrorResumeNext([s1, s2, s3, s4])).toBe(expected);
    expectSubscriptions(s1.subscriptions).toBe(subs1);
    expectSubscriptions(s2.subscriptions).toBe(subs2);
    expectSubscriptions(s3.subscriptions).toBe(subs3);
    expectSubscriptions(s4.subscriptions).toBe(subs4);
  });

  it('should complete single observable throws', () => {
    const source =   hot('#');
    const subs =         '(^!)';
    const expected =     '|';

    expectObservable(onErrorResumeNext(source)).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });
});
