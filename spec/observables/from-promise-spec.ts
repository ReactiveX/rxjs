import {expect} from 'chai';
import * as sinon from 'sinon';
import * as Rx from '../../dist/cjs/Rx';

declare const process: any;
const Observable = Rx.Observable;

/** @test {fromPromise} */
describe('Observable.fromPromise', () => {
  it('should emit one value from a resolved promise', (done: MochaDone) => {
    const promise = Promise.resolve(42);
    Observable.fromPromise(promise)
      .subscribe(
        (x: number) => { expect(x).to.equal(42); },
        (x) => {
          done(new Error('should not be called'));
        }, () => {
          done();
        });
  });

  it('should raise error from a rejected promise', (done: MochaDone) => {
    const promise = Promise.reject('bad');
    Observable.fromPromise(promise)
      .subscribe((x: any) => {
          done(new Error('should not be called'));
        },
        (e: any) => {
          expect(e).to.equal('bad');
          done();
        }, () => {
         done(new Error('should not be called'));
       });
  });

  it('should share the underlying promise with multiple subscribers', (done: MochaDone) => {
    const promise = Promise.resolve(42);
    const observable = Observable.fromPromise(promise);

    observable
      .subscribe(
        (x: number) => { expect(x).to.equal(42); },
        (x) => {
          done(new Error('should not be called'));
        }, null);
    setTimeout(() => {
      observable
        .subscribe(
          (x: number) => { expect(x).to.equal(42); },
          (x) => {
            done(new Error('should not be called'));
          }, () => {
            done();
          });
    });
  });

  it('should accept already-resolved Promise', (done: MochaDone) => {
    const promise = Promise.resolve(42);
    promise.then((x: number) => {
      expect(x).to.equal(42);
      Observable.fromPromise(promise)
        .subscribe(
          (y: number) => { expect(y).to.equal(42); },
          (x) => {
            done(new Error('should not be called'));
          }, () => {
            done();
          });
    }, () => {
      done(new Error('should not be called'));
    });
  });

  it('should accept PromiseLike object for interoperability', (done: MochaDone) => {
    class CustomPromise<T> implements PromiseLike<T> {
      constructor(private promise: PromiseLike<T>) {
      }
      then(onFulfilled?, onRejected?): PromiseLike<T> {
        return new CustomPromise(this.promise.then(onFulfilled, onRejected));
      };
    }
    const promise = new CustomPromise(Promise.resolve(42));
    Observable.fromPromise(promise)
      .subscribe(
        (x: number) => { expect(x).to.equal(42); },
        () => {
          done(new Error('should not be called'));
        }, () => {
          done();
        });
  });

  it('should emit a value from a resolved promise on a separate scheduler', (done: MochaDone) => {
    const promise = Promise.resolve(42);
    Observable.fromPromise(promise, Rx.Scheduler.asap)
      .subscribe(
        (x: number) => { expect(x).to.equal(42); },
        (x) => {
          done(new Error('should not be called'));
        }, () => {
          done();
        });
  });

  it('should raise error from a rejected promise on a separate scheduler', (done: MochaDone) => {
    const promise = Promise.reject('bad');
    Observable.fromPromise(promise, Rx.Scheduler.asap)
      .subscribe(
        (x: any) => { done(new Error('should not be called')); },
        (e: any) => {
          expect(e).to.equal('bad');
          done();
        }, () => {
          done(new Error('should not be called'));
        });
  });

  it('should share the underlying promise with multiple subscribers on a separate scheduler', (done: MochaDone) => {
    const promise = Promise.resolve(42);
    const observable = Observable.fromPromise(promise, Rx.Scheduler.asap);

    observable
      .subscribe(
        (x: number) => { expect(x).to.equal(42); },
        (x) => {
          done(new Error('should not be called'));
        },
        null);
    setTimeout(() => {
      observable
        .subscribe(
          (x: number) => { expect(x).to.equal(42); },
          (x) => {
            done(new Error('should not be called'));
          }, () => {
            done();
          });
    });
  });

  it('should not emit, throw or complete if immediately unsubscribed', (done: MochaDone) => {
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

  if (typeof process === 'object' && Object.prototype.toString.call(process) === '[object process]') {
    it('should globally throw unhandled errors on process', (done: MochaDone) => {
        const originalException = process.listeners('uncaughtException');
        process.removeAllListeners('uncaughtException');
        process.once('uncaughtException', function (error) {
            expect(error).to.be.an('error', 'fail');
            originalException.forEach(l => process.addListener('uncaughtException', l));
            done();
        });

        Observable.fromPromise(Promise.reject('bad'))
          .subscribe(
            (x: any) => { done(new Error('should not be called')); },
            (e: any) => {
              expect(e).to.equal('bad');
              throw new Error('fail');
            }, () => {
              done(new Error('should not be called'));
            });
    });
  } else if (typeof window === 'object' &&
    (Object.prototype.toString.call(window) === '[object global]' || Object.prototype.toString.call(window) === '[object Window]')) {
    it('should globally throw unhandled errors on window', (done: MochaDone) => {
      const expected = ['Uncaught fail', 'fail', 'Script error.', 'uncaught exception: fail'];
      const current = window.onerror;
      window.onerror = null;

      let invoked = false;
      function onException(e) {
        if (invoked) {
          return;
        }
        invoked = true;
        expect(expected).to.contain(e);
        window.onerror = current;
        done();
      }

      window.onerror = onException;

      Observable.fromPromise(Promise.reject('bad'))
        .subscribe(
          (x: any) => { done(new Error('should not be called')); },
          (e: any) => {
            expect(e).to.equal('bad');
            throw 'fail';
          }, () => {
            done(new Error('should not be called'));
          });
    });
  }
});