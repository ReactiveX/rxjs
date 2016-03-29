import {expect} from 'chai';
import * as sinon from 'sinon';
import * as Rx from '../../dist/cjs/Rx';
import {RangeObservable} from '../../dist/cjs/observable/RangeObservable';

const Observable = Rx.Observable;
const asap = Rx.Scheduler.asap;

/** @test {range} */
describe('Observable.range', () => {
  it('should synchronously create a range of values by default', () => {
    const results = [];
    Observable.range(12, 4).subscribe(function (x) {
      results.push(x);
    });
    expect(results).to.deep.equal([12, 13, 14, 15]);
  });

  it('should accept a scheduler', (done: MochaDone) => {
    const expected = [12, 13, 14, 15];
    sinon.spy(asap, 'schedule');

    const source = Observable.range(12, 4, asap);

    expect((<any>source).scheduler).to.deep.equal(asap);

    source.subscribe(function (x) {
      expect(asap.schedule).have.been.called;
      const exp = expected.shift();
      expect(x).to.equal(exp);
    }, function (x) {
      done(new Error('should not be called'));
    }, () => {
      (<any>asap.schedule).restore();
      done();
    });

  });
});

describe('RangeObservable', () => {
  describe('create', () => {
    it('should create a RangeObservable', () => {
      const observable = RangeObservable.create(12, 4);
      expect(observable instanceof RangeObservable).to.be.true;
    });

    it('should accept a scheduler', () => {
      const observable = RangeObservable.create(12, 4, asap);
      expect((<any>observable).scheduler).to.deep.equal(asap);
    });
  });

  describe('dispatch', () => {
    it('should complete if index >= end', () => {
      const o = new Rx.Subscriber();
      const obj: Rx.Subscriber<any> = <any>sinon.stub(o);

      const state = {
        subscriber: obj,
        index: 10,
        start: 0,
        end: 9
      };

      RangeObservable.dispatch(state);

      expect(state.subscriber.complete).have.been.called;
      expect(state.subscriber.next).not.have.been.called;
    });

    it('should next out another value and increment the index and start', () => {
      const o = new Rx.Subscriber();
      const obj: Rx.Subscriber<any> = <any>sinon.stub(o);

      const state = {
        subscriber: obj,
        index: 1,
        start: 5,
        end: 9
      };

      const thisArg = {
        schedule: sinon.spy()
      };

      RangeObservable.dispatch.call(thisArg, state);

      expect(state.subscriber.complete).not.have.been.called;
      expect(state.subscriber.next).have.been.calledWith(5);
      expect(state.start).to.equal(6);
      expect(state.index).to.equal(2);
      expect(thisArg.schedule).have.been.calledWith(state);
    });
  });
});