import {expect} from 'chai';
import * as sinon from 'sinon';
import * as Rx from '../../dist/cjs/Rx';
import {ScalarObservable} from '../../dist/cjs/observable/ScalarObservable';

declare const rxTestScheduler: Rx.TestScheduler;

describe('ScalarObservable', () => {
  it('should create expose a value property', () => {
    const s = new ScalarObservable(1);
    expect(s.value).to.equal(1);
  });

  it('should create ScalarObservable via static create function', () => {
    const s = new ScalarObservable(1);
    const r = ScalarObservable.create(1);

    expect(s).to.deep.equal(r);
  });

  it('should not schedule further if subscriber unsubscribed', () => {
    const schedulerMock = sinon.stub(rxTestScheduler);
    const s = new ScalarObservable(1, schedulerMock as any);
    const subscriber = new Rx.Subscriber();
    s.subscribe(subscriber);
    subscriber.unsubscribe();
    rxTestScheduler.flush();

    expect((schedulerMock as any).schedule).calledOnce;
  });

  it('should set `_isScalar` to true when NOT called with a Scheduler', () => {
    const s = new ScalarObservable(1);
    expect(s._isScalar).to.be.true;
  });

  it('should set `_isScalar` to false when called with a Scheduler', () => {
    const s = new ScalarObservable(1, rxTestScheduler);
    expect(s._isScalar).to.be.false;
  });
});