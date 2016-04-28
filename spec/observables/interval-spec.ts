import {expect} from 'chai';
import * as sinon from 'sinon';
import * as Rx from '../../dist/cjs/Rx';

declare const {hot, asDiagram, expectObservable, expectSubscriptions};
declare const rxTestScheduler: Rx.TestScheduler;
const Observable = Rx.Observable;

/** @test {interval} */
describe('Observable.interval', () => {
  asDiagram('interval(1000)')('should create an observable emitting periodically', () => {
    const e1 = Observable.interval(20, rxTestScheduler)
      .take(6) // make it actually finite, so it can be rendered
      .concat(Observable.never()); // but pretend it's infinite by not completing
    const expected = '--a-b-c-d-e-f-';
    const values = {
      a: 0,
      b: 1,
      c: 2,
      d: 3,
      e: 4,
      f: 5,
    };
    expectObservable(e1).toBe(expected, values);
  });

  it('should set up an interval', () => {
    const expected = '----------0---------1---------2---------3---------4---------5---------6-----';
    expectObservable(Observable.interval(100, rxTestScheduler)).toBe(expected, [0, 1, 2, 3, 4, 5, 6]);
  });

  it('should specify default scheduler if incorrect scheduler specified', () => {
    const scheduler = (<any>Observable.interval(10, <any>sinon.stub())).scheduler;

    expect(scheduler).to.equal(Rx.Scheduler.async);
  });

  it('should emit when relative interval set to zero', () => {
    const e1 = Observable.interval(0, rxTestScheduler).take(7);
    const expected = '(0123456|)';

    expectObservable(e1).toBe(expected, [0, 1, 2, 3, 4, 5, 6]);
  });

  it('should consider negative interval as zero', () => {
    const e1 = Observable.interval(-1, rxTestScheduler).take(7);
    const expected = '(0123456|)';

    expectObservable(e1).toBe(expected, [0, 1, 2, 3, 4, 5, 6]);
  });

  it('should emit values until unsubscribed', (done: MochaDone) => {
    const values = [];
    const expected = [0, 1, 2, 3, 4, 5, 6];
    const e1 = Observable.interval(5);
    const subscription = e1.subscribe((x: number) => {
      values.push(x);
      if (x === 6) {
        subscription.unsubscribe();
        expect(values).to.deep.equal(expected);
        done();
      }
    }, (err: any) => {
      done(new Error('should not be called'));
    }, () => {
      done(new Error('should not be called'));
    });
  });
});
