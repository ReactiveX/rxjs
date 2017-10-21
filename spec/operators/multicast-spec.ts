import { expect } from 'chai';
import * as Rx from '../../dist/package/Rx';
import marbleTestingSignature = require('../helpers/marble-testing'); // tslint:disable-line:no-require-imports

declare const { asDiagram, time, rxTestScheduler };
declare const type;
declare const hot: typeof marbleTestingSignature.hot;
declare const cold: typeof marbleTestingSignature.cold;
declare const expectObservable: typeof marbleTestingSignature.expectObservable;
declare const expectSubscriptions: typeof marbleTestingSignature.expectSubscriptions;

const Observable = Rx.Observable;
const Subject = Rx.Subject;
const ReplaySubject = Rx.ReplaySubject;

/** @test {multicast} */
describe('Observable.prototype.multicast', () => {
  asDiagram('multicast(() => new Subject())')('should mirror a simple source Observable', () => {
    const source = cold('--1-2---3-4--5-|');
    const sourceSubs =  '^              !';
    const multicasted = source.multicast(() => new Subject());
    const expected =    '--1-2---3-4--5-|';

    expectObservable(multicasted).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);

    multicasted.connect();
  });

  it('should accept Subjects', (done: MochaDone) => {
    const expected = [1, 2, 3, 4];

    const connectable = Observable.of(1, 2, 3, 4).multicast(new Subject<number>());

    connectable.subscribe((x: number) => { expect(x).to.equal(expected.shift()); },
        (x) => {
          done(new Error('should not be called'));
        }, () => {
          done();
        });

    connectable.connect();
  });

  it('should multicast a ConnectableObservable', (done: MochaDone) => {
    const expected = [1, 2, 3, 4];

    const source = new Subject<number>();
    const connectable = source.multicast(new Subject<number>());
    const replayed = connectable.multicast(new ReplaySubject<number>());

    connectable.connect();
    replayed.connect();

    source.next(1);
    source.next(2);
    source.next(3);
    source.next(4);
    source.complete();

    replayed.do({
      next(x: number) {
        expect(x).to.equal(expected.shift());
      },
      complete() {
        expect(expected.length).to.equal(0);
      }
    })
    .subscribe(null, done, done);
  });

  it('should accept Subject factory functions', (done: MochaDone) => {
    const expected = [1, 2, 3, 4];

    const connectable = Observable.of(1, 2, 3, 4).multicast(() => new Subject<number>());

    connectable.subscribe((x: number) => { expect(x).to.equal(expected.shift()); },
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
    const multicasted = source.multicast(() => new Subject(),
      x => x.zip(x, (a: string, b: string) => (parseInt(a) + parseInt(b)).toString()));
    const subscriber1 = hot('a|           ').mergeMapTo(multicasted);
    const expected1   =     '-2-4-6----8-|';
    const subscriber2 = hot('    b|       ').mergeMapTo(multicasted);
    const expected2   =     '    -6----8-|';
    const subscriber3 = hot('        c|   ').mergeMapTo(multicasted);
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
    const multicasted = source.multicast(() => new Subject(),
      x => x.zip(x, (a: string, b: string) => (parseInt(a) + parseInt(b)).toString()));
    const expected1   =     '-2-4-6----8-|';
    const expected2   =     '    -2-4-6----8-|';
    const expected3   =     '        -2-4-6----8-|';
    const subscriber1 = hot('a|           ').mergeMapTo(multicasted);
    const subscriber2 = hot('    b|       ').mergeMapTo(multicasted);
    const subscriber3 = hot('        c|   ').mergeMapTo(multicasted);

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
    const multicasted = source.multicast(() => new ReplaySubject(1),
      x => x.concat(x.takeLast(1)));
    const expected1   =     '-1-2-3----4-(4|)';
    const expected2   =     '    -1-2-3----4-(4|)';
    const expected3   =     '        -1-2-3----4-(4|)';
    const subscriber1 = hot('a|           ').mergeMapTo(multicasted);
    const subscriber2 = hot('    b|       ').mergeMapTo(multicasted);
    const subscriber3 = hot('        c|   ').mergeMapTo(multicasted);

    expectObservable(subscriber1).toBe(expected1);
    expectObservable(subscriber2).toBe(expected2);
    expectObservable(subscriber3).toBe(expected3);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should do nothing if connect is not called, despite subscriptions', () => {
    const source = cold('--1-2---3-4--5-|');
    const sourceSubs = [];
    const multicasted = source.multicast(() => new Subject());
    const expected =    '-';

    expectObservable(multicasted).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should multicast the same values to multiple observers', () => {
    const source =     cold('-1-2-3----4-|');
    const sourceSubs =      '^           !';
    const multicasted = source.multicast(() => new Subject());
    const subscriber1 = hot('a|           ').mergeMapTo(multicasted);
    const expected1   =     '-1-2-3----4-|';
    const subscriber2 = hot('    b|       ').mergeMapTo(multicasted);
    const expected2   =     '    -3----4-|';
    const subscriber3 = hot('        c|   ').mergeMapTo(multicasted);
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
    const multicasted = source.multicast(() => new Subject());
    const subscriber1 = hot('a|           ').mergeMapTo(multicasted);
    const expected1   =     '-1-2-3----4-#';
    const subscriber2 = hot('    b|       ').mergeMapTo(multicasted);
    const expected2   =     '    -3----4-#';
    const subscriber3 = hot('        c|   ').mergeMapTo(multicasted);
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
    const multicasted = source.multicast(() => new Subject());
    const unsub =           '         u   ';
    const subscriber1 = hot('a|           ').mergeMapTo(multicasted);
    const expected1   =     '-1-2-3----   ';
    const subscriber2 = hot('    b|       ').mergeMapTo(multicasted);
    const expected2   =     '    -3----   ';
    const subscriber3 = hot('        c|   ').mergeMapTo(multicasted);
    const expected3   =     '        --   ';

    expectObservable(subscriber1).toBe(expected1);
    expectObservable(subscriber2).toBe(expected2);
    expectObservable(subscriber3).toBe(expected3);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);

    // Set up unsubscription action
    let connection;
    expectObservable(hot(unsub).do(() => {
      connection.unsubscribe();
    })).toBe(unsub);

    connection = multicasted.connect();
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    const source =     cold('-1-2-3----4-|');
    const sourceSubs =      '^        !   ';
    const multicasted = source
      .mergeMap((x: string) => Observable.of(x))
      .multicast(() => new Subject<string>());
    const subscriber1 = hot('a|           ').mergeMapTo(multicasted);
    const expected1   =     '-1-2-3----   ';
    const subscriber2 = hot('    b|       ').mergeMapTo(multicasted);
    const expected2   =     '    -3----   ';
    const subscriber3 = hot('        c|   ').mergeMapTo(multicasted);
    const expected3   =     '        --   ';
    const unsub =           '         u   ';

    expectObservable(subscriber1).toBe(expected1);
    expectObservable(subscriber2).toBe(expected2);
    expectObservable(subscriber3).toBe(expected3);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);

    // Set up unsubscription action
    let connection;
    expectObservable(hot(unsub).do(() => {
      connection.unsubscribe();
    })).toBe(unsub);

    connection = multicasted.connect();
  });

  it('should multicast an empty source', () => {
    const source = cold('|');
    const sourceSubs =  '(^!)';
    const multicasted = source.multicast(() => new Subject());
    const expected =    '|';

    expectObservable(multicasted).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);

    multicasted.connect();
  });

  it('should multicast a never source', () => {
    const source = cold('-');
    const sourceSubs =  '^';
    const multicasted = source.multicast(() => new Subject());
    const expected =    '-';

    expectObservable(multicasted).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);

    multicasted.connect();
  });

  it('should multicast a throw source', () => {
    const source = cold('#');
    const sourceSubs =  '(^!)';
    const multicasted = source.multicast(() => new Subject());
    const expected =    '#';

    expectObservable(multicasted).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);

    multicasted.connect();
  });

  describe('with refCount() and subject factory', () => {
    it('should connect when first subscriber subscribes', () => {
      const source = cold(       '-1-2-3----4-|');
      const sourceSubs =      '   ^           !';
      const multicasted = source.multicast(() => new Subject()).refCount();
      const subscriber1 = hot('   a|           ').mergeMapTo(multicasted);
      const expected1 =       '   -1-2-3----4-|';
      const subscriber2 = hot('       b|       ').mergeMapTo(multicasted);
      const expected2 =       '       -3----4-|';
      const subscriber3 = hot('           c|   ').mergeMapTo(multicasted);
      const expected3 =       '           --4-|';

      expectObservable(subscriber1).toBe(expected1);
      expectObservable(subscriber2).toBe(expected2);
      expectObservable(subscriber3).toBe(expected3);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });

    it('should disconnect when last subscriber unsubscribes', () => {
      const source =     cold(   '-1-2-3----4-|');
      const sourceSubs =      '   ^        !   ';
      const multicasted = source.multicast(() => new Subject()).refCount();
      const subscriber1 = hot('   a|           ').mergeMapTo(multicasted);
      const unsub1 =          '          !     ';
      const expected1   =     '   -1-2-3--     ';
      const subscriber2 = hot('       b|       ').mergeMapTo(multicasted);
      const unsub2 =          '            !   ';
      const expected2   =     '       -3----   ';

      expectObservable(subscriber1, unsub1).toBe(expected1);
      expectObservable(subscriber2, unsub2).toBe(expected2);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });

    it('should be retryable when cold source is synchronous', () => {
      function subjectFactory() { return new Subject(); }
      const source = cold('(123#)');
      const multicasted = source.multicast(subjectFactory).refCount();
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

      expectObservable(hot(subscribe1).do(() => {
        expectObservable(multicasted.retry(3)).toBe(expected1);
      })).toBe(subscribe1);

      expectObservable(hot(subscribe2).do(() => {
        expectObservable(multicasted.retry(3)).toBe(expected2);
      })).toBe(subscribe2);

      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });

    it('should be retryable with ReplaySubject and cold source is synchronous', () => {
      function subjectFactory() { return new Rx.ReplaySubject(1); }
      const source = cold('(123#)');
      const multicasted = source.multicast(subjectFactory).refCount();
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

      expectObservable(hot(subscribe1).do(() => {
        expectObservable(multicasted.retry(3)).toBe(expected1);
      })).toBe(subscribe1);

      expectObservable(hot(subscribe2).do(() => {
        expectObservable(multicasted.retry(3)).toBe(expected2);
      })).toBe(subscribe2);

      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });

    it('should be repeatable when cold source is synchronous', () => {
      function subjectFactory() { return new Subject(); }
      const source = cold('(123|)');
      const multicasted = source.multicast(subjectFactory).refCount();
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

      expectObservable(hot(subscribe1).do(() => {
        expectObservable(multicasted.repeat(5)).toBe(expected1);
      })).toBe(subscribe1);

      expectObservable(hot(subscribe2).do(() => {
        expectObservable(multicasted.repeat(5)).toBe(expected2);
      })).toBe(subscribe2);

      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });

    it('should be repeatable with ReplaySubject and cold source is synchronous', () => {
      function subjectFactory() { return new Rx.ReplaySubject(1); }
      const source = cold('(123|)');
      const multicasted = source.multicast(subjectFactory).refCount();
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

      expectObservable(hot(subscribe1).do(() => {
        expectObservable(multicasted.repeat(5)).toBe(expected1);
      })).toBe(subscribe1);

      expectObservable(hot(subscribe2).do(() => {
        expectObservable(multicasted.repeat(5)).toBe(expected2);
      })).toBe(subscribe2);

      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });

    it('should be retryable', () => {
      function subjectFactory() { return new Subject(); }
      const source =     cold('-1-2-3----4-#                        ');
      const sourceSubs =     ['^           !                        ',
                            '            ^           !            ',
                            '                        ^           !'];
      const multicasted = source.multicast(subjectFactory).refCount();
      const subscribe1 =      's                                    ';
      const expected1 =       '-1-2-3----4--1-2-3----4--1-2-3----4-#';
      const subscribe2 =      '    s                                ';
      const expected2 =       '    -3----4--1-2-3----4--1-2-3----4-#';

      expectObservable(hot(subscribe1).do(() => {
        expectObservable(multicasted.retry(2)).toBe(expected1);
      })).toBe(subscribe1);

      expectObservable(hot(subscribe2).do(() => {
        expectObservable(multicasted.retry(2)).toBe(expected2);
      })).toBe(subscribe2);

      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });

    it('should be retryable using a ReplaySubject', () => {
      function subjectFactory() { return new Rx.ReplaySubject(1); }
      const source =     cold('-1-2-3----4-#                        ');
      const sourceSubs =     ['^           !                        ',
                              '            ^           !            ',
                              '                        ^           !'];
      const multicasted = source.multicast(subjectFactory).refCount();
      const expected1 =       '-1-2-3----4--1-2-3----4--1-2-3----4-#';
      const subscribe2 = time('----|                                ');
      const expected2 =       '    23----4--1-2-3----4--1-2-3----4-#';

      expectObservable(multicasted.retry(2)).toBe(expected1);

      rxTestScheduler.schedule(() =>
        expectObservable(multicasted.retry(2)).toBe(expected2), subscribe2);

      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });

    it('should be repeatable', () => {
      function subjectFactory() { return new Subject(); }
      const source =     cold('-1-2-3----4-|                        ');
      const sourceSubs =     ['^           !                        ',
                              '            ^           !            ',
                              '                        ^           !'];
      const multicasted = source.multicast(subjectFactory).refCount();
      const subscribe1 =      's                                    ';
      const expected1 =       '-1-2-3----4--1-2-3----4--1-2-3----4-|';
      const subscribe2 =      '    s                                ';
      const expected2 =       '    -3----4--1-2-3----4--1-2-3----4-|';

      expectObservable(hot(subscribe1).do(() => {
        expectObservable(multicasted.repeat(3)).toBe(expected1);
      })).toBe(subscribe1);

      expectObservable(hot(subscribe2).do(() => {
        expectObservable(multicasted.repeat(3)).toBe(expected2);
      })).toBe(subscribe2);

      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });

    it('should be repeatable using a ReplaySubject', () => {
      function subjectFactory() { return new Rx.ReplaySubject(1); }
      const source =     cold('-1-2-3----4-|                        ');
      const sourceSubs =     ['^           !                        ',
                              '            ^           !            ',
                              '                        ^           !'];
      const multicasted = source.multicast(subjectFactory).refCount();
      const subscribe1 =      's                                    ';
      const expected1 =       '-1-2-3----4--1-2-3----4--1-2-3----4-|';
      const subscribe2 =      '    s                                ';
      const expected2 =       '    23----4--1-2-3----4--1-2-3----4-|';

      expectObservable(hot(subscribe1).do(() => {
        expectObservable(multicasted.repeat(3)).toBe(expected1);
      })).toBe(subscribe1);

      expectObservable(hot(subscribe2).do(() => {
        expectObservable(multicasted.repeat(3)).toBe(expected2);
      })).toBe(subscribe2);

      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });

  it('should multicast one observable to multiple observers', (done: MochaDone) => {
    const results1 = [];
    const results2 = [];
    let subscriptions = 0;

    const source = new Observable((observer: Rx.Observer<number>) => {
      subscriptions++;
      observer.next(1);
      observer.next(2);
      observer.next(3);
      observer.next(4);
      observer.complete();
    });

    const connectable = source.multicast(() => {
      return new Subject();
    });

    connectable.subscribe((x: number) => {
      results1.push(x);
    });

    connectable.subscribe((x: number) => {
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

    const source = Observable.from([1, 2, 3, 4]).multicast(subject);

    source.subscribe((x: number) => {
      expect(x).to.equal(expected[i++]);
    });

    source.connect();
    expect(subject.observers.length).to.equal(0);
  });

  describe('when given a subject factory', () => {
    it('should allow you to reconnect by subscribing again', (done: MochaDone) => {
      const expected = [1, 2, 3, 4];
      let i = 0;

      const source = Observable.of(1, 2, 3, 4).multicast(() => new Subject<number>());

      source.subscribe((x: number) => {
        expect(x).to.equal(expected[i++]);
      }, null,
        () => {
          i = 0;

          source.subscribe((x: number) => {
            expect(x).to.equal(expected[i++]);
          }, null, done);

          source.connect();
        });

      source.connect();
    });

    it('should not throw ObjectUnsubscribedError when used in ' +
    'a switchMap', (done: MochaDone) => {
      const source = Observable.of(1, 2, 3)
        .multicast(() => new Subject<number>())
        .refCount();

      const expected = ['a1', 'a2', 'a3', 'b1', 'b2', 'b3', 'c1', 'c2', 'c3'];

      Observable.of('a', 'b', 'c')
        .switchMap((letter: string) => source.map((n: number) => String(letter + n)))
        .subscribe((x: string) => {
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
    'a switchMap', (done: MochaDone) => {
      const source = Observable.of(1, 2, 3)
        .multicast(new Subject<number>())
        .refCount();

      const expected = ['a1', 'a2', 'a3'];

      Observable.of('a', 'b', 'c')
        .switchMap((letter: string) => source.map((n: number) => String(letter + n)))
        .subscribe((x: string) => {
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
      const source = Rx.Observable.of<number>(1, 2, 3);
      const result: Rx.ConnectableObservable<number> = source.multicast(() => new Subject<number>());
      /* tslint:enable:no-unused-variable */
    });

    type('should infer the type with a selector', () => {
      /* tslint:disable:no-unused-variable */
      const source = Rx.Observable.of<number>(1, 2, 3);
      const result: Rx.Observable<number> = source.multicast(() => new Subject<number>(), s => s.map(x => x));
      /* tslint:enable:no-unused-variable */
    });

    type('should infer the type with a type-changing selector', () => {
      /* tslint:disable:no-unused-variable */
      const source = Rx.Observable.of<number>(1, 2, 3);
      const result: Rx.Observable<string> = source.multicast(() => new Subject<number>(), s => s.map(x => x + '!'));
      /* tslint:enable:no-unused-variable */
    });

    type('should infer the type for the pipeable operator', () => {
      /* tslint:disable:no-unused-variable */
      const source = Rx.Observable.of<number>(1, 2, 3);
      // TODO: https://github.com/ReactiveX/rxjs/issues/2972
      const result: Rx.ConnectableObservable<number> = Rx.operators.multicast(() => new Subject<number>())(source);
      /* tslint:enable:no-unused-variable */
    });

    type('should infer the type for the pipeable operator with a selector', () => {
      /* tslint:disable:no-unused-variable */
      const source = Rx.Observable.of<number>(1, 2, 3);
      const result: Rx.Observable<number> = source.pipe(Rx.operators.multicast(() => new Subject<number>(), s => s.map(x => x)));
      /* tslint:enable:no-unused-variable */
    });

    type('should infer the type for the pipeable operator with a type-changing selector', () => {
      /* tslint:disable:no-unused-variable */
      const source = Rx.Observable.of<number>(1, 2, 3);
      const result: Rx.Observable<string> = source.pipe(Rx.operators.multicast(() => new Subject<number>(), s => s.map(x => x + '!')));
      /* tslint:enable:no-unused-variable */
    });
  });
});
