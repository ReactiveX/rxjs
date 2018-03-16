import { expect } from 'chai';
import * as sinon from 'sinon';
import * as Rx from 'rxjs/Rx';

declare const process: any;
const Observable = Rx.Observable;

/** @test {fromPromise} */
describe('Observable.fromPromise', () => {
  it('should emit one value from a resolved promise', (done) => {
    const promise = Promise.resolve(42);
    Observable.fromPromise(promise)
      .subscribe(
        (x) => { expect(x).to.equal(42); },
        (x) => {
          done(new Error('should not be called'));
        }, () => {
          done();
        });
  });

  it('should raise error from a rejected promise', (done) => {
    const promise = Promise.reject('bad');
    Observable.fromPromise(promise)
      .subscribe((x) => {
          done(new Error('should not be called'));
        },
        (e) => {
          expect(e).to.equal('bad');
          done();
        }, () => {
         done(new Error('should not be called'));
       });
  });

  it('should share the underlying promise with multiple subscribers', (done) => {
    const promise = Promise.resolve(42);
    const observable = Observable.fromPromise(promise);

    observable
      .subscribe(
        (x) => { expect(x).to.equal(42); },
        (x) => {
          done(new Error('should not be called'));
        }, null);
    setTimeout(() => {
      observable
        .subscribe(
          (x) => { expect(x).to.equal(42); },
          (x) => {
            done(new Error('should not be called'));
          }, () => {
            done();
          });
    });
  });

  it('should accept already-resolved Promise', (done) => {
    const promise = Promise.resolve(42);
    promise.then((x) => {
      expect(x).to.equal(42);
      Observable.fromPromise(promise)
        .subscribe(
          (y) => { expect(y).to.equal(42); },
          (x) => {
            done(new Error('should not be called'));
          }, () => {
            done();
          });
    }, () => {
      done(new Error('should not be called'));
    });
  });

  it('should accept PromiseLike object for interoperability', (done) => {
    class CustomPromise<T> implements PromiseLike<T> {
      constructor(private promise: PromiseLike<T>) {
      }
      then<TResult1 = T, TResult2 = T>(
        onFulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
        onRejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): PromiseLike<TResult1 | TResult2> {
        return new CustomPromise(this.promise.then(onFulfilled, onRejected));
      }
    }
    const promise = new CustomPromise(Promise.resolve(42));
    Observable.fromPromise(promise)
      .subscribe(
        (x) => { expect(x).to.equal(42); },
        () => {
          done(new Error('should not be called'));
        }, () => {
          done();
        });
  });

  it('should emit a value from a resolved promise on a separate scheduler', (done) => {
    const promise = Promise.resolve(42);
    Observable.fromPromise(promise, Rx.Scheduler.asap)
      .subscribe(
        (x) => { expect(x).to.equal(42); },
        (x) => {
          done(new Error('should not be called'));
        }, () => {
          done();
        });
  });

  it('should raise error from a rejected promise on a separate scheduler', (done) => {
    const promise = Promise.reject('bad');
    Observable.fromPromise(promise, Rx.Scheduler.asap)
      .subscribe(
        (x) => { done(new Error('should not be called')); },
        (e) => {
          expect(e).to.equal('bad');
          done();
        }, () => {
          done(new Error('should not be called'));
        });
  });

  it('should share the underlying promise with multiple subscribers on a separate scheduler', (done) => {
    const promise = Promise.resolve(42);
    const observable = Observable.fromPromise(promise, Rx.Scheduler.asap);

    observable
      .subscribe(
        (x) => { expect(x).to.equal(42); },
        (x) => {
          done(new Error('should not be called'));
        },
        null);
    setTimeout(() => {
      observable
        .subscribe(
          (x) => { expect(x).to.equal(42); },
          (x) => {
            done(new Error('should not be called'));
          }, () => {
            done();
          });
    });
  });

  it('should not emit, throw or complete if immediately unsubscribed', (done) => {
    const nextSpy = sinon.spy();
    const throwSpy = sinon.spy();
    const completeSpy = sinon.spy();
    const promise = Promise.resolve(42);
    const subscription = Observable.fromPromise(promise)
      .subscribe(nextSpy, throwSpy, completeSpy);
    subscription.unsubscribe();

    setTimeout(() => {
      expect(nextSpy).not.have.been.called;
      expect(throwSpy).not.have.been.called;
      expect(completeSpy).not.have.been.called;
      done();
    });
  });
});
