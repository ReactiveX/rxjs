import { expect } from 'chai';
import * as sinon from 'sinon';
import { Observable, Subscriber, asapScheduler as asap, range, of} from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { expectObservable } from '../helpers/marble-testing';
import { dispatch } from 'rxjs/observable/range';
import { concatMap, delay } from 'rxjs/operators';

declare const asDiagram: any;

declare const rxTestScheduler: TestScheduler;

/** @test {range} */
describe('range', () => {
  asDiagram('range(1, 10)')('should create an observable with numbers 1 to 10', () => {
    const e1 = range(1, 10)
      // for the purpose of making a nice diagram, spread out the synchronous emissions
      .pipe(concatMap((x, i) => of(x).pipe(delay(i === 0 ? 0 : 20, rxTestScheduler))));
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

  it('should work for two subscribers', () => {
    const e1 = range(1, 5)
      .pipe(concatMap((x, i) => of(x).pipe(delay(i === 0 ? 0 : 20, rxTestScheduler))));
    const expected = 'a-b-c-d-(e|)';
    const values = {
      a: 1,
      b: 2,
      c: 3,
      d: 4,
      e: 5
    };
    expectObservable(e1).toBe(expected, values);
    expectObservable(e1).toBe(expected, values);
  });

  it('should synchronously create a range of values by default', () => {
    const results = [] as any[];
    range(12, 4).subscribe(function (x) {
      results.push(x);
    });
    expect(results).to.deep.equal([12, 13, 14, 15]);
  });

  it('should accept a scheduler', (done: MochaDone) => {
    const expected = [12, 13, 14, 15];
    sinon.spy(asap, 'schedule');

    const source = range(12, 4, asap);

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

  it('should accept only one argument where count is argument and start is zero', () => {
    const e1 = range(5)
      .pipe(concatMap((x, i) => of(x).pipe(delay(i === 0 ? 0 : 20, rxTestScheduler))));
    const expected = 'a-b-c-d-(e|)';
    const values = {
      a: 0,
      b: 1,
      c: 2,
      d: 3,
      e: 4
    };
    expectObservable(e1).toBe(expected, values);
    expectObservable(e1).toBe(expected, values);
  });
});

describe('RangeObservable', () => {
  describe('dispatch', () => {
    it('should complete if index >= count', () => {
      const o = new Subscriber();
      const obj: Subscriber<any> = <any>sinon.stub(o);

      const state = {
        subscriber: obj,
        index: 10,
        start: 0,
        count: 9
      };

      dispatch.call({}, state);

      expect(state.subscriber.complete).have.been.called;
      expect(state.subscriber.next).not.have.been.called;
    });

    it('should next out another value and increment the index and start', () => {
      const o = new Subscriber();
      const obj: Subscriber<any> = <any>sinon.stub(o);

      const state = {
        subscriber: obj,
        index: 1,
        start: 5,
        count: 9
      };

      const thisArg = {
        schedule: sinon.spy()
      };

      dispatch.call(thisArg, state);

      expect(state.subscriber.complete).not.have.been.called;
      expect(state.subscriber.next).have.been.calledWith(5);
      expect(state.start).to.equal(6);
      expect(state.index).to.equal(2);
      expect(thisArg.schedule).have.been.calledWith(state);
    });
  });
});
