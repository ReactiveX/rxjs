/** @prettier */
import { expect } from 'chai';
import { skipWhile, mergeMap, tap, take } from 'rxjs/operators';
import { of, Observable } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {skipWhile} */
describe('skipWhile', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(observableMatcher);
  });

  it('should skip all elements until predicate is false', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('-1-^2--3--4--5--6--|');
      const sourceSubs = '   ^---------------!';
      const expected = '     -------4--5--6--|';

      const predicate = function (v: string) {
        return +v < 4;
      };

      const result = source.pipe(skipWhile(predicate));

      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });

  it('should skip all elements with a true predicate', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('-1-^2--3--4--5--6--|');
      const sourceSubs = '   ^---------------!';
      const expected = '     ----------------|';

      const result = source.pipe(skipWhile(() => true));

      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });

  it('should skip all elements with a truthy predicate', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('-1-^2--3--4--5--6--|');
      const sourceSubs = '   ^---------------!';
      const expected = '     ----------------|';

      const result = source.pipe(
        skipWhile((): any => {
          return {};
        })
      );

      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });

  it('should not skip any element with a false predicate', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('-1-^2--3--4--5--6--|');
      const sourceSubs = '   ^---------------!';
      const expected = '     -2--3--4--5--6--|';

      const result = source.pipe(skipWhile(() => false));

      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });

  it('should not skip any elements with a falsy predicate', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('-1-^2--3--4--5--6--|');
      const sourceSubs = '   ^---------------!';
      const expected = '     -2--3--4--5--6--|';

      const result = source.pipe(skipWhile(() => undefined as any));

      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });

  it('should skip elements on hot source', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('--1--2-^-3--4--5--6--7--8--');
      const sourceSubs = '       ^-------------------';
      const expected = '         --------5--6--7--8--';

      const predicate = function (v: string) {
        return +v < 5;
      };

      const result = source.pipe(skipWhile(predicate));

      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });

  it("should be possible to skip using the element's index", () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('--a--b-^-c--d--e--f--g--h--|');
      const sourceSubs = '       ^-------------------!';
      const expected = '         --------e--f--g--h--|';

      const predicate = function (_v: string, index: number) {
        return index < 2;
      };

      const result = source.pipe(skipWhile(predicate));

      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });

  it('should skip using index with source unsubscribes early', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('--a--b-^-c--d--e--f--g--h--|');
      const sourceSubs = '       ^----------!         ';
      const unsub = '            -----------!         ';
      const expected = '         -----d--e---         ';

      const predicate = function (_v: string, index: number) {
        return index < 1;
      };

      const result = source.pipe(skipWhile(predicate));

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('--a--b-^-c--d--e--f--g--h--|');
      const sourceSubs = '       ^----------!         ';
      const expected = '         -----d--e---         ';
      const unsub = '            -----------!         ';

      const predicate = function (_v: string, index: number) {
        return index < 1;
      };

      const result = source.pipe(
        mergeMap(function (x) {
          return of(x);
        }),
        skipWhile(predicate),
        mergeMap(function (x) {
          return of(x);
        })
      );

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });

  it('should skip using value with source throws', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('--a--b-^-c--d--e--f--g--h--#');
      const sourceSubs = '       ^-------------------!';
      const expected = '         -----d--e--f--g--h--#';

      const predicate = function (v: string) {
        return v !== 'd';
      };

      const result = source.pipe(skipWhile(predicate));

      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });

  it('should invoke predicate while its false and never again', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('--a--b-^-c--d--e--f--g--h--|');
      const sourceSubs = '       ^-------------------!';
      const expected = '         --------e--f--g--h--|';

      let invoked = 0;
      const predicate = function (v: string) {
        invoked++;
        return v !== 'e';
      };

      const result = source.pipe(
        skipWhile(predicate),
        tap({
          complete() {
            expect(invoked).to.equal(3);
          },
        })
      );

      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });

  it('should handle predicate that throws', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('--a--b-^-c--d--e--f--g--h--|');
      const sourceSubs = '       ^-------!            ';
      const expected = '         --------#            ';

      const predicate = function (v: string) {
        if (v === 'e') {
          throw new Error("nom d'une pipe !");
        }

        return v !== 'f';
      };

      const result = source.pipe(skipWhile(predicate));

      expectObservable(result).toBe(expected, undefined, new Error("nom d'une pipe !"));
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });

  it('should handle Observable.empty', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('|   ');
      const subs = '       (^!)';
      const expected = '   |   ';

      const result = source.pipe(skipWhile(() => true));

      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });

  it('should handle Observable.never', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('-');
      const subs = '       ^';
      const expected = '   -';

      const result = source.pipe(skipWhile(() => true));

      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });

  it('should handle Observable.throw', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('#   ');
      const subs = '       (^!)';
      const expected = '   #   ';

      const result = source.pipe(skipWhile(() => true));

      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });

  it('should stop listening to a synchronous observable when unsubscribed', () => {
    const sideEffects: number[] = [];
    const synchronousObservable = new Observable<number>((subscriber) => {
      // This will check to see if the subscriber was closed on each loop
      // when the unsubscribe hits (from the `take`), it should be closed
      for (let i = 0; !subscriber.closed && i < 10; i++) {
        sideEffects.push(i);
        subscriber.next(i);
      }
    });

    synchronousObservable
      .pipe(
        skipWhile((value) => value < 2),
        take(1)
      )
      .subscribe(() => {
        /* noop */
      });

    expect(sideEffects).to.deep.equal([0, 1, 2]);
  });
});
