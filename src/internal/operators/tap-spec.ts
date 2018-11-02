import { expect } from 'chai';
import { tap, mergeMap } from 'rxjs/operators';
import { Subject, of, throwError, Observer, EMPTY } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { assertDeepEquals } from '../test_helpers/assertDeepEquals';

/** @test {tap} */
describe('tap operator', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(assertDeepEquals);
  });

  //asDiagram('tap(x => console.log(x))')
  it('should mirror multiple values and complete', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =  cold('--1--2--3--|');
      const e1subs =   '^          !';
      const expected = '--1--2--3--|';

      const result = e1.pipe(tap(() => {
        //noop
      }));
      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should next with a callback', () => {
    let value = null;
    of(42).pipe(tap(function (x) {
      value = x;
    }))
    .subscribe();

    expect(value).to.equal(42);
  });

  it('should error with a callback', () => {
    let err = null;
    throwError('bad').pipe(tap(null, function (x) {
      err = x;
    }))
    .subscribe(null, function (ex) {
      expect(ex).to.equal('bad');
    });

    expect(err).to.equal('bad');
  });

  it('should handle everything with an observer', (done: MochaDone) => {
    const expected = [1, 2, 3];
    const results: number[] = [];

    of(1, 2, 3).pipe(
      tap(<Observer<number>>{
        next: (x: number) => {
          results.push(x);
        },
        error: (err: any) => {
          done(new Error('should not be called'));
        },
        complete: () => {
          expect(results).to.deep.equal(expected);
          done();
        }
      })).subscribe();
  });

  it('should handle everything with a Subject', (done: MochaDone) => {
    const expected = [1, 2, 3];
    const results: number[] = [];
    const subject = new Subject<number>();

    subject.subscribe({
      next: (x: any) => {
        results.push(x);
      },
      error: (err: any) => {
        done(new Error('should not be called'));
      },
      complete: () => {
        expect(results).to.deep.equal(expected);
        done();
      }
    });

    debugger;
    of(1, 2, 3).pipe(
      tap(subject)
    ).subscribe();
  });

  it('should handle an error with a callback', () => {
    let errored = false;
    throwError('bad').pipe(tap(null, (err: any) => {
      expect(err).to.equal('bad');
    }))
    .subscribe(null, (err: any) => {
      errored = true;
      expect(err).to.equal('bad');
    });

    expect(errored).to.be.true;
  });

  it('should handle an error with observer', () => {
    let errored = false;
    throwError('bad').pipe(tap(<any>{ error: function (err: string) {
      expect(err).to.equal('bad');
    } }))
    .subscribe(null, function (err) {
      errored = true;
      expect(err).to.equal('bad');
    });

    expect(errored).to.be.true;
  });

  it('should handle complete with observer', () => {
    let completed = false;

    EMPTY.pipe(tap(<any>{
      complete: () => {
        completed = true;
      }
    })).subscribe();

    expect(completed).to.be.true;
  });

  it('should handle next with observer', () => {
    let value = null;

    of('hi').pipe(tap(<any>{
      next: (x: string) => {
        value = x;
      }
    })).subscribe();

    expect(value).to.equal('hi');
  });

  it('should raise error if next handler raises error', () => {
    of('hi').pipe(tap(<any>{
      next: (x: string) => {
        throw new Error('bad');
      }
    })).subscribe(null, (err: any) => {
      expect(err.message).to.equal('bad');
    });
  });

  it('should raise error if error handler raises error', () => {
    throwError('ops').pipe(tap(<any>{
      error: (x: any) => {
        throw new Error('bad');
      }
    })).subscribe(null, (err: any) => {
      expect(err.message).to.equal('bad');
    });
  });

  it('should raise error if complete handler raises error', () => {
    EMPTY.pipe(tap(<any>{
      complete: () => {
        throw new Error('bad');
      }
    })).subscribe(null, (err: any) => {
      expect(err.message).to.equal('bad');
    });
  });

  it('should allow unsubscribing explicitly and early', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('--1--2--3--#');
      const unsub =    '       !    ';
      const e1subs =   '^      !    ';
      const expected = '--1--2--    ';

      const result = e1.pipe(tap(() => {
        //noop
      }));
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('--1--2--3--#');
      const e1subs =   '^      !    ';
      const expected = '--1--2--    ';
      const unsub =    '       !    ';

      const result = e1.pipe(
        mergeMap((x: any) => of(x)),
        tap(() => {
          //noop
        }),
        mergeMap((x: any) => of(x))
      );

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should mirror multiple values and complete', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =  cold('--1--2--3--|');
      const e1subs =   '^          !';
      const expected = '--1--2--3--|';

      const result = e1.pipe(tap(() => {
        //noop
      }));
      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should mirror multiple values and terminate with error', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =  cold('--1--2--3--#');
      const e1subs =   '^          !';
      const expected = '--1--2--3--#';

      const result = e1.pipe(tap(() => {
        //noop
      }));
      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });
});
