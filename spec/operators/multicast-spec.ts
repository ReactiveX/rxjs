import { expect } from 'chai';
import { multicast, tap, mergeMapTo, takeLast, mergeMap, refCount, retry, repeat, switchMap, map } from 'rxjs/operators';
import { Subject, ReplaySubject, of, ConnectableObservable, zip, concat, Subscription, Observable, from } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { hot, cold, expectObservable, expectSubscriptions, time } from '../helpers/marble-testing';

declare const type: Function;
declare const asDiagram: Function;

declare const rxTestScheduler: TestScheduler;

/** @test {multicast} */
describe('multicast operator', () => {
  asDiagram('multicast(() => new Subject<string>())')('should mirror a simple source Observable', () => {
    const source = cold('--1-2---3-4--5-|');
    const sourceSubs =  '^              !';
    const multicasted = source.pipe(multicast(() => new Subject<string>())) as ConnectableObservable<string>;
    const expected =    '--1-2---3-4--5-|';

    expectObservable(multicasted).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);

    multicasted.connect();
  });

  it('should accept Subjects', (done) => {
    const expected = [1, 2, 3, 4];

    const connectable = of(1, 2, 3, 4).pipe(multicast((new Subject<number>()))) as ConnectableObservable<number>;

    connectable.subscribe((x) => { expect(x).to.equal(expected.shift()); },
        (x) => {
          done(new Error('should not be called'));
        }, () => {
          done();
        });

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

    replayed.pipe(
      tap({
        next(x) {
          expect(x).to.equal(expected.shift());
        },
        complete() {
          expect(expected.length).to.equal(0);
        }
      })
    ).subscribe(null, done, done);
  });

  it('should accept Subject factory functions', (done) => {
    const expected = [1, 2, 3, 4];

    const connectable = of(1, 2, 3, 4).pipe(multicast(() => new Subject<number>())) as ConnectableObservable<number>;

    connectable.subscribe((x) => { expect(x).to.equal(expected.shift()); },
        (x) => {
          done(new Error('should not be called'));
        }, () => {
          done();
        });

    connectable.connect();
  });

  it('should accept a multicast selector and connect to a hot source for each subscriber', () => {
    const source =      hot('-1-2-3----4-|');
    const sourceSubs =     ['^           !',
                            '    ^       !',
                            '        ^   !'];
    const multicasted = source.pipe(
      multicast(
        () => new Subject<string>(),
        x => zip(x, x, (a: any, b: any) => (parseInt(a) + parseInt(b)).toString())
      )
    );
    const subscriber1 = hot('a|           ').pipe(mergeMapTo(multicasted));
    const expected1   =     '-2-4-6----8-|';
    const subscriber2 = hot('    b|       ').pipe(mergeMapTo(multicasted));
    const expected2   =     '    -6----8-|';
    const subscriber3 = hot('        c|   ').pipe(mergeMapTo(multicasted));
    const expected3   =     '        --8-|';

    expectObservable(subscriber1).toBe(expected1);
    expectObservable(subscriber2).toBe(expected2);
    expectObservable(subscriber3).toBe(expected3);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should accept a multicast selector and connect to a cold source for each subscriber', () => {
    const source =     cold('-1-2-3----4-|');
    const sourceSubs =     ['^           !',
                            '    ^           !',
                            '        ^           !'];
    const multicasted = source.pipe(
      multicast(
        () => new Subject<string>(),
        x => zip(x, x, (a: any, b: any) => (parseInt(a) + parseInt(b)).toString())
      )
    );
    const expected1   =     '-2-4-6----8-|';
    const expected2   =     '    -2-4-6----8-|';
    const expected3   =     '        -2-4-6----8-|';
    const subscriber1 = hot('a|           ').pipe(mergeMapTo(multicasted));
    const subscriber2 = hot('    b|       ').pipe(mergeMapTo(multicasted));
    const subscriber3 = hot('        c|   ').pipe(mergeMapTo(multicasted));

    expectObservable(subscriber1).toBe(expected1);
    expectObservable(subscriber2).toBe(expected2);
    expectObservable(subscriber3).toBe(expected3);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should accept a multicast selector and respect the subject\'s messaging semantics', () => {
    const source =     cold('-1-2-3----4-|');
    const sourceSubs =     ['^           !',
                            '    ^           !',
                            '        ^           !'];
    const multicasted = source.pipe(
      multicast(
        () => new ReplaySubject<string>(1),
        x => concat(x, x.pipe(takeLast(1)))
      )
    );
    const expected1   =     '-1-2-3----4-(4|)';
    const expected2   =     '    -1-2-3----4-(4|)';
    const expected3   =     '        -1-2-3----4-(4|)';
    const subscriber1 = hot('a|           ').pipe(mergeMapTo(multicasted));
    const subscriber2 = hot('    b|       ').pipe(mergeMapTo(multicasted));
    const subscriber3 = hot('        c|   ').pipe(mergeMapTo(multicasted));

    expectObservable(subscriber1).toBe(expected1);
    expectObservable(subscriber2).toBe(expected2);
    expectObservable(subscriber3).toBe(expected3);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should do nothing if connect is not called, despite subscriptions', () => {
    const source = cold('--1-2---3-4--5-|');
    const sourceSubs: string[] = [];
    const multicasted = source.pipe(multicast(() => new Subject<string>()));
    const expected =    '-';

    expectObservable(multicasted).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should multicast the same values to multiple observers', () => {
    const source =     cold('-1-2-3----4-|');
    const sourceSubs =      '^           !';
    const multicasted = source.pipe(multicast(() => new Subject<string>())) as ConnectableObservable<string>;
    const subscriber1 = hot('a|           ').pipe(mergeMapTo(multicasted));
    const expected1   =     '-1-2-3----4-|';
    const subscriber2 = hot('    b|       ').pipe(mergeMapTo(multicasted));
    const expected2   =     '    -3----4-|';
    const subscriber3 = hot('        c|   ').pipe(mergeMapTo(multicasted));
    const expected3   =     '        --4-|';

    expectObservable(subscriber1).toBe(expected1);
    expectObservable(subscriber2).toBe(expected2);
    expectObservable(subscriber3).toBe(expected3);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);

    multicasted.connect();
  });

  it('should multicast an error from the source to multiple observers', () => {
    const source =     cold('-1-2-3----4-#');
    const sourceSubs =      '^           !';
    const multicasted = source.pipe(multicast(() => new Subject<string>())) as ConnectableObservable<string>;
    const subscriber1 = hot('a|           ').pipe(mergeMapTo(multicasted));
    const expected1   =     '-1-2-3----4-#';
    const subscriber2 = hot('    b|       ').pipe(mergeMapTo(multicasted));
    const expected2   =     '    -3----4-#';
    const subscriber3 = hot('        c|   ').pipe(mergeMapTo(multicasted));
    const expected3   =     '        --4-#';

    expectObservable(subscriber1).toBe(expected1);
    expectObservable(subscriber2).toBe(expected2);
    expectObservable(subscriber3).toBe(expected3);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);

    multicasted.connect();
  });

  it('should multicast the same values to multiple observers, ' +
  'but is unsubscribed explicitly and early', () => {
    const source =     cold('-1-2-3----4-|');
    const sourceSubs =      '^        !   ';
    const multicasted = source.pipe(multicast(() => new Subject<string>())) as ConnectableObservable<string>;
    const unsub =           '         u   ';
    const subscriber1 = hot('a|           ').pipe(mergeMapTo(multicasted));
    const expected1   =     '-1-2-3----   ';
    const subscriber2 = hot('    b|       ').pipe(mergeMapTo(multicasted));
    const expected2   =     '    -3----   ';
    const subscriber3 = hot('        c|   ').pipe(mergeMapTo(multicasted));
    const expected3   =     '        --   ';

    expectObservable(subscriber1).toBe(expected1);
    expectObservable(subscriber2).toBe(expected2);
    expectObservable(subscriber3).toBe(expected3);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);

    // Set up unsubscription action
    let connection: Subscription;
    expectObservable(hot(unsub).pipe(tap(() => {
      connection.unsubscribe();
    }))).toBe(unsub);

    connection = multicasted.connect();
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    const source =     cold('-1-2-3----4-|');
    const sourceSubs =      '^        !   ';
    const multicasted = source.pipe(
      mergeMap((x) => of(x)),
      multicast(() => new Subject<string>())
    ) as ConnectableObservable<string>;
    const subscriber1 = hot('a|           ').pipe(mergeMapTo(multicasted));
    const expected1   =     '-1-2-3----   ';
    const subscriber2 = hot('    b|       ').pipe(mergeMapTo(multicasted));
    const expected2   =     '    -3----   ';
    const subscriber3 = hot('        c|   ').pipe(mergeMapTo(multicasted));
    const expected3   =     '        --   ';
    const unsub =           '         u   ';

    expectObservable(subscriber1).toBe(expected1);
    expectObservable(subscriber2).toBe(expected2);
    expectObservable(subscriber3).toBe(expected3);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);

    // Set up unsubscription action
    let connection: Subscription;
    expectObservable(hot(unsub).pipe(tap(() => {
      connection.unsubscribe();
    }))).toBe(unsub);

    connection = multicasted.connect();
  });

  it('should multicast an empty source', () => {
    const source = cold('|');
    const sourceSubs =  '(^!)';
    const multicasted = source.pipe(multicast(() => new Subject<string>())) as ConnectableObservable<string>;
    const expected =    '|';

    expectObservable(multicasted).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);

    multicasted.connect();
  });

  it('should multicast a never source', () => {
    const source = cold('-');
    const sourceSubs =  '^';
    const multicasted = source.pipe(multicast(() => new Subject<string>())) as ConnectableObservable<string>;
    const expected =    '-';

    expectObservable(multicasted).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);

    multicasted.connect();
  });

  it('should multicast a throw source', () => {
    const source = cold('#');
    const sourceSubs =  '(^!)';
    const multicasted = source.pipe(multicast(() => new Subject<string>())) as ConnectableObservable<string>;
    const expected =    '#';

    expectObservable(multicasted).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);

    multicasted.connect();
  });

  describe('with refCount() and subject factory', () => {
    it('should connect when first subscriber subscribes', () => {
      const source = cold(       '-1-2-3----4-|');
      const sourceSubs =      '   ^           !';
      const multicasted = source.pipe(
        multicast(() => new Subject<string>()),
        refCount()
      );
      const subscriber1 = hot('   a|           ').pipe(mergeMapTo(multicasted));
      const expected1 =       '   -1-2-3----4-|';
      const subscriber2 = hot('       b|       ').pipe(mergeMapTo(multicasted));
      const expected2 =       '       -3----4-|';
      const subscriber3 = hot('           c|   ').pipe(mergeMapTo(multicasted));
      const expected3 =       '           --4-|';

      expectObservable(subscriber1).toBe(expected1);
      expectObservable(subscriber2).toBe(expected2);
      expectObservable(subscriber3).toBe(expected3);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });

    it('should disconnect when last subscriber unsubscribes', () => {
      const source =     cold(   '-1-2-3----4-|');
      const sourceSubs =      '   ^        !   ';
      const multicasted = source.pipe(
        multicast(() => new Subject<string>()),
        refCount()
      );
      const subscriber1 = hot('   a|           ').pipe(mergeMapTo(multicasted));
      const unsub1 =          '          !     ';
      const expected1   =     '   -1-2-3--     ';
      const subscriber2 = hot('       b|       ').pipe(mergeMapTo(multicasted));
      const unsub2 =          '            !   ';
      const expected2   =     '       -3----   ';

      expectObservable(subscriber1, unsub1).toBe(expected1);
      expectObservable(subscriber2, unsub2).toBe(expected2);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });

    it('should be retryable when cold source is synchronous', () => {
      function subjectFactory() { return new Subject<string>(); }
      const source = cold('(123#)');
      const multicasted = source.pipe(
        multicast(subjectFactory),
        refCount()
      );
      const subscribe1 =  's               ';
      const expected1 =   '(123123123123#) ';
      const subscribe2 =  ' s              ';
      const expected2 =   ' (123123123123#)';
      const sourceSubs = ['(^!)',
                          '(^!)',
                          '(^!)',
                          '(^!)',
                          ' (^!)',
                          ' (^!)',
                          ' (^!)',
                          ' (^!)'];

      expectObservable(hot(subscribe1).pipe(tap(() => {
        expectObservable(multicasted.pipe(retry(3))).toBe(expected1);
      }))).toBe(subscribe1);

      expectObservable(hot(subscribe2).pipe(tap(() => {
        expectObservable(multicasted.pipe(retry(3))).toBe(expected2);
      }))).toBe(subscribe2);

      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });

    it('should be retryable with ReplaySubject and cold source is synchronous', () => {
      function subjectFactory() { return new ReplaySubject(1); }
      const source = cold('(123#)');
      const multicasted = source.pipe(
        multicast(subjectFactory),
        refCount()
      );
      const subscribe1 =  's               ';
      const expected1 =   '(123123123123#) ';
      const subscribe2 =  ' s              ';
      const expected2 =   ' (123123123123#)';
      const sourceSubs = ['(^!)',
                          '(^!)',
                          '(^!)',
                          '(^!)',
                          ' (^!)',
                          ' (^!)',
                          ' (^!)',
                          ' (^!)'];

      expectObservable(
        hot(subscribe1).pipe(tap(() => {
          expectObservable(multicasted.pipe(retry(3))).toBe(expected1);
        }))
      ).toBe(subscribe1);

      expectObservable(
        hot(subscribe2).pipe(tap(() => {
          expectObservable(multicasted.pipe(retry(3))).toBe(expected2);
        }))
      ).toBe(subscribe2);

      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });

    it('should be repeatable when cold source is synchronous', () => {
      function subjectFactory() { return new Subject<string>(); }
      const source = cold('(123|)');
      const multicasted = source.pipe(
        multicast(subjectFactory),
        refCount()
      );
      const subscribe1 =  's                  ';
      const expected1 =   '(123123123123123|) ';
      const subscribe2 =  ' s                 ';
      const expected2 =   ' (123123123123123|)';
      const sourceSubs = ['(^!)',
                        '(^!)',
                        '(^!)',
                        '(^!)',
                        '(^!)',
                        ' (^!)',
                        ' (^!)',
                        ' (^!)',
                        ' (^!)',
                        ' (^!)'];

      expectObservable(
        hot(subscribe1).pipe(tap(() => {
          expectObservable(multicasted.pipe(repeat(5))).toBe(expected1);
        }))
      ).toBe(subscribe1);

      expectObservable(
        hot(subscribe2).pipe(tap(() => {
          expectObservable(multicasted.pipe(repeat(5))).toBe(expected2);
        }))
      ).toBe(subscribe2);

      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });

    it('should be repeatable with ReplaySubject and cold source is synchronous', () => {
      function subjectFactory() { return new ReplaySubject(1); }
      const source = cold('(123|)');
      const multicasted = source.pipe(
        multicast(subjectFactory),
        refCount()
      );
      const subscribe1 =  's                  ';
      const expected1 =   '(123123123123123|) ';
      const subscribe2 =  ' s                 ';
      const expected2 =   ' (123123123123123|)';
      const sourceSubs = ['(^!)',
                        '(^!)',
                        '(^!)',
                        '(^!)',
                        '(^!)',
                        ' (^!)',
                        ' (^!)',
                        ' (^!)',
                        ' (^!)',
                        ' (^!)'];

      expectObservable(
        hot(subscribe1).pipe(tap(() => {
          expectObservable(multicasted.pipe(repeat(5))).toBe(expected1);
        }))
      ).toBe(subscribe1);

      expectObservable(hot(subscribe2).pipe(tap(() => {
        expectObservable(multicasted.pipe(repeat(5))).toBe(expected2);
      }))).toBe(subscribe2);

      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });

    it('should be retryable', () => {
      function subjectFactory() { return new Subject<string>(); }
      const source =     cold('-1-2-3----4-#                        ');
      const sourceSubs =     ['^           !                        ',
                            '            ^           !            ',
                            '                        ^           !'];
      const multicasted = source.pipe(
        multicast(subjectFactory),
        refCount()
      );
      const subscribe1 =      's                                    ';
      const expected1 =       '-1-2-3----4--1-2-3----4--1-2-3----4-#';
      const subscribe2 =      '    s                                ';
      const expected2 =       '    -3----4--1-2-3----4--1-2-3----4-#';

      expectObservable(
        hot(subscribe1).pipe(tap(() => {
          expectObservable(multicasted.pipe(retry(2))).toBe(expected1);
        }))
      ).toBe(subscribe1);

      expectObservable(
        hot(subscribe2).pipe(tap(() => {
          expectObservable(multicasted.pipe(retry(2))).toBe(expected2);
        }))
      ).toBe(subscribe2);

      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });

    it('should be retryable using a ReplaySubject', () => {
      function subjectFactory() { return new ReplaySubject(1); }
      const source =     cold('-1-2-3----4-#                        ');
      const sourceSubs =     ['^           !                        ',
                              '            ^           !            ',
                              '                        ^           !'];
      const multicasted = source.pipe(
        multicast(subjectFactory),
        refCount()
      );
      const expected1 =       '-1-2-3----4--1-2-3----4--1-2-3----4-#';
      const subscribe2 = time('----|                                ');
      const expected2 =       '    23----4--1-2-3----4--1-2-3----4-#';

      expectObservable(multicasted.pipe(retry(2))).toBe(expected1);

      rxTestScheduler.schedule(() =>
        expectObservable(multicasted.pipe(retry(2))).toBe(expected2), subscribe2);

      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });

    it('should be repeatable', () => {
      function subjectFactory() { return new Subject<string>(); }
      const source =     cold('-1-2-3----4-|                        ');
      const sourceSubs =     ['^           !                        ',
                              '            ^           !            ',
                              '                        ^           !'];
      const multicasted = source.pipe(
        multicast(subjectFactory),
        refCount()
      );
      const subscribe1 =      's                                    ';
      const expected1 =       '-1-2-3----4--1-2-3----4--1-2-3----4-|';
      const subscribe2 =      '    s                                ';
      const expected2 =       '    -3----4--1-2-3----4--1-2-3----4-|';

      expectObservable(
        hot(subscribe1).pipe(tap(() => {
          expectObservable(multicasted.pipe(repeat(3))).toBe(expected1);
        }))
      ).toBe(subscribe1);

      expectObservable(
        hot(subscribe2).pipe(tap(() => {
          expectObservable(multicasted.pipe(repeat(3))).toBe(expected2);
        }))
      ).toBe(subscribe2);

      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });

    it('should be repeatable using a ReplaySubject', () => {
      function subjectFactory() { return new ReplaySubject(1); }
      const source =     cold('-1-2-3----4-|                        ');
      const sourceSubs =     ['^           !                        ',
                              '            ^           !            ',
                              '                        ^           !'];
      const multicasted = source.pipe(
        multicast(subjectFactory),
        refCount()
      );
      const subscribe1 =      's                                    ';
      const expected1 =       '-1-2-3----4--1-2-3----4--1-2-3----4-|';
      const subscribe2 =      '    s                                ';
      const expected2 =       '    23----4--1-2-3----4--1-2-3----4-|';

      expectObservable(
        hot(subscribe1).pipe(tap(() => {
          expectObservable(multicasted.pipe(repeat(3))).toBe(expected1);
        }))
      ).toBe(subscribe1);

      expectObservable(
        hot(subscribe2).pipe(tap(() => {
          expectObservable(multicasted.pipe(repeat(3))).toBe(expected2);
        }))
      ).toBe(subscribe2);

      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
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

    const connectable = source.pipe(multicast(() => {
      return new Subject<number>();
    })) as ConnectableObservable<number>;

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

      source.subscribe((x) => {
        expect(x).to.equal(expected[i++]);
      }, null,
        () => {
          i = 0;

          source.subscribe((x) => {
            expect(x).to.equal(expected[i++]);
          }, null, done);

          source.connect();
        });

      source.connect();
    });

    it('should not throw ObjectUnsubscribedError when used in ' +
    'a switchMap', (done) => {
      const source = of(1, 2, 3).pipe(
        multicast(() => new Subject<number>()),
        refCount()
      );

      const expected = ['a1', 'a2', 'a3', 'b1', 'b2', 'b3', 'c1', 'c2', 'c3'];

      of('a', 'b', 'c').pipe(
        switchMap((letter) => source.pipe(map((n) => String(letter + n))))
      ).subscribe((x) => {
          expect(x).to.equal(expected.shift());
        }, (x) => {
          done(new Error('should not be called'));
        }, () => {
          expect(expected.length).to.equal(0);
          done();
        });
    });
  });

  describe('when given a subject', () => {
    it('should not throw ObjectUnsubscribedError when used in ' +
    'a switchMap', (done) => {
      const source = of(1, 2, 3).pipe(
        multicast(new Subject<number>()),
        refCount()
      );

      const expected = ['a1', 'a2', 'a3'];

      of('a', 'b', 'c').pipe(
        switchMap((letter) => source.pipe(map((n) => String(letter + n))))
      ).subscribe((x) => {
          expect(x).to.equal(expected.shift());
        }, (x) => {
          done(new Error('should not be called'));
        }, () => {
          expect(expected.length).to.equal(0);
          done();
        });
    });
  });

  describe('typings', () => {
    type('should infer the type', () => {
      /* tslint:disable:no-unused-variable */
      const source = of<number>(1, 2, 3);
      const result: ConnectableObservable<number> = source.pipe(multicast(() => new Subject<number>())) as ConnectableObservable<number>;
      /* tslint:enable:no-unused-variable */
    });

    type('should infer the type with a selector', () => {
      /* tslint:disable:no-unused-variable */
      const source = of<number>(1, 2, 3);
      const result: Observable<number> = source.pipe(multicast(() => new Subject<number>(), s => s.pipe(map(x => x))));
      /* tslint:enable:no-unused-variable */
    });

    type('should infer the type with a type-changing selector', () => {
      /* tslint:disable:no-unused-variable */
      const source = of<number>(1, 2, 3);
      const result: Observable<string> = source.pipe(multicast(() => new Subject<number>(), s => s.pipe(map(x => x + '!'))));
      /* tslint:enable:no-unused-variable */
    });

    type('should infer the type for the pipeable operator', () => {
      /* tslint:disable:no-unused-variable */
      const source = of<number>(1, 2, 3);
      // TODO: https://github.com/ReactiveX/rxjs/issues/2972
      const result: ConnectableObservable<number> = multicast(() => new Subject<number>())(source);
      /* tslint:enable:no-unused-variable */
    });

    type('should infer the type for the pipeable operator with a selector', () => {
      /* tslint:disable:no-unused-variable */
      const source = of<number>(1, 2, 3);
      const result: Observable<number> = source.pipe(multicast(() => new Subject<number>(), s => s.pipe(map(x => x))));
      /* tslint:enable:no-unused-variable */
    });

    type('should infer the type for the pipeable operator with a type-changing selector', () => {
      /* tslint:disable:no-unused-variable */
      const source = of<number>(1, 2, 3);
      const result: Observable<string> = source.pipe(multicast(() => new Subject<number>(), s => s.pipe(map(x => x + '!'))));
      /* tslint:enable:no-unused-variable */
    });
  });
});
