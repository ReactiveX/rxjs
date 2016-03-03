import * as Rx from '../../dist/cjs/Rx';
import {hot, cold, expectObservable, expectSubscriptions} from '../helpers/marble-testing';
import {it, asDiagram, DoneSignature} from '../helpers/test-helper';

const Observable = Rx.Observable;
const Subject = Rx.Subject;

describe('Observable.prototype.do()', () => {
  asDiagram('do(x => console.log(x))')('should mirror multiple values and complete', () => {
    const e1 =  cold('--1--2--3--|');
    const e1subs =   '^          !';
    const expected = '--1--2--3--|';

    const result = e1.do(() => {
      //noop
    });
    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should next with a callback', () => {
    let value = null;
    Observable.of(42).do(function (x) {
      value = x;
    })
    .subscribe();

    expect(value).toBe(42);
  });

  it('should complete with a callback', () => {
    let err = null;
    Observable.throw('bad').do(null, function (x) {
      err = x;
    })
    .subscribe(null, function (ex) {
      expect(ex).toBe('bad');
    });

    expect(err).toBe('bad');
  });

  it('should handle everything with an observer', (done: DoneSignature) => {
    const expected = [1, 2, 3];
    const results = [];

    Observable.of(1, 2, 3)
      .do(<Rx.Observer<number>>{
        next: (x: number) => {
          results.push(x);
        },
        error: (err: any) => {
          done.fail('should not be called');
        },
        complete: () => {
          expect(results).toEqual(expected);
          done();
        }
      }).subscribe();
  });

  it('should handle everything with a Subject', (done: DoneSignature) => {
    const expected = [1, 2, 3];
    const results = [];
    const subject = new Subject();

    subject.subscribe({
      next: (x: any) => {
        results.push(x);
      },
      error: (err: any) => {
        done.fail('should not be called');
      },
      complete: () => {
        expect(results).toEqual(expected);
        done();
      }
    });

    Observable.of(1, 2, 3)
      .do(<Rx.Observer<number>>subject)
      .subscribe();
  });

  it('should handle an error with a callback', () => {
    let errored = false;
    Observable.throw('bad').do(null, (err: any) => {
      expect(err).toBe('bad');
    })
    .subscribe(null, (err: any) => {
      errored = true;
      expect(err).toBe('bad');
    });

    expect(errored).toBe(true);
  });

  it('should handle an error with observer', () => {
    let errored = false;
    Observable.throw('bad').do(<any>{ error: function (err) {
      expect(err).toBe('bad');
    } })
    .subscribe(null, function (err) {
      errored = true;
      expect(err).toBe('bad');
    });

    expect(errored).toBe(true);
  });

  it('should handle complete with observer', () => {
    let completed = false;

    Observable.empty().do(<any>{
      complete: () => {
        completed = true;
      }
    }).subscribe();

    expect(completed).toBe(true);
  });

  it('should handle next with observer', () => {
    let value = null;

    Observable.of('hi').do(<any>{
      next: (x: string) => {
        value = x;
      }
    }).subscribe();

    expect(value).toBe('hi');
  });

  it('should raise error if next handler raises error', () => {
    Observable.of('hi').do(<any>{
      next: (x: string) => {
        throw new Error('bad');
      }
    }).subscribe(null, (err: any) => {
      expect(err.message).toBe('bad');
    });
  });

  it('should raise error if error handler raises error', () => {
    Observable.throw('ops').do(<any>{
      error: (x: any) => {
        throw new Error('bad');
      }
    }).subscribe(null, (err: any) => {
      expect(err.message).toBe('bad');
    });
  });

  it('should raise error if complete handler raises error', () => {
    Observable.empty().do(<any>{
      complete: () => {
        throw new Error('bad');
      }
    }).subscribe(null, (err: any) => {
      expect(err.message).toBe('bad');
    });
  });

  it('should allow unsubscribing explicitly and early', () => {
    const e1 =   hot('--1--2--3--#');
    const unsub =    '       !    ';
    const e1subs =   '^      !    ';
    const expected = '--1--2--    ';

    const result = e1.do(() => {
      //noop
    });
    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    const e1 =   hot('--1--2--3--#');
    const e1subs =   '^      !    ';
    const expected = '--1--2--    ';
    const unsub =    '       !    ';

    const result = e1
      .mergeMap((x: any) => Observable.of(x))
      .do(() => {
        //noop
      })
      .mergeMap((x: any) => Observable.of(x));

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mirror multiple values and complete', () => {
    const e1 =  cold('--1--2--3--|');
    const e1subs =   '^          !';
    const expected = '--1--2--3--|';

    const result = e1.do(() => {
      //noop
    });
    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mirror multiple values and terminate with error', () => {
    const e1 =  cold('--1--2--3--#');
    const e1subs =   '^          !';
    const expected = '--1--2--3--#';

    const result = e1.do(() => {
      //noop
    });
    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });
});
