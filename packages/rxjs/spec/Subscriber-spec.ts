import { expect } from 'chai';
import type { Observer} from 'rxjs';
import { Subscriber, Observable, of, config, operate } from 'rxjs';
import * as sinon from 'sinon';
import { asInteropSubscriber } from './helpers/interop-helper';
import { getRegisteredFinalizers } from './helpers/subscription';

/** @test {Subscriber} */
describe('Subscriber', () => {
  it('should ignore next messages after unsubscription', () => {
    let times = 0;

    const sub = new Subscriber<void>({
      next() {
        times += 1;
      },
    });

    sub.next();
    sub.next();
    sub.unsubscribe();
    sub.next();

    expect(times).to.equal(2);
  });

  it('should ignore error messages after unsubscription', () => {
    let times = 0;
    let errorCalled = false;

    const sub = new Subscriber<void>({
      next() {
        times += 1;
      },
      error() {
        errorCalled = true;
      },
    });

    sub.next();
    sub.next();
    sub.unsubscribe();
    sub.next();
    sub.error();

    expect(times).to.equal(2);
    expect(errorCalled).to.be.false;
  });

  it('should ignore complete messages after unsubscription', () => {
    let times = 0;
    let completeCalled = false;

    const sub = new Subscriber<void>({
      next() {
        times += 1;
      },
      complete() {
        completeCalled = true;
      },
    });

    sub.next();
    sub.next();
    sub.unsubscribe();
    sub.next();
    sub.complete();

    expect(times).to.equal(2);
    expect(completeCalled).to.be.false;
  });

  it('should not be closed when other subscriber with same observer instance completes', () => {
    const observer = {
      next: function () {
        /*noop*/
      },
    };

    const sub1 = new Subscriber(observer);
    const sub2 = new Subscriber(observer);

    sub2.complete();

    expect(sub1.closed).to.be.false;
    expect(sub2.closed).to.be.true;
  });

  it('should call complete observer without any arguments', () => {
    let argument: Array<any> | null = null;

    const observer = {
      complete: (...args: Array<any>) => {
        argument = args;
      },
    };

    const sub1 = new Subscriber(observer);
    sub1.complete();

    expect(argument).to.have.lengthOf(0);
  });

  it('should chain interop unsubscriptions', () => {
    let observableUnsubscribed = false;
    let subscriberUnsubscribed = false;
    let subscriptionUnsubscribed = false;

    const subscriber = new Subscriber();
    subscriber.add(() => (subscriberUnsubscribed = true));

    const source = new Observable<void>(() => () => (observableUnsubscribed = true));
    const subscription = source.subscribe(asInteropSubscriber(subscriber));
    subscription.add(() => (subscriptionUnsubscribed = true));
    subscriber.unsubscribe();

    expect(observableUnsubscribed).to.be.true;
    expect(subscriberUnsubscribed).to.be.true;
    expect(subscriptionUnsubscribed).to.be.true;
  });

  it('should have idempotent unsubscription', () => {
    let count = 0;
    const subscriber = new Subscriber();
    subscriber.add(() => ++count);
    expect(count).to.equal(0);

    subscriber.unsubscribe();
    expect(count).to.equal(1);

    subscriber.unsubscribe();
    expect(count).to.equal(1);
  });

  it('should close, unsubscribe, and unregister all finalizers after complete', () => {
    let isUnsubscribed = false;
    const subscriber = new Subscriber();
    subscriber.add(() => (isUnsubscribed = true));
    subscriber.complete();
    expect(isUnsubscribed).to.be.true;
    expect(subscriber.closed).to.be.true;
    expect(getRegisteredFinalizers(subscriber).length).to.equal(0);
  });

  it('should close, unsubscribe, and unregister all finalizers after error', () => {
    let isTornDown = false;
    const subscriber = new Subscriber({
      error: () => {
        // Mischief managed!
        // Adding this handler here to prevent the call to error from
        // throwing, since it will have an error handler now.
      },
    });
    subscriber.add(() => (isTornDown = true));
    subscriber.error(new Error('test'));
    expect(isTornDown).to.be.true;
    expect(subscriber.closed).to.be.true;
    expect(getRegisteredFinalizers(subscriber).length).to.equal(0);
  });

  it('should finalize and unregister all finalizers after complete', () => {
    let isTornDown = false;
    const subscriber = new Subscriber();
    subscriber.add(() => {
      isTornDown = true;
    });
    subscriber.complete();
    expect(isTornDown).to.be.true;
    expect(getRegisteredFinalizers(subscriber).length).to.equal(0);
  });

  it('should NOT break this context on next methods from unfortunate consumers', () => {
    // This is a contrived class to illustrate that we can pass another
    // object that is "observer shaped" and not have it lose its context
    // as it would have in v5 - v6.
    class CustomConsumer {
      valuesProcessed: string[] = [];

      // In here, we access instance state and alter it.
      next(value: string) {
        if (value === 'reset') {
          this.valuesProcessed = [];
        } else {
          this.valuesProcessed.push(value);
        }
      }
    }

    const consumer = new CustomConsumer();

    of('old', 'old', 'reset', 'new', 'new').subscribe(consumer);

    expect(consumer.valuesProcessed).not.to.equal(['new', 'new']);
  });

  describe('error reporting for destination observers', () => {
    afterEach(() => {
      config.onUnhandledError = null;
    });

    it('should report errors thrown from next', (done) => {
      config.onUnhandledError = (err) => {
        expect(err).to.be.an.instanceOf(Error);
        expect(err.message).to.equal('test');
        done();
      };

      const subscriber = new Subscriber<void>({
        next() {
          throw new Error('test');
        },
      });

      subscriber.next();
    });

    it('should report errors thrown from complete', (done) => {
      config.onUnhandledError = (err) => {
        expect(err).to.be.an.instanceOf(Error);
        expect(err.message).to.equal('test');
        done();
      };

      const subscriber = new Subscriber<void>({
        complete() {
          throw new Error('test');
        },
      });

      subscriber.complete();
    });

    it('should report errors thrown from error', (done) => {
      config.onUnhandledError = (err) => {
        expect(err).to.be.an.instanceOf(Error);
        expect(err.message).to.equal('test');
        done();
      };

      const subscriber = new Subscriber<void>({
        error() {
          throw new Error('test');
        },
      });

      subscriber.error();
    });

    it('should report errors thrown from a full observer', (done) => {
      config.onUnhandledError = (err) => {
        expect(err).to.be.an.instanceOf(Error);
        expect(err.message).to.equal('thrown from next');
        done();
      };

      const subscriber = new Subscriber<void>({
        next() {
          throw new Error('thrown from next');
        },
        error() {
          throw new Error('thrown from error');
        },
        complete() {
          throw new Error('thrown from complete');
        },
      });

      subscriber.next();
    });

    it('should report errors thrown from a full observer even if it is also shaped like a subscription', (done) => {
      config.onUnhandledError = (err) => {
        expect(err).to.be.an.instanceOf(Error);
        expect(err.message).to.equal('thrown from next');
        done();
      };

      const subscriber = new Subscriber<void>({
        next() {
          throw new Error('thrown from next');
        },
        error() {
          throw new Error('thrown from error');
        },
        complete() {
          throw new Error('thrown from complete');
        },
        add() {
          // lol
        },
        remove() {
          // haha, fooled you
        },
        unsubscribe() {
          // eat it, old RxJS!
        },
        closed: false,
      });

      subscriber.next();
    });
  });

  const FinalizationRegistry = (global as any).FinalizationRegistry;
  if (FinalizationRegistry && global.gc) {
    it('should not leak the destination', (done) => {
      let observer: Observer<number> | undefined = {
        next() {
          /* noop */
        },
        error() {
          /* noop */
        },
        complete() {
          /* noop */
        },
      };

      const registry = new FinalizationRegistry((value: any) => {
        expect(value).to.equal('observer');
        done();
      });
      registry.register(observer, 'observer');

      const subscription = of(42).subscribe(observer);

      observer = undefined;
      global.gc?.();
    });
  } else {
    console.warn(`No support for FinalizationRegistry in Node ${process.version}`);
  }
});

describe('operate', () => {
  it('should create a Subscriber that passes next calls through to the destination by default', () => {
    const next = sinon.spy();
    const destination = new Subscriber<string>({
      next,
    });

    const subscriber = operate({
      destination,
    });

    subscriber.next('foo');
    expect(next).to.have.been.calledOnceWithExactly('foo');
  });

  it('should catch any errors in the next override, and pass them to the error handler on the destination', () => {
    const error = sinon.spy();
    const destination = new Subscriber<string>({
      error,
    });

    const subscriber = operate({
      destination,
      next() {
        throw 'boop!';
      },
    });

    subscriber.next('foo');
    expect(error).to.have.been.calledOnceWithExactly('boop!');
  });

  it('should pass errors passed to the result through to the destination error handler by default', () => {
    const error = sinon.spy();
    const finalizer = sinon.spy();

    const destination = new Subscriber<string>({
      error,
    });
    destination.add(finalizer);

    const subscriber = operate({
      destination,
    });

    subscriber.error('boop!');
    expect(error).to.have.been.calledOnceWithExactly('boop!');
    expect(finalizer).to.have.been.calledOnce;
  });

  it('should pass errors that are thrown by the error override through to the destination, and finalize the subscriber', () => {
    const error = sinon.spy();
    const finalizer = sinon.spy();

    const destination = new Subscriber<string>({
      error,
    });
    destination.add(finalizer);

    const subscriber = operate({
      destination,
      error() {
        throw 'boop!';
      },
    });

    subscriber.error('no boop for you');
    expect(error).to.have.been.calledOnceWithExactly('boop!');
    expect(finalizer).to.have.been.calledOnce;
  });

  it('should pass complete calls through to the destination by default', () => {
    const complete = sinon.spy();
    const finalizer = sinon.spy();

    const destination = new Subscriber<string>({
      complete,
    });
    destination.add(finalizer);

    const subscriber = operate({
      destination,
    });

    subscriber.complete();
    expect(complete).to.have.been.calledOnce;
    expect(finalizer).to.have.been.calledOnce;
  });

  it('should catch any errors in the complete override and pass them to the destination complete handler and finalize', () => {
    const complete = sinon.spy();
    const finalizer = sinon.spy();
    const error = sinon.spy();

    const destination = new Subscriber<string>({
      complete,
      error,
    });
    destination.add(finalizer);

    const subscriber = operate({
      destination,
      complete() {
        throw 'boop!';
      },
    });

    subscriber.complete();
    expect(complete).not.to.have.been.called;
    expect(finalizer).to.have.been.calledOnce;
    expect(error).to.have.been.calledOnceWithExactly('boop!');
  });

  it('should return a subscriber that, when unsubscribed, will finalize the destination', () => {
    const finalizer = sinon.spy();
    const destination = new Subscriber<string>({});
    destination.add(finalizer);

    const subscriber = operate({
      destination,
    });

    destination.unsubscribe();
    expect(finalizer).to.have.been.calledOnce;
  });
});
