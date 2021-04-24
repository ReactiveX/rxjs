/** @prettier */
import { expect } from 'chai';
import { TestScheduler } from 'rxjs/testing';
import { mergeMapTo, map, take } from 'rxjs/operators';
import { from, of, Observable } from 'rxjs';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {mergeMapTo} */
describe('mergeMapTo', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(observableMatcher);
  });

  it('should map-and-flatten each item to an Observable', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const x = cold('    x-x-x|            ');
      //                        x-x-x|
      //                           x-x-x|
      // prettier-ignore
      const xsubs = [
        '               --^----!            ',
        '               --------^----!      ',
        '               -----------^----!   ',
      ];
      const e1 = hot('  --1-----3--5-------|');
      const e1subs = '  ^------------------!';
      const expected = '--x-x-x-x-xxxx-x---|';

      const result = e1.pipe(mergeMapTo(x));

      expectObservable(result).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should support the deprecated resultSelector', () => {
    const results: Array<number[]> = [];

    of(1, 2, 3)
      .pipe(mergeMapTo(of(4, 5, 6), (a, b, i, ii) => [a, b, i, ii]))
      .subscribe({
        next(value) {
          results.push(value);
        },
        error(err) {
          throw err;
        },
        complete() {
          expect(results).to.deep.equal([
            [1, 4, 0, 0],
            [1, 5, 0, 1],
            [1, 6, 0, 2],
            [2, 4, 1, 0],
            [2, 5, 1, 1],
            [2, 6, 1, 2],
            [3, 4, 2, 0],
            [3, 5, 2, 1],
            [3, 6, 2, 2],
          ]);
        },
      });
  });

  it('should support a void resultSelector (still deprecated)', () => {
    const results: number[] = [];

    of(1, 2, 3)
      .pipe(mergeMapTo(of(4, 5, 6), void 0))
      .subscribe({
        next(value) {
          results.push(value);
        },
        error(err) {
          throw err;
        },
        complete() {
          expect(results).to.deep.equal([4, 5, 6, 4, 5, 6, 4, 5, 6]);
        },
      });
  });

  it('should mergeMapTo many regular interval inners', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const x = cold('  ----1---2---3---(4|)                        ');
      //                    ----1---2---3---(4|)
      //                                ----1---2---3---(4|)
      //                                        ----1---2---3---(4|)
      const xsubs = [
        '               ^---------------!                           ',
        '               ----^---------------!                       ',
        '               ----------------^---------------!           ',
        '               ------------------------^---------------!   ',
      ];
      const e1 = hot('  a---b-----------c-------d-------|           ');
      const e1subs = '  ^-------------------------------!           ';
      const expected = '----1---(21)(32)(43)(41)2---(31)(42)3---(4|)';

      const result = e1.pipe(mergeMapTo(x));

      expectObservable(result).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should map values to constant resolved promises and merge', (done) => {
    const source = from([4, 3, 2, 1]);

    const results: number[] = [];
    source.pipe(mergeMapTo(from(Promise.resolve(42)))).subscribe(
      (x) => {
        results.push(x);
      },
      () => {
        done(new Error('Subscriber error handler not supposed to be called.'));
      },
      () => {
        expect(results).to.deep.equal([42, 42, 42, 42]);
        done();
      }
    );
  });

  it('should map values to constant rejected promises and merge', (done) => {
    const source = from([4, 3, 2, 1]);

    source.pipe(mergeMapTo(from(Promise.reject(42)))).subscribe(
      () => {
        done(new Error('Subscriber next handler not supposed to be called.'));
      },
      (err) => {
        expect(err).to.equal(42);
        done();
      },
      () => {
        done(new Error('Subscriber complete handler not supposed to be called.'));
      }
    );
  });

  it('should mergeMapTo many outer values to many inner values', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const x = cold('   ----i---j---k---l---|                        ');
      //                         ----i---j---k---l---|
      //                                 ----i---j---k---l---|
      //                                         ----i---j---k---l---|
      const xsubs = [
        '               -^-------------------!                        ',
        '               ---------^-------------------!                ',
        '               -----------------^-------------------!        ',
        '               -------------------------^-------------------!',
      ];
      const e1 = hot('  -a-------b-------c-------d-------|            ');
      const e1subs = '  ^--------------------------------!            ';
      const expected = '-----i---j---(ki)(lj)(ki)(lj)(ki)(lj)k---l---|';

      expectObservable(e1.pipe(mergeMapTo(x))).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should mergeMapTo many outer to many inner, complete late', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const x = cold('   ----i---j---k---l---|                            ');
      //                         ----i---j---k---l---|
      //                                 ----i---j---k---l---|
      //                                         ----i---j---k---l---|
      const xsubs = [
        '               -^-------------------!                            ',
        '               ---------^-------------------!                    ',
        '               -----------------^-------------------!            ',
        '               -------------------------^-------------------!    ',
      ];
      const e1 = hot('  -a-------b-------c-------d-----------------------|');
      const e1subs = '  ^------------------------------------------------!';
      const expected = '-----i---j---(ki)(lj)(ki)(lj)(ki)(lj)k---l-------|';

      expectObservable(e1.pipe(mergeMapTo(x))).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should mergeMapTo many outer to many inner, outer never completes', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const x = cold('   ----i---j---k---l---|                                  ');
      //                         ----i---j---k---l---|
      //                                 ----i---j---k---l---|
      //                                         ----i---j---k---l---|
      //                                                 ----i---j---k---l---|
      //                                                                 ----i--
      const xsubs = [
        '               -^-------------------!                                  ',
        '               ---------^-------------------!                          ',
        '               -----------------^-------------------!                  ',
        '               -------------------------^-------------------!          ',
        '               ---------------------------------^-------------------!  ',
        '               -------------------------------------------------^-----!',
      ];
      const e1 = hot('  -a-------b-------c-------d-------e---------------f------');
      const e1subs = '  ^------------------------------------------------------!';
      const expected = '-----i---j---(ki)(lj)(ki)(lj)(ki)(lj)(ki)(lj)k---l---i-';
      const unsub = '   -------------------------------------------------------!';

      const result = e1.pipe(mergeMapTo(x));

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const x = cold('   ----i---j---k---l---|                                  ');
      //                         ----i---j---k---l---|
      //                                 ----i---j---k---l---|
      //                                         ----i---j---k---l---|
      //                                                 ----i---j---k---l---|
      //                                                                 ----i--
      const xsubs = [
        '               -^-------------------!                                  ',
        '               ---------^-------------------!                          ',
        '               -----------------^-------------------!                  ',
        '               -------------------------^-------------------!          ',
        '               ---------------------------------^-------------------!  ',
        '               -------------------------------------------------^-----!',
      ];
      const e1 = hot('  -a-------b-------c-------d-------e---------------f------');
      const e1subs = '  ^------------------------------------------------------!';
      const expected = '-----i---j---(ki)(lj)(ki)(lj)(ki)(lj)(ki)(lj)k---l---i-';
      const unsub = '   -------------------------------------------------------!';

      const result = e1.pipe(
        map((x) => x),
        mergeMapTo(x),
        map((x) => x)
      );

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should mergeMapTo many outer to many inner, inner never completes', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const x = cold('   ----i---j---k---l-                        ');
      //                         ----i---j---k---l-
      //                                 ----i---j---k---l-
      //                                         ----i---j---k---l-
      const xsubs = [
        '               -^-----------------------------------------',
        '               ---------^---------------------------------',
        '               -----------------^-------------------------',
        '               -------------------------^-----------------',
      ];
      const e1 = hot('  -a-------b-------c-------d-------|         ');
      const e1subs = '  ^--------------------------------!         ';
      const expected = '-----i---j---(ki)(lj)(ki)(lj)(ki)(lj)k---l-';

      expectObservable(e1.pipe(mergeMapTo(x))).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should mergeMapTo many outer to many inner, and inner throws', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const x = cold('   ----i---j---k---l-------#        ');
      //                         ----i---j---k---l-------#
      //                                 ----i---j---k---l
      const xsubs = [
        '               -^-----------------------!        ',
        '               ---------^---------------!        ',
        '               -----------------^-------!        ',
        '               -------------------------(^!)     ',
      ];
      const e1 = hot('  -a-------b-------c-------d-------|');
      const e1subs = '  ^------------------------!        ';
      const expected = '-----i---j---(ki)(lj)(ki)#        ';

      expectObservable(e1.pipe(mergeMapTo(x))).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should mergeMapTo many outer to many inner, and outer throws', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const x = cold('   ----i---j---k---l---|            ');
      //                         ----i---j---k---l---|
      //                                 ----i---j---k---l
      //                                         ----i---j
      const xsubs = [
        '               -^-------------------!            ',
        '               ---------^-------------------!    ',
        '               -----------------^---------------!',
        '               -------------------------^-------!',
      ];
      const e1 = hot('  -a-------b-------c-------d-------#');
      const e1subs = '  ^--------------------------------!';
      const expected = '-----i---j---(ki)(lj)(ki)(lj)(ki)#';

      expectObservable(e1.pipe(mergeMapTo(x))).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should mergeMapTo many outer to many inner, both inner and outer throw', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const x = cold('   ----i---j---k---l---#            ');
      //                         ----i---j---k
      //                                 ----i
      const xsubs = [
        '               -^-------------------!            ',
        '               ---------^-----------!            ',
        '               -----------------^---!            ',
      ];
      const e1 = hot('  -a-------b-------c-------d-------#');
      const e1subs = '  ^--------------------!            ';
      const expected = '-----i---j---(ki)(lj)#            ';

      expectObservable(e1.pipe(mergeMapTo(x))).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should mergeMapTo many cold Observable, with parameter concurrency=1, without resultSelector', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const x = cold('   ----i---j---k---l---|                                        ');
      //                                     ----i---j---k---l---|
      //                                                         ----i---j---k---l---|
      const xsubs = [
        '               -^-------------------!                                        ',
        '               ---------------------^-------------------!                    ',
        '               -----------------------------------------^-------------------!',
      ];
      const e1 = hot('  -a-------b-------c---|                                        ');
      const e1subs = '  ^--------------------!                                        ';
      const expected = '-----i---j---k---l-------i---j---k---l-------i---j---k---l---|';

      const result = e1.pipe(mergeMapTo(x, 1));

      expectObservable(result).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should mergeMapTo to many cold Observable, with parameter concurrency=2, without resultSelector', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const x = cold('   ----i---j---k---l---|                    ');
      //                         ----i---j---k---l---|
      //                                     ----i---j---k---l---|
      const xsubs = [
        '               -^-------------------!                    ',
        '               ---------^-------------------!            ',
        '               ---------------------^-------------------!',
      ];
      const e1 = hot('  -a-------b-------c---|                    ');
      const e1subs = '  ^--------------------!                    ';
      const expected = '-----i---j---(ki)(lj)k---(li)j---k---l---|';

      const result = e1.pipe(mergeMapTo(x, 2));

      expectObservable(result).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should mergeMapTo many outer to arrays', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  2-----4--------3--------2-------|');
      const e1subs = '  ^-------------------------------!';
      const expected = '(0123)(0123)---(0123)---(0123)--|';

      const result = e1.pipe(mergeMapTo(['0', '1', '2', '3']));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should mergeMapTo many outer to inner arrays, and outer throws', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  2-----4--------3--------2-------#');
      const e1subs = '  ^-------------------------------!';
      const expected = '(0123)(0123)---(0123)---(0123)--#';

      const result = e1.pipe(mergeMapTo(['0', '1', '2', '3']));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should mergeMapTo many outer to inner arrays, outer gets unsubscribed', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  2-----4--------3--------2-------|');
      const e1subs = '  ^------------!                   ';
      const expected = '(0123)(0123)--                   ';
      const unsub = '   -------------!                   ';

      const result = e1.pipe(mergeMapTo(['0', '1', '2', '3']));

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should map and flatten', () => {
    const source = of(1, 2, 3, 4).pipe(mergeMapTo(of('!')));

    const expected = ['!', '!', '!', '!'];
    let completed = false;

    source.subscribe(
      (x) => {
        expect(x).to.equal(expected.shift());
      },
      null,
      () => {
        expect(expected.length).to.equal(0);
        completed = true;
      }
    );

    expect(completed).to.be.true;
  });

  it('should map and flatten an Array', () => {
    const source = of(1, 2, 3, 4).pipe(mergeMapTo(['!']));

    const expected = ['!', '!', '!', '!'];
    let completed = false;

    source.subscribe(
      (x) => {
        expect(x).to.equal(expected.shift());
      },
      null,
      () => {
        expect(expected.length).to.equal(0);
        completed = true;
      }
    );

    expect(completed).to.be.true;
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

    synchronousObservable.pipe(mergeMapTo(of(0)), take(3)).subscribe(() => {
      /* noop */
    });

    expect(sideEffects).to.deep.equal([0, 1, 2]);
  });
});
