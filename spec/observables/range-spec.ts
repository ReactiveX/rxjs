import {expect} from 'chai';
import * as sinon from 'sinon';
import * as Rx from '../../dist/cjs/Rx';
import {RangeObservable} from '../../dist/cjs/observable/RangeObservable';
import marbleTestingSignature = require('../helpers/marble-testing'); // tslint:disable-line:no-require-imports

declare const { asDiagram };
declare const expectObservable: typeof marbleTestingSignature.expectObservable;

declare const rxTestScheduler: Rx.TestScheduler;
const Observable = Rx.Observable;
const asap = Rx.Scheduler.asap;

/** @test {range} */
describe('Observable.range', () => {
  asDiagram('range(1, 10)')('should create an observable with numbers 1 to 10', () => {
    const e1 = Observable.range(1, 10)
      // for the purpose of making a nice diagram, spread out the synchronous emissions
      .concatMap((x, i) => Observable.of(x).delay(i === 0 ? 0 : 20, rxTestScheduler));
    const expected = 'a-b-c-d-e-f-g-h-i-(j|)';
    const values = {
      a: 1,
      b: 2,
      c: 3,
      d: 4,
      e: 5,
      f: 6,
      g: 7,
      h: 8,
      i: 9,
      j: 10,
    };
    expectObservable(e1).toBe(expected, values);
  });

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
    it('should complete if index >= count', () => {
      const o = new Rx.Subscriber();
      const obj: Rx.Subscriber<any> = <any>sinon.stub(o);

      const state = {
        subscriber: obj,
        index: 10,
        start: 0,
        count: 9
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
        count: 9
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