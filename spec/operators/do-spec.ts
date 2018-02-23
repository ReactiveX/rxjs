import { expect } from 'chai';
import * as Rx from '../../src/Rx';
import { hot, cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';

declare function asDiagram(arg: string): Function;

const Observable = Rx.Observable;
const Subject = Rx.Subject;

/** @test {do} */
describe('Observable.prototype.do', () => {
  asDiagram('do(x => console.log(x))')
  ('should mirror multiple values and complete', () => {
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
    Observable.throwError('bad').do(null, function (x) {
      err = x;
    })
    .subscribe(null, function (ex) {
      expect(ex).to.equal('bad');
    });

    expect(err).to.equal('bad');
  });

  it('should handle everything with an observer', (done) => {
    const expected = [1, 2, 3];
    const results: number[] = [];

    Observable.of(1, 2, 3)
      .do({
        next: (x) => {
          results.push(x);
        },
        error: (err) => {
          done(new Error('should not be called'));
        },
        complete: () => {
          expect(results).to.deep.equal(expected);
          done();
        }
      }).subscribe();
  });

  it('should handle everything with a Subject', (done) => {
    const expected = [1, 2, 3];
    const results: number[] = [];
    const subject = new Subject<number>();

    subject.subscribe({
      next: (x) => {
        results.push(x);
      },
      error: (err) => {
        done(new Error('should not be called'));
      },
      complete: () => {
        expect(results).to.deep.equal(expected);
        done();
      }
    });

    Observable.of(1, 2, 3)
      .do(subject)
      .subscribe();
  });

  it('should handle an error with a callback', () => {
    let errored = false;
    Observable.throwError('bad').do(null, (err) => {
      expect(err).to.equal('bad');
    })
    .subscribe(null, (err) => {
      errored = true;
      expect(err).to.equal('bad');
    });

    expect(errored).to.be.true;
  });

  it('should handle an error with observer', () => {
    let errored = false;
    Observable.throwError('bad').do({ error: function (err) {
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

    Observable.empty().do({
      complete: () => {
        completed = true;
      }
    }).subscribe();

    expect(completed).to.be.true;
  });

  it('should handle next with observer', () => {
    let value = null;

    Observable.of('hi').do({
      next: (x) => {
        value = x;
      }
    }).subscribe();

    expect(value).to.equal('hi');
  });

  it('should raise error if next handler raises error', () => {
    Observable.of('hi').do({
      next: (x) => {
        throw new Error('bad');
      }
    }).subscribe(null, (err) => {
      expect(err.message).to.equal('bad');
    });
  });

  it('should raise error if error handler raises error', () => {
    Observable.throwError('ops').do({
      error: (x) => {
        throw new Error('bad');
      }
    }).subscribe(null, (err) => {
      expect(err.message).to.equal('bad');
    });
  });

  it('should raise error if complete handler raises error', () => {
    Observable.empty().do({
      complete: () => {
        throw new Error('bad');
      }
    }).subscribe(null, (err) => {
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
      .mergeMap((x) => Observable.of(x))
      .do(() => {
        //noop
      })
      .mergeMap((x) => Observable.of(x));

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
