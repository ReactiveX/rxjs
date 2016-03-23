import * as Rx from '../../dist/cjs/Rx';
import {DoneSignature} from '../helpers/test-helper';

declare const process: any;
const Observable = Rx.Observable;

/** @test {fromPromise} */
describe('Observable.fromPromise', () => {
  it('should emit one value from a resolved promise', (done: DoneSignature) => {
    const promise = Promise.resolve(42);
    Observable.fromPromise(promise)
      .subscribe(
        (x: number) => { expect(x).toBe(42); },
        (x) => {
          done.fail('should not be called');
        }, () => {
          done();
        });
  });

  it('should raise error from a rejected promise', (done: DoneSignature) => {
    const promise = Promise.reject('bad');
    Observable.fromPromise(promise)
      .subscribe((x: any) => {
          done.fail('should not be called');
        },
        (e: any) => {
          expect(e).toBe('bad');
          done();
        }, () => {
         done.fail('should not be called');
       });
  });

  it('should share the underlying promise with multiple subscribers', (done: DoneSignature) => {
    const promise = Promise.resolve(42);
    const observable = Observable.fromPromise(promise);

    observable
      .subscribe(
        (x: number) => { expect(x).toBe(42); },
        (x) => {
          done.fail('should not be called');
        }, null);
    setTimeout(() => {
      observable
        .subscribe(
          (x: number) => { expect(x).toBe(42); },
          (x) => {
            done.fail('should not be called');
          }, () => {
            done();
          });
    });
  });

  it('should accept already-resolved Promise', (done: DoneSignature) => {
    const promise = Promise.resolve(42);
    promise.then((x: number) => {
      expect(x).toBe(42);
      Observable.fromPromise(promise)
        .subscribe(
          (y: number) => { expect(y).toBe(42); },
          (x) => {
            done.fail('should not be called');
          }, () => {
            done();
          });
    }, () => {
      done.fail('should not be called');
    });
  });

  it('should emit a value from a resolved promise on a separate scheduler', (done: DoneSignature) => {
    const promise = Promise.resolve(42);
    Observable.fromPromise(promise, Rx.Scheduler.asap)
      .subscribe(
        (x: number) => { expect(x).toBe(42); },
        (x) => {
          done.fail('should not be called');
        }, () => {
          done();
        });
  });

  it('should raise error from a rejected promise on a separate scheduler', (done: DoneSignature) => {
    const promise = Promise.reject('bad');
    Observable.fromPromise(promise, Rx.Scheduler.asap)
      .subscribe(
        (x: any) => { done.fail('should not be called'); },
        (e: any) => {
          expect(e).toBe('bad');
          done();
        }, () => {
          done.fail('should not be called');
        });
  });

  it('should share the underlying promise with multiple subscribers on a separate scheduler', (done: DoneSignature) => {
    const promise = Promise.resolve(42);
    const observable = Observable.fromPromise(promise, Rx.Scheduler.asap);

    observable
      .subscribe(
        (x: number) => { expect(x).toBe(42); },
        (x) => {
          done.fail('should not be called');
        },
        null);
    setTimeout(() => {
      observable
        .subscribe(
          (x: number) => { expect(x).toBe(42); },
          (x) => {
            done.fail('should not be called');
          }, () => {
            done();
          });
    });
  });

  it('should not emit, throw or complete if immediately unsubscribed', (done: DoneSignature) => {
    const nextSpy = jasmine.createSpy('next');
    const throwSpy = jasmine.createSpy('throw');
    const completeSpy = jasmine.createSpy('complete');
    const promise = Promise.resolve(42);
    const subscription = Observable.fromPromise(promise)
      .subscribe(nextSpy, throwSpy, completeSpy);
    subscription.unsubscribe();

    setTimeout(() => {
      expect(nextSpy).not.toHaveBeenCalled();
      expect(throwSpy).not.toHaveBeenCalled();
      expect(completeSpy).not.toHaveBeenCalled();
      done();
    });
  });

  if (typeof process === 'object' && Object.prototype.toString.call(process) === '[object process]') {
    it('should globally throw unhandled errors on process', (done: DoneSignature) => {
      let invoked = false;
      process.on('uncaughtException', function (reason, p) {
        if (invoked) {
          return;
        }
        invoked = true;
        expect(reason).toBe('fail');
        done();
      });

      Observable.fromPromise(Promise.reject('bad'))
        .subscribe(
          (x: any) => { done.fail('should not be called'); },
          (e: any) => {
            expect(e).toBe('bad');
            throw 'fail';
          }, () => {
            done.fail('should not be called');
          });
    });
  } else if (typeof window === 'object' && Object.prototype.toString.call(window) === '[object global]') {
    it('should globally throw unhandled errors on window', (done: DoneSignature) => {
      let invoked = false;
      function onException(e) {
        if (invoked) {
          return;
        }
        invoked = true;
        expect(e).toBe('Uncaught fail');
        done();
      }

      window.onerror = onException;

      Observable.fromPromise(Promise.reject('bad'))
        .subscribe(
          (x: any) => { done.fail('should not be called'); },
          (e: any) => {
            expect(e).toBe('bad');
            throw 'fail';
          }, () => {
            done.fail('should not be called');
          });
    });
  }
});