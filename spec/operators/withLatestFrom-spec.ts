/** @prettier */
import { expect } from 'chai';
import { lowerCaseO } from '../helpers/test-helper';
import { withLatestFrom, mergeMap, delay } from 'rxjs/operators';
import { of } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {withLatestFrom} */
describe('withLatestFrom', () => {
  let rxTestScheduler: TestScheduler;

  beforeEach(() => {
    rxTestScheduler = new TestScheduler(observableMatcher);
  });

  it('should combine events from cold observables', () => {
    rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e2 = cold(' --1--2-3-4---|   ');
      const e2subs = '  ^------------!   ';
      const e1 = cold(' -a--b-----c-d-e-|');
      const e1subs = '  ^---------------!';
      const expected = '----B-----C-D-E-|';

      const result = e1.pipe(withLatestFrom(e2, (a: string, b: string) => String(a) + String(b)));

      expectObservable(result).toBe(expected, { B: 'b1', C: 'c4', D: 'd4', E: 'e4' });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should merge the value with the latest values from the other observables into arrays', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
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

      const result = e1.pipe(withLatestFrom(e2, e3));

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
      expectSubscriptions(e3.subscriptions).toBe(e3subs);
    });
  });

  it('should merge the value with the latest values from the other observables into arrays and a project argument', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
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
      const project = (a: string, b: string, c: string) => a + b + c;

      const result = e1.pipe(withLatestFrom(e2, e3, project));

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
      expectSubscriptions(e3.subscriptions).toBe(e3subs);
    });
  });

  it('should allow unsubscribing early and explicitly', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
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
      const project = (a: string, b: string, c: string) => a + b + c;

      const result = e1.pipe(withLatestFrom(e2, e3, project));

      expectObservable(result, unsub).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
      expectSubscriptions(e3.subscriptions).toBe(e3subs);
    });
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
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
      const project = (a: string, b: string, c: string) => a + b + c;

      const result = e1.pipe(
        mergeMap((x: string) => of(x)),
        withLatestFrom(e2, e3, project),
        mergeMap((x: string) => of(x))
      );

      expectObservable(result, unsub).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
      expectSubscriptions(e3.subscriptions).toBe(e3subs);
    });
  });

  it('should handle empty', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e2 = hot('  --e--^-f---g---h----|');
      const e2subs = '       (^!)            ';
      const e3 = hot('  --i--^-j---k---l----|');
      const e3subs = '       (^!)            ';
      const e1 = cold('      |               ');
      const e1subs = '       (^!)            ';
      const expected = '     |               '; // empty

      const result = e1.pipe(withLatestFrom(e2, e3));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
      expectSubscriptions(e3.subscriptions).toBe(e3subs);
    });
  });

  it('should handle never', () => {
    rxTestScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e2 = hot('   --e--^-f---g---h----|  ');
      const e2subs = '        ^--------------!  ';
      const e3 = hot('   --i--^-j---k---l----|  ');
      const e3subs = '        ^--------------!  ';
      const e1 = cold('        -                ');
      const e1subs = '         ^----------------';
      const expected = '    --------------------'; // never

      const result = e1.pipe(withLatestFrom(e2, e3));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
      expectSubscriptions(e3.subscriptions).toBe(e3subs);
    });
  });

  it('should handle throw', () => {
    rxTestScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e2 = hot('  --e--^-f---g---h----|');
      const e2subs = '       (^!)            ';
      const e3 = hot('  --i--^-j---k---l----|');
      const e3subs = '       (^!)            ';
      const e1 = cold('      #               ');
      const e1subs = '       (^!)            ';
      const expected = '     #               '; // throw

      const result = e1.pipe(withLatestFrom(e2, e3));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
      expectSubscriptions(e3.subscriptions).toBe(e3subs);
    });
  });

  it('should handle error', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
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

      const result = e1.pipe(withLatestFrom(e2, e3));

      expectObservable(result).toBe(expected, values, new Error('boo-hoo'));
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
      expectSubscriptions(e3.subscriptions).toBe(e3subs);
    });
  });

  it('should handle error with project argument', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
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
      const project = (a: string, b: string, c: string) => a + b + c;

      const result = e1.pipe(withLatestFrom(e2, e3, project));

      expectObservable(result).toBe(expected, values, new Error('boo-hoo'));
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
      expectSubscriptions(e3.subscriptions).toBe(e3subs);
    });
  });

  it('should handle merging with empty', () => {
    rxTestScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e2 = cold('      |                 ');
      const e2subs = '       (^!)              ';
      const e3 = hot('  --i--^-j---k---l------|');
      const e3subs = '       ^-------------!   ';
      const e1 = hot('  --a--^---b---c---d-|   ');
      const e1subs = '       ^-------------!   ';
      const expected = '     --------------|   ';

      const result = e1.pipe(withLatestFrom(e2, e3));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
      expectSubscriptions(e3.subscriptions).toBe(e3subs);
    });
  });

  it('should handle merging with never', () => {
    rxTestScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e2 = cold('      -                 ');
      const e2subs = '       ^-------------!   ';
      const e3 = hot('  --i--^-j---k---l------|');
      const e3subs = '       ^-------------!   ';
      const e1 = hot('  --a--^---b---c---d-|   ');
      const e1subs = '       ^-------------!   ';
      const expected = '     --------------|   ';

      const result = e1.pipe(withLatestFrom(e2, e3));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
      expectSubscriptions(e3.subscriptions).toBe(e3subs);
    });
  });

  it('should handle promises', (done) => {
    of(1)
      .pipe(delay(1), withLatestFrom(Promise.resolve(2), Promise.resolve(3)))
      .subscribe({
        next(x: any) {
          expect(x).to.deep.equal([1, 2, 3]);
        },
        complete: done,
      });
  });

  it('should handle arrays', () => {
    of(1)
      .pipe(delay(1), withLatestFrom([2, 3, 4], [4, 5, 6]))
      .subscribe((x: any) => {
        expect(x).to.deep.equal([1, 4, 6]);
      });
  });

  it('should handle lowercase-o observables', () => {
    of(1)
      .pipe(delay(1), withLatestFrom(lowerCaseO(2, 3, 4), lowerCaseO(4, 5, 6)))
      .subscribe((x: any) => {
        expect(x).to.deep.equal([1, 4, 6]);
      });
  });

  it('should work with synchronous observables', () => {
    const result: Array<Array<number>> = [];
    of(1, 2, 3)
      .pipe(withLatestFrom(of(4, 5)))
      .subscribe((x) => {
        result.push(x);
      });

    expect(result.length).to.equal(3);
    expect(result[0]).to.deep.equal([1, 5]);
    expect(result[1]).to.deep.equal([2, 5]);
    expect(result[2]).to.deep.equal([3, 5]);
  });
});
