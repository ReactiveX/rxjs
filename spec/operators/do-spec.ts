import {expect} from 'chai';
import * as Rx from '../../dist/cjs/Rx';
import marbleTestingSignature = require('../helpers/marble-testing'); // tslint:disable-line:no-require-imports

declare const { asDiagram };
declare const hot: typeof marbleTestingSignature.hot;
declare const cold: typeof marbleTestingSignature.cold;
declare const expectObservable: typeof marbleTestingSignature.expectObservable;
declare const expectSubscriptions: typeof marbleTestingSignature.expectSubscriptions;

const Observable = Rx.Observable;
const Subject = Rx.Subject;

/** @test {do} */
describe('Observable.prototype.do', () => {
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

    expect(value).to.equal(42);
  });

  it('should error with a callback', () => {
    let err = null;
    Observable.throw('bad').do(null, function (x) {
      err = x;
    })
    .subscribe(null, function (ex) {
      expect(ex).to.equal('bad');
    });

    expect(err).to.equal('bad');
  });

  it('should handle everything with an observer', (done: MochaDone) => {
    const expected = [1, 2, 3];
    const results = [];

    Observable.of(1, 2, 3)
      .do(<Rx.Observer<number>>{
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
      }).subscribe();
  });

  it('should handle everything with a Subject', (done: MochaDone) => {
    const expected = [1, 2, 3];
    const results = [];
    const subject = new Subject();

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

    Observable.of(1, 2, 3)
      .do(<Rx.Observer<number>>subject)
      .subscribe();
  });

  it('should handle an error with a callback', () => {
    let errored = false;
    Observable.throw('bad').do(null, (err: any) => {
      expect(err).to.equal('bad');
    })
    .subscribe(null, (err: any) => {
      errored = true;
      expect(err).to.equal('bad');
    });

    expect(errored).to.be.true;
  });

  it('should handle an error with observer', () => {
    let errored = false;
    Observable.throw('bad').do(<any>{ error: function (err) {
      expect(err).to.equal('bad');
    } })
    .subscribe(null, function (err) {
      errored = true;
      expect(err).to.equal('bad');
    });

    expect(errored).to.be.true;
  });

  it('should handle complete with observer', () => {
    let completed = false;

    Observable.empty().do(<any>{
      complete: () => {
        completed = true;
      }
    }).subscribe();

    expect(completed).to.be.true;
  });

  it('should handle next with observer', () => {
    let value = null;

    Observable.of('hi').do(<any>{
      next: (x: string) => {
        value = x;
      }
    }).subscribe();

    expect(value).to.equal('hi');
  });

  it('should raise error if next handler raises error', () => {
    Observable.of('hi').do(<any>{
      next: (x: string) => {
        throw new Error('bad');
      }
    }).subscribe(null, (err: any) => {
      expect(err.message).to.equal('bad');
    });
  });

  it('should raise error if error handler raises error', () => {
    Observable.throw('ops').do(<any>{
      error: (x: any) => {
        throw new Error('bad');
      }
    }).subscribe(null, (err: any) => {
      expect(err.message).to.equal('bad');
    });
  });

  it('should raise error if complete handler raises error', () => {
    Observable.empty().do(<any>{
      complete: () => {
        throw new Error('bad');
      }
    }).subscribe(null, (err: any) => {
      expect(err.message).to.equal('bad');
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
