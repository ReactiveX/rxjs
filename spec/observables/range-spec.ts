import * as Rx from '../../dist/cjs/Rx';
import {RangeObservable} from '../../dist/cjs/observable/RangeObservable';
import {DoneSignature} from '../helpers/test-helper';

const Observable = Rx.Observable;
const asap = Rx.Scheduler.asap;

/** @test {range} */
describe('Observable.range', () => {
  it('should synchronously create a range of values by default', () => {
    const results = [];
    Observable.range(12, 4).subscribe(function (x) {
      results.push(x);
    });
    expect(results).toEqual([12, 13, 14, 15]);
  });

  it('should accept a scheduler', (done: DoneSignature) => {
    const expected = [12, 13, 14, 15];
    spyOn(asap, 'schedule').and.callThrough();

    const source = Observable.range(12, 4, asap);

    expect((<any>source).scheduler).toBe(asap);

    source.subscribe(function (x) {
      expect(asap.schedule).toHaveBeenCalled();
      const exp = expected.shift();
      expect(x).toBe(exp);
    }, function (x) {
      done.fail('should not be called');
    }, done);
  });
});

describe('RangeObservable', () => {
  describe('create', () => {
    it('should create a RangeObservable', () => {
      const observable = RangeObservable.create(12, 4);
      expect(observable instanceof RangeObservable).toBe(true);
    });

    it('should accept a scheduler', () => {
      const observable = RangeObservable.create(12, 4, asap);
      expect((<any>observable).scheduler).toBe(asap);
    });
  });

  describe('dispatch', () => {
    it('should complete if index >= end', () => {
      const obj: Rx.Subscriber<any> = jasmine.createSpyObj('subscriber', ['next', 'error', 'complete']);
      const state = {
        subscriber: obj,
        index: 10,
        start: 0,
        end: 9
      };

      RangeObservable.dispatch(state);

      expect(state.subscriber.complete).toHaveBeenCalled();
      expect(state.subscriber.next).not.toHaveBeenCalled();
    });

    it('should next out another value and increment the index and start', () => {
      const obj: Rx.Subscriber<any> = jasmine.createSpyObj('subscriber', ['next', 'error', 'complete']);
      const state = {
        subscriber: obj,
        index: 1,
        start: 5,
        end: 9
      };

      const thisArg = {
        schedule: jasmine.createSpy('schedule')
      };

      RangeObservable.dispatch.call(thisArg, state);

      expect(state.subscriber.complete).not.toHaveBeenCalled();
      expect(state.subscriber.next).toHaveBeenCalledWith(5);
      expect(state.start).toBe(6);
      expect(state.index).toBe(2);
      expect(thisArg.schedule).toHaveBeenCalledWith(state);
    });
  });
});