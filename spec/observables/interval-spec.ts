import { expect } from 'chai';
import * as sinon from 'sinon';
import * as Rx from '../../dist/package/Rx';
import marbleTestingSignature = require('../helpers/marble-testing'); // tslint:disable-line:no-require-imports

declare const { asDiagram };
declare const expectObservable: typeof marbleTestingSignature.expectObservable;

declare const rxTestScheduler: Rx.TestScheduler;
const Observable = Rx.Observable;
const asap = Rx.Scheduler.asap;
const queue = Rx.Scheduler.queue;
const animationFrame = Rx.Scheduler.animationFrame;

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

  it('should create an observable emitting periodically with the AsapScheduler', (done: MochaDone) => {
    const sandbox = sinon.sandbox.create();
    const fakeTimer = sandbox.useFakeTimers();
    const interval = 10;
    const events = [0, 1, 2, 3, 4, 5];
    const source = Observable.interval(interval, asap).take(6);
    source.subscribe({
      next(x) {
        expect(x).to.equal(events.shift());
      },
      error(e) {
        sandbox.restore();
        done(e);
      },
      complete() {
        expect(asap.actions.length).to.equal(0);
        expect(asap.scheduled).to.equal(undefined);
        sandbox.restore();
        done();
      }
    });
    let i = -1, n = events.length;
    while (++i < n) {
      fakeTimer.tick(interval);
    }
  });

  it('should create an observable emitting periodically with the QueueScheduler', (done: MochaDone) => {
    const sandbox = sinon.sandbox.create();
    const fakeTimer = sandbox.useFakeTimers();
    const interval = 10;
    const events = [0, 1, 2, 3, 4, 5];
    const source = Observable.interval(interval, queue).take(6);
    source.subscribe({
      next(x) {
        expect(x).to.equal(events.shift());
      },
      error(e) {
        sandbox.restore();
        done(e);
      },
      complete() {
        expect(queue.actions.length).to.equal(0);
        expect(queue.scheduled).to.equal(undefined);
        sandbox.restore();
        done();
      }
    });
    let i = -1, n = events.length;
    while (++i < n) {
      fakeTimer.tick(interval);
    }
  });

  it('should create an observable emitting periodically with the AnimationFrameScheduler', (done: MochaDone) => {
    const sandbox = sinon.sandbox.create();
    const fakeTimer = sandbox.useFakeTimers();
    const interval = 10;
    const events = [0, 1, 2, 3, 4, 5];
    const source = Observable.interval(interval, animationFrame).take(6);
    source.subscribe({
      next(x) {
        expect(x).to.equal(events.shift());
      },
      error(e) {
        sandbox.restore();
        done(e);
      },
      complete() {
        expect(animationFrame.actions.length).to.equal(0);
        expect(animationFrame.scheduled).to.equal(undefined);
        sandbox.restore();
        done();
      }
    });
    let i = -1, n = events.length;
    while (++i < n) {
      fakeTimer.tick(interval);
    }
  });
});
