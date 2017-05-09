import {expect} from 'chai';
import * as sinon from 'sinon';
import * as Rx from '../dist/cjs/Rx';

const Subscriber = Rx.Subscriber;

/** @test {Subscriber} */
describe('Subscriber', () => {
  describe('when created through create()', () => {
    it('should not call error() if next() handler throws an error', () => {
      const errorSpy = sinon.spy();
      const completeSpy = sinon.spy();

      const subscriber = Subscriber.create(
        (value: any) => {
          if (value === 2) {
            throw 'error!';
          }
        },
        errorSpy,
        completeSpy
      );

      subscriber.next(1);
      expect(() => {
        subscriber.next(2);
      }).to.throw('error!');

      expect(errorSpy).not.have.been.called;
      expect(completeSpy).not.have.been.called;
    });
  });

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
});
