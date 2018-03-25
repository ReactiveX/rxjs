import { expect } from 'chai';
import * as sinon from 'sinon';
import * as Rx from 'rxjs/Rx';
import { Symbol_reportError } from '../src/internal/Subscriber';
import { noop } from '../src/internal/util/noop';

const Subscriber = Rx.Subscriber;

/** @test {Subscriber} */
describe('Subscriber', () => {
  it('should ignore next messages after unsubscription', () => {
    let times = 0;

    const sub = new Subscriber({
      next() { times += 1; }
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

    const sub = new Subscriber({
      next() { times += 1; },
      error() { errorCalled = true; }
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

    const sub = new Subscriber({
      next() { times += 1; },
      complete() { completeCalled = true; }
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
      next: function () { /*noop*/ }
    };

    const sub1 = new Subscriber(observer);
    const sub2 = new Subscriber(observer);

    sub2.complete();

    expect(sub1.closed).to.be.false;
    expect(sub2.closed).to.be.true;
  });

  it('should call complete observer without any arguments', () => {
    let argument: Array<any> = null;

    const observer = {
      complete: (...args: Array<any>) => {
        argument = args;
      }
    };

    const sub1 = new Subscriber(observer);
    sub1.complete();

    expect(argument).to.have.lengthOf(0);
  });

  describe('reportError', () => {
    it('should call error for an unstopped subscriber', () => {
      const reported = new Error('Kaboom!');
      let received: any;
      const subscriber = new Rx.Subscriber(undefined, err => received = err);
      subscriber[Symbol_reportError](reported);
      expect(received).to.equal(reported);
      expect(subscriber).to.have.property('isStopped', true);
    });

    it('should call error on the root subscriber to chain calls to destinations', () => {
      const reported = new Error('Kaboom!');
      let received: any;
      const destination = new Rx.Subscriber(undefined, err => received = err);
      const subscriber = new Rx.Subscriber(destination);
      const spy = sinon.spy(subscriber, 'error');
      subscriber[Symbol_reportError](reported);
      expect(received).to.equal(reported);
      expect(subscriber).to.have.property('isStopped', true);
      expect(destination).to.have.property('isStopped', true);
      expect(spy).to.have.property('callCount', 1);
      spy.restore();
    });

    describe('useDeprecatedSynchronousErrorHandling === false', () => {
      let stubSetTimeout: any;
      beforeEach(() => {
        stubSetTimeout = sinon.stub(global, 'setTimeout');
      });

      it('should call hostReportError for a stopped subscriber', () => {
        const reported = new Error('Kaboom!');
        const subscriber = new Rx.Subscriber(undefined, err => { throw new Error('should not be called'); });
        subscriber.complete();
        subscriber[Symbol_reportError](reported);
        expect(stubSetTimeout).to.have.property('callCount', 1);
        const [[func]] = stubSetTimeout.args;
        expect(func).to.throw('Kaboom!');
        expect(subscriber).to.have.property('isStopped', true);
      });

      it('should call hostReportError for a stopped destination subscriber', () => {
        const reported = new Error('Kaboom!');
        const destination = new Rx.Subscriber(undefined, err => { throw new Error('should not be called'); });
        const subscriber = new Rx.Subscriber(destination);
        destination.complete();
        subscriber[Symbol_reportError](reported);
        expect(stubSetTimeout).to.have.property('callCount', 1);
        const [[func]] = stubSetTimeout.args;
        expect(func).to.throw('Kaboom!');
        expect(subscriber).to.have.property('isStopped', true);
        expect(destination).to.have.property('isStopped', true);
      });

      afterEach(() => {
        stubSetTimeout.restore();
      });
    });

    describe('useDeprecatedSynchronousErrorHandling === true', () => {
      beforeEach(() => {
        const _warn = console.warn;
        console.warn = noop;
        Rx.config.useDeprecatedSynchronousErrorHandling = true;
        console.warn = _warn;
      });

      it('should rethrow the error for a stopped subscriber', () => {
        const reported = new Error('Kaboom!');
        const subscriber = new Rx.Subscriber(undefined, err => { throw new Error('should not be called'); });
        subscriber.complete();
        expect(() => subscriber[Symbol_reportError](reported)).to.throw('Kaboom!');
        expect(subscriber).to.have.property('isStopped', true);
      });

      it('should rethrow the error for a stopped destination subscriber', () => {
        const reported = new Error('Kaboom!');
        const destination = new Rx.Subscriber(undefined, err => { throw new Error('should not be called'); });
        const subscriber = new Rx.Subscriber(destination);
        destination.complete();
        expect(() => subscriber[Symbol_reportError](reported)).to.throw('Kaboom!');
        expect(subscriber).to.have.property('isStopped', true);
        expect(destination).to.have.property('isStopped', true);
      });

      afterEach(() => {
        const _log = console.log;
        console.log = noop;
        Rx.config.useDeprecatedSynchronousErrorHandling = false;
        console.log = _log;
      });
    });
  });
});
