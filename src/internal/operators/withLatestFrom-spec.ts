import { expect } from 'chai';
import { withLatestFrom, mergeMap, delay } from 'rxjs/operators';
import { of } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { assertDeepEquals } from 'rxjs/internal/test_helpers/assertDeepEquals';
import { lowerCaseO } from 'rxjs/internal/test_helpers/lowerCaseO';

/** @test {withLatestFrom} */
describe('withLatestFrom operator', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(assertDeepEquals);
  });

  //asDiagram('withLatestFrom')
  it('should combine events from cold observables', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =  cold('-a--b-----c-d-e-|');
      const e2 =  cold('--1--2-3-4---|   ');
      const expected = '----B-----C-D-E-|';

      const result = e1.pipe(withLatestFrom(e2));

      expectObservable(result).toBe(expected, { B: ['b', '1'], C: ['c', '4'], D: ['d', '4'], E: ['e', '4'] });
    });
  });

  it('should merge the value with the latest values from the other observables into arrays', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('--a--^---b---c---d-|');
      const e1subs =        '^             !';
      const e2 =   hot('--e--^-f---g---h------|');
      const e2subs =        '^             !';
      const e3 =   hot('--i--^-j---k---l------|');
      const e3subs =        '^             !';
      const expected =      '----x---y---z-|';
      const values = {
        x: ['b', 'f', 'j'],
        y: ['c', 'g', 'k'],
        z: ['d', 'h', 'l']
      };

      const result = e1.pipe(withLatestFrom(e2, e3));

      expectObservable(result).toBe(expected, values);
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
      expectSubscriptionsTo(e3).toBe(e3subs);
    });
  });

  it('should allow unsubscribing early and explicitly', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('--a--^---b---c---d-|');
      const e1subs =        '^          !   ';
      const e2 =   hot('--e--^-f---g---h------|');
      const e2subs =        '^          !   ';
      const e3 =   hot('--i--^-j---k---l------|');
      const e3subs =        '^          !   ';
      const expected =      '----x---y---   ';
      const unsub =         '           !   ';
      const values = {
        x: ['b', 'f', 'j'],
        y: ['c', 'g', 'k'],
        z: ['d', 'h', 'l']
      };

      const result = e1.pipe(withLatestFrom(e2, e3));

      expectObservable(result, unsub).toBe(expected, values);
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
      expectSubscriptionsTo(e3).toBe(e3subs);
    });
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('--a--^---b---c---d-|');
      const e1subs =        '^          !   ';
      const e2 =   hot('--e--^-f---g---h------|');
      const e2subs =        '^          !   ';
      const e3 =   hot('--i--^-j---k---l------|');
      const e3subs =        '^          !   ';
      const expected =      '----x---y---   ';
      const unsub =         '           !   ';
      const values = {
        x: ['b', 'f', 'j'],
        y: ['c', 'g', 'k'],
        z: ['d', 'h', 'l']
      };

      const result = e1.pipe(
        mergeMap((x: string) => of(x)),
        withLatestFrom(e2, e3),
        mergeMap((x: string) => of(x))
      );

      expectObservable(result, unsub).toBe(expected, values);
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
      expectSubscriptionsTo(e3).toBe(e3subs);
    });
  });

  it('should handle empty', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   cold(    '|');
      const e1subs =        '(^!)';
      const e2 =   hot('--e--^-f---g---h----|');
      const e2subs =        '(^!)';
      const e3 =   hot('--i--^-j---k---l----|');
      const e3subs =        '(^!)';
      const expected =      '|'; // empty

      const result = e1.pipe(withLatestFrom(e2, e3));

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
      expectSubscriptionsTo(e3).toBe(e3subs);
    });
  });

  it('should handle never', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   cold('-');
      const e1subs =        '^               ';
      const e2 =   hot('--e--^-f---g---h----|');
      const e2subs =        '^              !';
      const e3 =   hot('--i--^-j---k---l----|');
      const e3subs =        '^              !';
      const expected =      '--------------------'; // never

      const result = e1.pipe(withLatestFrom(e2, e3));

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
      expectSubscriptionsTo(e3).toBe(e3subs);
    });
  });

  it('should handle throw', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   cold('#');
      const e1subs =        '(^!)';
      const e2 =   hot('--e--^-f---g---h----|');
      const e2subs =        '(^!)';
      const e3 =   hot('--i--^-j---k---l----|');
      const e3subs =        '(^!)';
      const expected =      '#'; // throw

      const result = e1.pipe(withLatestFrom(e2, e3));

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
      expectSubscriptionsTo(e3).toBe(e3subs);
    });
  });

  it('should handle error', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('--a--^---b---#', undefined, 'boo-hoo');
      const e1subs =        '^       !';
      const e2 =   hot('--e--^-f---g---h----|');
      const e2subs =        '^       !';
      const e3 =   hot('--i--^-j---k---l----|');
      const e3subs =        '^       !';
      const expected =      '----x---#'; // throw
      const values = {
        x: ['b', 'f', 'j']
      };

      const result = e1.pipe(withLatestFrom(e2, e3));

      expectObservable(result).toBe(expected, values, 'boo-hoo');
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
      expectSubscriptionsTo(e3).toBe(e3subs);
    });
  });

  it('should handle merging with empty', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('--a--^---b---c---d-|   ');
      const e1subs =        '^             !   ';
      const e2 =   cold(    '|'                 );
      const e2subs =        '(^!)';
      const e3 =   hot('--i--^-j---k---l------|');
      const e3subs =        '^             !   ';
      const expected =      '--------------|   ';

      const result = e1.pipe(withLatestFrom(e2, e3));

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
      expectSubscriptionsTo(e3).toBe(e3subs);
    });
  });

  it('should handle merging with never', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('--a--^---b---c---d-|   ');
      const e1subs =        '^             !   ';
      const e2 =   cold(    '-'                 );
      const e2subs =        '^             !   ';
      const e3 =   hot('--i--^-j---k---l------|');
      const e3subs =        '^             !   ';
      const expected =      '--------------|   ';

      const result = e1.pipe(withLatestFrom(e2, e3));

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
      expectSubscriptionsTo(e3).toBe(e3subs);
    });
  });

  it('should handle promises', (done: MochaDone) => {
    of(1).pipe(delay(1), withLatestFrom(Promise.resolve(2), Promise.resolve(3)))
      .subscribe((x: any) => {
        expect(x).to.deep.equal([1, 2, 3]);
      }, null, done);
  });

  it('should handle arrays', () => {
    of(1).pipe(delay(1), withLatestFrom([2, 3, 4], [4, 5, 6]))
      .subscribe((x: any) => {
        expect(x).to.deep.equal([1, 4, 6]);
      });
  });

  it('should handle lowercase-o observables', () => {
    of(1).pipe(delay(1), withLatestFrom(lowerCaseO(2, 3, 4), lowerCaseO(4, 5, 6)))
      .subscribe((x: any) => {
        expect(x).to.deep.equal([1, 4, 6]);
      });
  });
});
