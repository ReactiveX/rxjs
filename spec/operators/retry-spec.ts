import { expect } from 'chai';
import { hot, cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';
import { retry, map, take, mergeMap, concat, multicast, refCount } from 'rxjs/operators';
import { Observable, Observer, defer, range, of, throwError, Subject } from 'rxjs';

/** @test {retry} */
describe('retry operator', () => {
  it('should handle a basic source that emits next then errors, count=3', () => {
    const source = cold('--1-2-3-#');
    const subs =       ['^       !                ',
                      '        ^       !        ',
                      '                ^       !'];
    const expected =    '--1-2-3---1-2-3---1-2-3-#';

    const result = source.pipe(retry(2));

    expectObservable(result).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should retry a number of times, without error, then complete', (done: MochaDone) => {
    let errors = 0;
    const retries = 2;
    Observable.create((observer: Observer<number>) => {
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

  it('should retry a number of times, then call error handler', (done: MochaDone) => {
    let errors = 0;
    const retries = 2;
    Observable.create((observer: Observer<number>) => {
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
          done("shouldn't next");
        },
        (err: any) => {
          expect(errors).to.equal(2);
          done();
        }, () => {
          done("shouldn't complete");
        });
  });

  it('should retry a number of times, then call error handler (with resetOnSuccess)', (done: MochaDone) => {
    let errors = 0;
    const retries = 2;
    Observable.create((observer: Observer<number>) => {
      observer.next(42);
      observer.complete();
    }).pipe(
      map((x: any) => {
        errors += 1;
        throw 'bad';
      }),
      retry({count: retries - 1, resetOnSuccess: true})
    ).subscribe(
      (x: number) => {
        done("shouldn't next");
      },
      (err: any) => {
        expect(errors).to.equal(2);
        done();
      }, () => {
        done("shouldn't complete");
      });
  });

  it('should retry a number of times, then call next handler without error, then retry and complete', (done: MochaDone) => {
    let index = 0;
    let errors = 0;
    const retries = 2;
    defer(() => range(0, 4 - index)).pipe(
      mergeMap(() => {
        index++;
        if (index === 1 || index === 3) {
          errors++;
          return throwError('bad');
        } else {
          return of(42);
        }
      }),
      retry({count: retries - 1, resetOnSuccess: true})
    ).subscribe(
      (x: number) => {
        expect(x).to.equal(42);
      },
      (err: any) => {
        done("shouldn't error");
      }, () => {
        expect(errors).to.equal(retries);
        done();
      });
  });

  it('should always teardown before starting the next cycle, even when synchronous', () => {
    const results: any[] = [];
    const source = new Observable<number>(subscriber => {
      subscriber.next(1);
      subscriber.next(2);
      subscriber.error('bad');
      return () => {
        results.push('teardown');
      }
    });
    const subscription = source.pipe(retry(3)).subscribe({
      next: value => results.push(value),
      error: (err) => results.push(err)
    });

    expect(subscription.closed).to.be.true;
    expect(results).to.deep.equal([1, 2, 'teardown', 1, 2, 'teardown', 1, 2, 'teardown', 1, 2, 'bad', 'teardown'])
  });

  it('should retry a number of times, then call next handler without error, then retry and error', (done: MochaDone) => {
    let index = 0;
    let errors = 0;
    const retries = 2;
    defer(() => range(0, 4 - index)).pipe(
      mergeMap(() => {
        index++;
        if (index === 1 || index === 3) {
          errors++;
          return throwError('bad');
        } else {
          return of(42);
        }
      }),
      retry({count: retries - 1, resetOnSuccess: false})
    ).subscribe(
      (x: number) => {
        expect(x).to.equal(42);
      },
      (err: any) => {
        expect(errors).to.equal(retries);
        done();
      }, () => {
        done("shouldn't complete");
      });
  });

  it('should retry until successful completion', (done: MochaDone) => {
    let errors = 0;
    const retries = 10;
    Observable.create((observer: Observer<number>) => {
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
    const source = cold('|');
    const subs =        '(^!)';
    const expected =    '|';

    const result = source.pipe(retry());

    expectObservable(result).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should handle a never source', () => {
    const source = cold('-');
    const subs =        '^';
    const expected =    '-';

    const result = source.pipe(retry());

    expectObservable(result).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should return a never observable given an async just-throw source and no count', () => {
    const source = cold('-#'); // important that it's not a sync error
    const unsub =       '                                     !';
    const expected =    '--------------------------------------';

    const result = source.pipe(retry());

    expectObservable(result, unsub).toBe(expected);
  });

  it('should handle a basic source that emits next then completes', () => {
    const source = hot('--1--2--^--3--4--5---|');
    const subs =               '^            !';
    const expected =           '---3--4--5---|';

    const result = source.pipe(retry());

    expectObservable(result).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should handle a basic source that emits next but does not complete', () => {
    const source = hot('--1--2--^--3--4--5---');
    const subs =               '^            ';
    const expected =           '---3--4--5---';

    const result = source.pipe(retry());

    expectObservable(result).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should handle a basic source that emits next then errors, no count', () => {
    const source = cold('--1-2-3-#');
    const unsub =       '                                     !';
    const subs =       ['^       !                             ',
                      '        ^       !                     ',
                      '                ^       !             ',
                      '                        ^       !     ',
                      '                                ^    !'];
    const expected =    '--1-2-3---1-2-3---1-2-3---1-2-3---1-2-';

    const result = source.pipe(retry());

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should handle a source which eventually throws, count=3, and result is ' +
  'unsubscribed early', () => {
    const source = cold('--1-2-3-#');
    const unsub =       '             !           ';
    const subs =       ['^       !                ',
                      '        ^    !           '];
    const expected =    '--1-2-3---1-2-';

    const result = source.pipe(retry(3));

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should not break unsubscription chain when unsubscribed explicitly', () => {
    const source = cold('--1-2-3-#');
    const subs =       ['^       !                ',
                      '        ^    !           '];
    const expected =    '--1-2-3---1-2-';
    const unsub =       '             !           ';

    const result = source.pipe(
      mergeMap((x: string) => of(x)),
      retry(100),
      mergeMap((x: string) => of(x))
    );

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should retry a synchronous source (multicasted and refCounted) multiple times', (done: MochaDone) => {
    const expected = [1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3];

    of(1, 2, 3).pipe(
      concat(throwError('bad!')),
      multicast(() => new Subject<number>()),
      refCount(),
      retry(4)
    ).subscribe(
        (x: number) => { expect(x).to.equal(expected.shift()); },
        (err: any) => {
          expect(err).to.equal('bad!');
          expect(expected.length).to.equal(0);
          done();
        }, () => {
          done(new Error('should not be called'));
        });
  });

  it('should stop listening to a synchronous observable when unsubscribed', () => {
    const sideEffects: number[] = [];
    const synchronousObservable = new Observable<number>(subscriber => {
      // This will check to see if the subscriber was closed on each loop
      // when the unsubscribe hits (from the `take`), it should be closed
      for (let i = 0; !subscriber.closed && i < 10; i++) {
        sideEffects.push(i);
        subscriber.next(i);
      }
    });

    synchronousObservable.pipe(
      retry(1),
      take(3),
    ).subscribe(() => { /* noop */ });

    expect(sideEffects).to.deep.equal([0, 1, 2]);
  });
});
