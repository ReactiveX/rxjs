/* globals describe, it, expect, spyOn */
import * as Rx from '../../dist/cjs/Rx.KitchenSink';
declare const {expectObservable};
import {DoneSignature} from '../helpers/test-helper';

declare const rxTestScheduler: Rx.TestScheduler;
const Observable = Rx.Observable;

/** @test {interval} */
describe('Observable.interval', () => {
  it('should set up an interval', () => {
    const expected = '----------0---------1---------2---------3---------4---------5---------6-----';
    expectObservable(Observable.interval(100, rxTestScheduler)).toBe(expected, [0, 1, 2, 3, 4, 5, 6]);
  });

  it('should specify default scheduler if incorrect scheduler specified', () => {
    const scheduler = (<any>Observable.interval(10, <any>jasmine.createSpy('dummy'))).scheduler;

    expect(scheduler).toBe(Rx.Scheduler.async);
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

  it('should emit values until unsubscribed', (done: DoneSignature) => {
    const values = [];
    const expected = [0, 1, 2, 3, 4, 5, 6];
    const e1 = Observable.interval(5);
    const subscription = e1.subscribe((x: number) => {
      values.push(x);
      if (x === 6) {
        subscription.unsubscribe();
        expect(values).toEqual(expected);
        done();
      }
    }, (err: any) => {
      done.fail('should not be called');
    }, () => {
      done.fail('should not be called');
    });
  });
});
