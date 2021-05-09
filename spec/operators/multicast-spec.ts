/** @prettier */
import { expect } from 'chai';
import { multicast, tap, mergeMapTo, takeLast, mergeMap, refCount, retry, repeat, switchMap, map, take } from 'rxjs/operators';
import { Subject, ReplaySubject, of, ConnectableObservable, zip, concat, Subscription, Observable, from } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {multicast} */
describe('multicast', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(observableMatcher);
  });

  it('should mirror a simple source Observable', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' --1-2---3-4--5-|');
      const e1subs = '  ^--------------!';
      const expected = '--1-2---3-4--5-|';

      const result = e1.pipe(multicast(() => new Subject<string>())) as ConnectableObservable<string>;

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);

      result.connect();
    });
  });

  it('should accept Subjects', (done) => {
    const expected = [1, 2, 3, 4];

    const connectable = of(1, 2, 3, 4).pipe(multicast(new Subject<number>())) as ConnectableObservable<number>;

    connectable.subscribe(
      (x) => {
        expect(x).to.equal(expected.shift());
      },
      () => {
        done(new Error('should not be called'));
      },
      () => {
        done();
      }
    );

    connectable.connect();
  });

  it('should multicast a ConnectableObservable', (done) => {
    const expected = [1, 2, 3, 4];

    const source = new Subject<number>();
    const connectable = source.pipe(multicast(new Subject<number>())) as ConnectableObservable<number>;
    const replayed = connectable.pipe(multicast(new ReplaySubject<number>())) as ConnectableObservable<number>;

    connectable.connect();
    replayed.connect();

    source.next(1);
    source.next(2);
    source.next(3);
    source.next(4);
    source.complete();

    replayed
      .pipe(
        tap({
          next(x) {
            expect(x).to.equal(expected.shift());
          },
          complete() {
            expect(expected.length).to.equal(0);
          },
        })
      )
      .subscribe(null, done, done);
  });

  it('should accept Subject factory functions', (done) => {
    const expected = [1, 2, 3, 4];

    const connectable = of(1, 2, 3, 4).pipe(multicast(() => new Subject<number>())) as ConnectableObservable<number>;

    connectable.subscribe(
      (x) => {
        expect(x).to.equal(expected.shift());
      },
      () => {
        done(new Error('should not be called'));
      },
      () => {
        done();
      }
    );

    connectable.connect();
  });

  it('should accept a multicast selector and connect to a hot source for each subscriber', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const subjectFactory = () => new Subject<string>();
      const selector = (x: Observable<string>) => zip(x, x).pipe(map(([a, b]) => (parseInt(a) + parseInt(b)).toString()));

      const e1 = hot('         -1-2-3----4-|');
      // prettier-ignore
      const e1subs = [
        '                      ^-----------!',
        '                      ----^-------!',
        '                      --------^---!',
      ];
      const multicasted = e1.pipe(multicast(subjectFactory, selector));
      const subscriber1 = hot('a|           ').pipe(mergeMapTo(multicasted));
      const expected1 = '      -2-4-6----8-|';
      const subscriber2 = hot('----b|       ').pipe(mergeMapTo(multicasted));
      const expected2 = '      -----6----8-|';
      const subscriber3 = hot('--------c|   ').pipe(mergeMapTo(multicasted));
      const expected3 = '      ----------8-|';

      expectObservable(subscriber1).toBe(expected1);
      expectObservable(subscriber2).toBe(expected2);
      expectObservable(subscriber3).toBe(expected3);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should accept a multicast selector and connect to a cold source for each subscriber', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const subjectFactory = () => new Subject<string>();
      const selector = (x: Observable<string>) => zip(x, x).pipe(map(([a, b]) => (parseInt(a) + parseInt(b)).toString()));

      const e1 = cold('        -1-2-3----4-|        ');
      //                           -1-2-3----4-|
      //                               -1-2-3----4-|
      const e1subs = [
        '                      ^-----------!        ',
        '                      ----^-----------!    ',
        '                      --------^-----------!',
      ];
      const multicasted = e1.pipe(multicast(subjectFactory, selector));
      const subscriber1 = hot('a|                   ').pipe(mergeMapTo(multicasted));
      const expected1 = '      -2-4-6----8-|        ';
      const subscriber2 = hot('----b|               ').pipe(mergeMapTo(multicasted));
      const expected2 = '      -----2-4-6----8-|    ';
      const subscriber3 = hot('--------c|           ').pipe(mergeMapTo(multicasted));
      const expected3 = '      ---------2-4-6----8-|';

      expectObservable(subscriber1).toBe(expected1);
      expectObservable(subscriber2).toBe(expected2);
      expectObservable(subscriber3).toBe(expected3);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it("should accept a multicast selector and respect the subject's messaging semantics", () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const subjectFactory = () => new ReplaySubject<string>(1);
      const selector = (x: Observable<string>) => concat(x, x.pipe(takeLast(1)));

      const e1 = cold('        -1-2-3----4-|           ');
      //                                   (4|)
      //                           -1-2-3----4-|
      //                                       (4|)
      //                               -1-2-3----4-|
      //                                           (4|)
      const e1subs = [
        '                      ^-----------!           ',
        '                      ----^-----------!       ',
        '                      --------^-----------!   ',
      ];
      const multicasted = e1.pipe(multicast(subjectFactory, selector));
      const subscriber1 = hot('a|                      ').pipe(mergeMapTo(multicasted));
      const expected1 = '      -1-2-3----4-(4|)        ';
      const subscriber2 = hot('----b|                  ').pipe(mergeMapTo(multicasted));
      const expected2 = '      -----1-2-3----4-(4|)    ';
      const subscriber3 = hot('--------c|              ').pipe(mergeMapTo(multicasted));
      const expected3 = '      ---------1-2-3----4-(4|)';

      expectObservable(subscriber1).toBe(expected1);
      expectObservable(subscriber2).toBe(expected2);
      expectObservable(subscriber3).toBe(expected3);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should do nothing if connect is not called, despite subscriptions', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' --1-2---3-4--5-|');
      const e1subs: string[] = [];
      const expected = '----------------';
      const multicasted = e1.pipe(multicast(() => new Subject<string>()));

      expectObservable(multicasted).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should multicast the same values to multiple observers', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = cold('        -1-2-3----4-|');
      const e1subs = '         ^-----------!';
      const multicasted = e1.pipe(multicast(() => new Subject<string>())) as ConnectableObservable<string>;
      const subscriber1 = hot('a|           ').pipe(mergeMapTo(multicasted));
      const expected1 = '      -1-2-3----4-|';
      const subscriber2 = hot('----b|       ').pipe(mergeMapTo(multicasted));
      const expected2 = '      -----3----4-|';
      const subscriber3 = hot('--------c|   ').pipe(mergeMapTo(multicasted));
      const expected3 = '      ----------4-|';

      expectObservable(subscriber1).toBe(expected1);
      expectObservable(subscriber2).toBe(expected2);
      expectObservable(subscriber3).toBe(expected3);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);

      multicasted.connect();
    });
  });

  it('should multicast an error from the source to multiple observers', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = cold('        -1-2-3----4-#');
      const e1subs = '         ^-----------!';
      const multicasted = e1.pipe(multicast(() => new Subject<string>())) as ConnectableObservable<string>;
      const subscriber1 = hot('a|           ').pipe(mergeMapTo(multicasted));
      const expected1 = '      -1-2-3----4-#';
      const subscriber2 = hot('----b|       ').pipe(mergeMapTo(multicasted));
      const expected2 = '      -----3----4-#';
      const subscriber3 = hot('--------c|   ').pipe(mergeMapTo(multicasted));
      const expected3 = '      ----------4-#';

      expectObservable(subscriber1).toBe(expected1);
      expectObservable(subscriber2).toBe(expected2);
      expectObservable(subscriber3).toBe(expected3);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);

      multicasted.connect();
    });
  });

  it('should multicast the same values to multiple observers, but is unsubscribed explicitly and early', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = cold('        -1-2-3----4-|');
      const e1subs = '         ^--------!   ';
      const multicasted = e1.pipe(multicast(() => new Subject<string>())) as ConnectableObservable<string>;
      const unsub = '          ---------u   ';
      const subscriber1 = hot('a|           ').pipe(mergeMapTo(multicasted));
      const expected1 = '      -1-2-3----   ';
      const subscriber2 = hot('----b|       ').pipe(mergeMapTo(multicasted));
      const expected2 = '      -----3----   ';
      const subscriber3 = hot('--------c|   ').pipe(mergeMapTo(multicasted));
      const expected3 = '      ----------   ';

      expectObservable(subscriber1).toBe(expected1);
      expectObservable(subscriber2).toBe(expected2);
      expectObservable(subscriber3).toBe(expected3);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);

      // Set up unsubscription action
      let connection: Subscription;
      expectObservable(
        hot(unsub).pipe(
          tap(() => {
            connection.unsubscribe();
          })
        )
      ).toBe(unsub);

      connection = multicasted.connect();
    });
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const project = (x: string) => of(x);
      const subjectFactory = () => new Subject<string>();

      const e1 = cold('        -1-2-3----4-|');
      const e1subs = '         ^--------!   ';
      const multicasted = e1.pipe(mergeMap(project), multicast(subjectFactory)) as ConnectableObservable<string>;
      const subscriber1 = hot('a|           ').pipe(mergeMapTo(multicasted));
      const expected1 = '      -1-2-3----   ';
      const subscriber2 = hot('----b|       ').pipe(mergeMapTo(multicasted));
      const expected2 = '      -----3----   ';
      const subscriber3 = hot('--------c|   ').pipe(mergeMapTo(multicasted));
      const expected3 = '      ----------   ';
      const unsub = '          ---------u   ';

      expectObservable(subscriber1).toBe(expected1);
      expectObservable(subscriber2).toBe(expected2);
      expectObservable(subscriber3).toBe(expected3);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);

      // Set up unsubscription action
      let connection: Subscription;
      expectObservable(
        hot(unsub).pipe(
          tap(() => {
            connection.unsubscribe();
          })
        )
      ).toBe(unsub);

      connection = multicasted.connect();
    });
  });

  it('should multicast an empty source', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' |   ');
      const e1subs = '  (^!)';
      const multicasted = e1.pipe(multicast(() => new Subject<string>())) as ConnectableObservable<string>;
      const expected = '|   ';

      expectObservable(multicasted).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);

      multicasted.connect();
    });
  });

  it('should multicast a never source', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' -');
      const e1subs = '  ^';
      const multicasted = e1.pipe(multicast(() => new Subject<string>())) as ConnectableObservable<string>;
      const expected = '-';

      expectObservable(multicasted).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);

      multicasted.connect();
    });
  });

  it('should multicast a throw source', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' #   ');
      const e1subs = '  (^!)';
      const multicasted = e1.pipe(multicast(() => new Subject<string>())) as ConnectableObservable<string>;
      const expected = '#   ';

      expectObservable(multicasted).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);

      multicasted.connect();
    });
  });

  describe('with refCount() and subject factory', () => {
    it('should connect when first subscriber subscribes', () => {
      testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
        const subjectFactory = () => new Subject<string>();

        const e1 = cold('           -1-2-3----4-|');
        const e1subs = '         ---^-----------!';
        const multicasted = e1.pipe(multicast(subjectFactory), refCount());
        const subscriber1 = hot('---a|           ').pipe(mergeMapTo(multicasted));
        const expected1 = '      ----1-2-3----4-|';
        const subscriber2 = hot('-------b|       ').pipe(mergeMapTo(multicasted));
        const expected2 = '      --------3----4-|';
        const subscriber3 = hot('-----------c|   ').pipe(mergeMapTo(multicasted));
        const expected3 = '      -------------4-|';

        expectObservable(subscriber1).toBe(expected1);
        expectObservable(subscriber2).toBe(expected2);
        expectObservable(subscriber3).toBe(expected3);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
      });
    });

    it('should disconnect when last subscriber unsubscribes', () => {
      testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
        const subjectFactory = () => new Subject<string>();

        const e1 = cold('           -1-2-3----4-|');
        const e1subs = '         ---^--------!   ';
        const multicasted = e1.pipe(multicast(subjectFactory), refCount());
        const subscriber1 = hot('---a|           ').pipe(mergeMapTo(multicasted));
        const expected1 = '      ----1-2-3--     ';
        const unsub1 = '         ----------!     ';
        const subscriber2 = hot('-------b|       ').pipe(mergeMapTo(multicasted));
        const expected2 = '      --------3----   ';
        const unsub2 = '         ------------!   ';

        expectObservable(subscriber1, unsub1).toBe(expected1);
        expectObservable(subscriber2, unsub2).toBe(expected2);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
      });
    });

    it('should be retryable when cold source is synchronous', () => {
      testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
        const subjectFactory = () => new Subject<string>();

        const e1 = cold('   (123#)          ');
        const multicasted = e1.pipe(multicast(subjectFactory), refCount());
        const subscribe1 = 's               ';
        const expected1 = ' (123123123123#) ';
        const subscribe2 = '-s              ';
        const expected2 = ' -(123123123123#)';
        const e1subs = [
          '                 (^!)            ',
          '                 (^!)            ',
          '                 (^!)            ',
          '                 (^!)            ',
          '                 -(^!)           ',
          '                 -(^!)           ',
          '                 -(^!)           ',
          '                 -(^!)           ',
        ];

        expectObservable(
          hot(subscribe1).pipe(
            tap(() => {
              expectObservable(multicasted.pipe(retry(3))).toBe(expected1);
            })
          )
        ).toBe(subscribe1);

        expectObservable(
          hot(subscribe2).pipe(
            tap(() => {
              expectObservable(multicasted.pipe(retry(3))).toBe(expected2);
            })
          )
        ).toBe(subscribe2);

        expectSubscriptions(e1.subscriptions).toBe(e1subs);
      });
    });

    it('should be retryable with ReplaySubject and cold source is synchronous', () => {
      testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
        const subjectFactory = () => new ReplaySubject(1);

        const e1 = cold('   (123#)          ');
        const multicasted = e1.pipe(multicast(subjectFactory), refCount());
        const subscribe1 = 's               ';
        const expected1 = ' (123123123123#) ';
        const subscribe2 = '-s              ';
        const expected2 = ' -(123123123123#)';
        const e1subs = [
          '                 (^!)            ',
          '                 (^!)            ',
          '                 (^!)            ',
          '                 (^!)            ',
          '                 -(^!)           ',
          '                 -(^!)           ',
          '                 -(^!)           ',
          '                 -(^!)           ',
        ];

        expectObservable(
          hot(subscribe1).pipe(
            tap(() => {
              expectObservable(multicasted.pipe(retry(3))).toBe(expected1);
            })
          )
        ).toBe(subscribe1);

        expectObservable(
          hot(subscribe2).pipe(
            tap(() => {
              expectObservable(multicasted.pipe(retry(3))).toBe(expected2);
            })
          )
        ).toBe(subscribe2);

        expectSubscriptions(e1.subscriptions).toBe(e1subs);
      });
    });

    it('should be repeatable when cold source is synchronous', () => {
      testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
        const subjectFactory = () => new Subject<string>();

        const e1 = cold('   (123|)             ');
        const multicasted = e1.pipe(multicast(subjectFactory), refCount());
        const subscribe1 = 's                  ';
        const expected1 = ' (123123123123123|) ';
        const subscribe2 = '-s                 ';
        const expected2 = ' -(123123123123123|)';
        const e1subs = [
          '                 (^!)               ',
          '                 (^!)               ',
          '                 (^!)               ',
          '                 (^!)               ',
          '                 (^!)               ',
          '                 -(^!)              ',
          '                 -(^!)              ',
          '                 -(^!)              ',
          '                 -(^!)              ',
          '                 -(^!)              ',
        ];

        expectObservable(
          hot(subscribe1).pipe(
            tap(() => {
              expectObservable(multicasted.pipe(repeat(5))).toBe(expected1);
            })
          )
        ).toBe(subscribe1);

        expectObservable(
          hot(subscribe2).pipe(
            tap(() => {
              expectObservable(multicasted.pipe(repeat(5))).toBe(expected2);
            })
          )
        ).toBe(subscribe2);

        expectSubscriptions(e1.subscriptions).toBe(e1subs);
      });
    });

    it('should be repeatable with ReplaySubject and cold source is synchronous', () => {
      testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
        const subjectFactory = () => new ReplaySubject(1);

        const e1 = cold('   (123|)             ');
        const multicasted = e1.pipe(multicast(subjectFactory), refCount());
        const subscribe1 = 's                  ';
        const expected1 = ' (123123123123123|) ';
        const subscribe2 = '-s                 ';
        const expected2 = ' -(123123123123123|)';
        const e1subs = [
          '                 (^!)               ',
          '                 (^!)               ',
          '                 (^!)               ',
          '                 (^!)               ',
          '                 (^!)               ',
          '                 -(^!)              ',
          '                 -(^!)              ',
          '                 -(^!)              ',
          '                 -(^!)              ',
          '                 -(^!)              ',
        ];

        expectObservable(
          hot(subscribe1).pipe(
            tap(() => {
              expectObservable(multicasted.pipe(repeat(5))).toBe(expected1);
            })
          )
        ).toBe(subscribe1);

        expectObservable(
          hot(subscribe2).pipe(
            tap(() => {
              expectObservable(multicasted.pipe(repeat(5))).toBe(expected2);
            })
          )
        ).toBe(subscribe2);

        expectSubscriptions(e1.subscriptions).toBe(e1subs);
      });
    });

    it('should be retryable', () => {
      testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
        const subjectFactory = () => new Subject<string>();

        const e1 = cold('   -1-2-3----4-#                        ');
        //                              -1-2-3----4-#
        //                                          -1-2-3----4-#
        const e1subs = [
          '                 ^-----------!                        ',
          '                 ------------^-----------!            ',
          '                 ------------------------^-----------!',
        ];
        const multicasted = e1.pipe(multicast(subjectFactory), refCount());
        const subscribe1 = 's------------------------------------';
        const expected1 = ' -1-2-3----4--1-2-3----4--1-2-3----4-#';
        const subscribe2 = '----s--------------------------------';
        const expected2 = ' -----3----4--1-2-3----4--1-2-3----4-#';

        expectObservable(
          hot(subscribe1).pipe(
            tap(() => {
              expectObservable(multicasted.pipe(retry(2))).toBe(expected1);
            })
          )
        ).toBe(subscribe1);

        expectObservable(
          hot(subscribe2).pipe(
            tap(() => {
              expectObservable(multicasted.pipe(retry(2))).toBe(expected2);
            })
          )
        ).toBe(subscribe2);

        expectSubscriptions(e1.subscriptions).toBe(e1subs);
      });
    });

    it('should be retryable using a ReplaySubject', () => {
      testScheduler.run(({ cold, time, expectObservable, expectSubscriptions }) => {
        const subjectFactory = () => new ReplaySubject(1);

        const e1 = cold('        -1-2-3----4-#                        ');
        const e1subs = [
          '                      ^-----------!                        ',
          '                      ------------^-----------!            ',
          '                      ------------------------^-----------!',
        ];
        const multicasted = e1.pipe(multicast(subjectFactory), refCount());
        const expected1 = '      -1-2-3----4--1-2-3----4--1-2-3----4-#';
        const subscribe2 = time('----|                                ');
        const expected2 = '      ----23----4--1-2-3----4--1-2-3----4-#';

        expectObservable(multicasted.pipe(retry(2))).toBe(expected1);

        testScheduler.schedule(() => expectObservable(multicasted.pipe(retry(2))).toBe(expected2), subscribe2);

        expectSubscriptions(e1.subscriptions).toBe(e1subs);
      });
    });

    it('should be repeatable', () => {
      testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
        const subjectFactory = () => new Subject();

        const e1 = cold('   -1-2-3----4-|                        ');
        const e1subs = [
          '                 ^-----------!                        ',
          '                 ------------^-----------!            ',
          '                 ------------------------^-----------!',
        ];
        const multicasted = e1.pipe(multicast(subjectFactory), refCount());
        const subscribe1 = 's------------------------------------';
        const expected1 = ' -1-2-3----4--1-2-3----4--1-2-3----4-|';
        const subscribe2 = '----s--------------------------------';
        const expected2 = ' -----3----4--1-2-3----4--1-2-3----4-|';

        expectObservable(
          hot(subscribe1).pipe(
            tap(() => {
              expectObservable(multicasted.pipe(repeat(3))).toBe(expected1);
            })
          )
        ).toBe(subscribe1);

        expectObservable(
          hot(subscribe2).pipe(
            tap(() => {
              expectObservable(multicasted.pipe(repeat(3))).toBe(expected2);
            })
          )
        ).toBe(subscribe2);

        expectSubscriptions(e1.subscriptions).toBe(e1subs);
      });
    });

    it('should be repeatable using a ReplaySubject', () => {
      testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
        const subjectFactory = () => new ReplaySubject(1);
        const e1 = cold('   -1-2-3----4-|                        ');
        const e1subs = [
          '                 ^-----------!                        ',
          '                 ------------^-----------!            ',
          '                 ------------------------^-----------!',
        ];
        const multicasted = e1.pipe(multicast(subjectFactory), refCount());
        const subscribe1 = 's------------------------------------';
        const expected1 = ' -1-2-3----4--1-2-3----4--1-2-3----4-|';
        const subscribe2 = '----s--------------------------------';
        const expected2 = ' ----23----4--1-2-3----4--1-2-3----4-|';

        expectObservable(
          hot(subscribe1).pipe(
            tap(() => {
              expectObservable(multicasted.pipe(repeat(3))).toBe(expected1);
            })
          )
        ).toBe(subscribe1);

        expectObservable(
          hot(subscribe2).pipe(
            tap(() => {
              expectObservable(multicasted.pipe(repeat(3))).toBe(expected2);
            })
          )
        ).toBe(subscribe2);

        expectSubscriptions(e1.subscriptions).toBe(e1subs);
      });
    });
  });

  it('should multicast one observable to multiple observers', (done) => {
    const results1: number[] = [];
    const results2: number[] = [];
    let subscriptions = 0;

    const source = new Observable<number>((observer) => {
      subscriptions++;
      observer.next(1);
      observer.next(2);
      observer.next(3);
      observer.next(4);
      observer.complete();
    });

    const connectable = source.pipe(
      multicast(() => {
        return new Subject<number>();
      })
    ) as ConnectableObservable<number>;

    connectable.subscribe((x) => {
      results1.push(x);
    });

    connectable.subscribe((x) => {
      results2.push(x);
    });

    expect(results1).to.deep.equal([]);
    expect(results2).to.deep.equal([]);

    connectable.connect();

    expect(results1).to.deep.equal([1, 2, 3, 4]);
    expect(results2).to.deep.equal([1, 2, 3, 4]);
    expect(subscriptions).to.equal(1);
    done();
  });

  it('should remove all subscribers from the subject when disconnected', () => {
    const subject = new Subject<number>();
    const expected = [1, 2, 3, 4];
    let i = 0;

    const source = from([1, 2, 3, 4]).pipe(multicast(subject)) as ConnectableObservable<number>;

    source.subscribe((x) => {
      expect(x).to.equal(expected[i++]);
    });

    source.connect();
    expect(subject.observers.length).to.equal(0);
  });

  describe('when given a subject factory', () => {
    it('should allow you to reconnect by subscribing again', (done) => {
      const expected = [1, 2, 3, 4];
      let i = 0;

      const source = of(1, 2, 3, 4).pipe(multicast(() => new Subject<number>())) as ConnectableObservable<number>;

      source.subscribe(
        (x) => {
          expect(x).to.equal(expected[i++]);
        },
        null,
        () => {
          i = 0;

          source.subscribe(
            (x) => {
              expect(x).to.equal(expected[i++]);
            },
            null,
            done
          );

          source.connect();
        }
      );

      source.connect();
    });

    it('should not throw ObjectUnsubscribedError when used in ' + 'a switchMap', (done) => {
      const source = of(1, 2, 3).pipe(
        multicast(() => new Subject<number>()),
        refCount()
      );

      const expected = ['a1', 'a2', 'a3', 'b1', 'b2', 'b3', 'c1', 'c2', 'c3'];

      of('a', 'b', 'c')
        .pipe(switchMap((letter) => source.pipe(map((n) => String(letter + n)))))
        .subscribe(
          (x) => {
            expect(x).to.equal(expected.shift());
          },
          () => {
            done(new Error('should not be called'));
          },
          () => {
            expect(expected.length).to.equal(0);
            done();
          }
        );
    });
  });

  describe('when given a subject', () => {
    it('should not throw ObjectUnsubscribedError when used in ' + 'a switchMap', (done) => {
      const source = of(1, 2, 3).pipe(multicast(new Subject<number>()), refCount());

      const expected = ['a1', 'a2', 'a3'];

      of('a', 'b', 'c')
        .pipe(switchMap((letter) => source.pipe(map((n) => String(letter + n)))))
        .subscribe(
          (x) => {
            expect(x).to.equal(expected.shift());
          },
          () => {
            done(new Error('should not be called'));
          },
          () => {
            expect(expected.length).to.equal(0);
            done();
          }
        );
    });
  });
});
