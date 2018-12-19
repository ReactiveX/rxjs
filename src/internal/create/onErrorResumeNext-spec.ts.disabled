import { onErrorResumeNext } from 'rxjs';
import { TestScheduler } from '../testing/TestScheduler';
import { assertDeepEquals } from '../test_helpers/assertDeepEquals';

describe('onErrorResumeNext', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(assertDeepEquals);
  });

  it('should continue with observables', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
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
      expectSubscriptionsTo(s1).toBe(subs1);
      expectSubscriptionsTo(s2).toBe(subs2);
      expectSubscriptionsTo(s3).toBe(subs3);
      expectSubscriptionsTo(s4).toBe(subs4);
    });
  });

  it('should continue array of observables', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
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
      expectSubscriptionsTo(s1).toBe(subs1);
      expectSubscriptionsTo(s2).toBe(subs2);
      expectSubscriptionsTo(s3).toBe(subs3);
      expectSubscriptionsTo(s4).toBe(subs4);
    });
  });

  it('should complete single observable throws', () => {
      testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const source =   hot('#');
      const subs =         '(^!)';
      const expected =     '|';

      expectObservable(onErrorResumeNext(source)).toBe(expected);
      expectSubscriptionsTo(source).toBe(subs);
    });
  });
});
