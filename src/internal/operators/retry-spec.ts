import { expect } from 'chai';
import { retry, map, take, mergeMap } from 'rxjs/operators';
import { Observable, Observer, of, throwError, Subject } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { assertDeepEquals } from '../test_helpers/assertDeepEquals';

/** @test {retry} */
describe('retry operator', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(assertDeepEquals);
  });

  // asDiagram('retry(2)')
  it('should handle a basic source that emits next then errors, count=3', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptionsTo }) => {
      const source = cold('--1-2-3-#');
      const subs =       ['^       !                ',
                        '        ^       !        ',
                        '                ^       !'];
      const expected =    '--1-2-3---1-2-3---1-2-3-#';

      const result = source.pipe(retry(2));

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(source).toBe(subs);
    });
  });

  it('should retry a number of times, without error, then complete', done => {
    let errors = 0;
    const retries = 2;
    new Observable<number>(observer => {
      observer.next(42);
      observer.complete();
    }).pipe(
      map((x: any) => {
        if (++errors < retries) {
          throw 'bad';
        }
        errors = 0;
        return x;
      }),
      retry(retries)
    ).subscribe(
        (x: number) => {
          expect(x).to.equal(42);
        },
        (err: any) => {
          expect('this was called').to.be.true;
        }, done);
  });

  it('should retry a number of times, then call error handler', done => {
    let errors = 0;
    const retries = 2;
    new Observable<number>(observer => {
      observer.next(42);
      observer.complete();
    }).pipe(
      map((x: any) => {
        errors += 1;
        throw 'bad';
      }),
      retry(retries - 1)
    ).subscribe(
        (x: number) => {
          expect(x).to.equal(42);
        },
        (err: any) => {
          expect(errors).to.equal(2);
          done();
        }, () => {
          expect('this was called').to.be.true;
        });
  });

  it('should retry until successful completion', done => {
    let errors = 0;
    const retries = 10;
    new Observable<number>(observer => {
      observer.next(42);
      observer.complete();
    }).pipe(
      map((x: any) => {
        if (++errors < retries) {
          throw 'bad';
        }
        errors = 0;
        return x;
      }),
      retry(),
      take(retries)
    ).subscribe(
        (x: number) => {
          expect(x).to.equal(42);
        },
        (err: any) => {
          expect('this was called').to.be.true;
        }, done);
  });

  it('should handle an empty source', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptionsTo }) => {
      const source = cold('|');
      const subs =        '(^!)';
      const expected =    '|';

      const result = source.pipe(retry());

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(source).toBe(subs);
    });
  });

  it('should handle a never source', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptionsTo }) => {
      const source = cold('-');
      const subs =        '^';
      const expected =    '-';

      const result = source.pipe(retry());

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(source).toBe(subs);
    });
  });

  it('should return a never observable given an async just-throw source and no count', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptionsTo }) => {
      const source = cold('-#'); // important that it's not a sync error
      const unsub =       '                                     !';
      const expected =    '--------------------------------------';

      const result = source.pipe(retry());

      expectObservable(result, unsub).toBe(expected);
    });
  });

  it('should handle a basic source that emits next then completes', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptionsTo }) => {
      const source = hot('--1--2--^--3--4--5---|');
      const subs =               '^            !';
      const expected =           '---3--4--5---|';

      const result = source.pipe(retry());

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(source).toBe(subs);
    });
  });

  it('should handle a basic source that emits next but does not complete', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptionsTo }) => {
      const source = hot('--1--2--^--3--4--5---');
      const subs =               '^            ';
      const expected =           '---3--4--5---';

      const result = source.pipe(retry());

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(source).toBe(subs);
    });
  });

  it('should handle a basic source that emits next then errors, no count', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptionsTo }) => {
      const source = cold('--1-2-3-#');
      const unsub =       '^------------------------------------!';
      const subs =       ['^       !                             ',
                          '        ^       !                     ',
                          '                ^       !             ',
                          '                        ^       !     ',
                          '                                ^    !'];
      const expected =    '--1-2-3---1-2-3---1-2-3---1-2-3---1-2-';

      const result = source.pipe(retry());

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptionsTo(source).toBe(subs);
    });
  });

  it('should handle a source which eventually throws, count=3, and result is ' +
  'unsubscribed early', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptionsTo }) => {
      const source = cold('--1-2-3-#');
      const unsub =       '^------------!           ';
      const subs =       ['^       !                ',
                          '        ^    !           '];
      const expected =    '--1-2-3---1-2-';

      const result = source.pipe(retry(3));

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptionsTo(source).toBe(subs);
    });
  });

  it('should not break unsubscription chain when unsubscribed explicitly', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptionsTo }) => {
      const source = cold('--1-2-3-#');
      const subs =       ['^       !                ',
                          '        ^    !           '];
      const expected =    '--1-2-3---1-2-';
      const unsub =       '^------------!           ';

      const result = source.pipe(
        mergeMap((x: string) => of(x)),
        retry(100),
        mergeMap((x: string) => of(x))
      );

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptionsTo(source).toBe(subs);
    });
  });

  // it('should retry a synchronous source (multicasted and refCounted) multiple times', done => {
  //   const expected = [1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3];

  //   of(1, 2, 3).pipe(
  //     concat(throwError('bad!')),
  //     multicast(() => new Subject()),
  //     refCount(),
  //     retry(4)
  //   ).subscribe(
  //       x => { expect(x).to.equal(expected.shift()); },
  //       (err: any) => {
  //         expect(err).to.equal('bad!');
  //         expect(expected.length).to.equal(0);
  //         done();
  //       }, () => {
  //         done(new Error('should not be called'));
  //       });
  // });
});
