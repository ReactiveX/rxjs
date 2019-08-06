import { expect } from 'chai';
import { expectObservable } from '../helpers/marble-testing';
import { NEVER, interval, asapScheduler, Observable, animationFrameScheduler, queueScheduler } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { take, concat } from 'rxjs/operators';
import * as sinon from 'sinon';

declare const asDiagram: any;
declare const rxTestScheduler: TestScheduler;

/** @test {interval} */
describe('interval', () => {
  asDiagram('interval(1000)')('should create an observable emitting periodically', () => {
    const e1 = interval(20, rxTestScheduler).pipe(
      take(6), // make it actually finite, so it can be rendered
      concat(NEVER) // but pretend it's infinite by not completing
    );
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
    expectObservable(interval(100, rxTestScheduler)).toBe(expected, [0, 1, 2, 3, 4, 5, 6]);
  });

  it('should emit when relative interval set to zero', () => {
    const e1 = interval(0, rxTestScheduler).pipe(take(7));
    const expected = '(0123456|)';
    expectObservable(e1).toBe(expected, [0, 1, 2, 3, 4, 5, 6]);
  });

  it('should consider negative interval as zero', () => {
    const e1 = interval(-1, rxTestScheduler).pipe(take(7));
    const expected = '(0123456|)';
    expectObservable(e1).toBe(expected, [0, 1, 2, 3, 4, 5, 6]);
  });

  it('should emit values until unsubscribed', (done: MochaDone) => {
    const values: number[] = [];
    const expected = [0, 1, 2, 3, 4, 5, 6];
    const e1 = interval(5);
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
    const period = 10;
    const events = [0, 1, 2, 3, 4, 5];
    const source = interval(period, asapScheduler).pipe(take(6));
    source.subscribe({
      next(x) {
        expect(x).to.equal(events.shift());
      },
      error(e) {
        sandbox.restore();
        done(e);
      },
      complete() {
        expect(asapScheduler.actions.length).to.equal(0);
        expect(asapScheduler.scheduled).to.equal(undefined);
        sandbox.restore();
        done();
      }
    });
    let i = -1, n = events.length;
    while (++i < n) {
      fakeTimer.tick(period);
    }
  });

  it('should create an observable emitting periodically with the QueueScheduler', (done: MochaDone) => {
    const sandbox = sinon.sandbox.create();
    const fakeTimer = sandbox.useFakeTimers();
    const period = 10;
    const events = [0, 1, 2, 3, 4, 5];
    const source = interval(period, queueScheduler).pipe(take(6));
    source.subscribe({
      next(x) {
        expect(x).to.equal(events.shift());
      },
      error(e) {
        sandbox.restore();
        done(e);
      },
      complete() {
        expect(queueScheduler.actions.length).to.equal(0);
        expect(queueScheduler.scheduled).to.equal(undefined);
        sandbox.restore();
        done();
      }
    });
    let i = -1, n = events.length;
    while (++i < n) {
      fakeTimer.tick(period);
    }
  });

  it('should create an observable emitting periodically with the AnimationFrameScheduler', (done: MochaDone) => {
    const sandbox = sinon.sandbox.create();
    const fakeTimer = sandbox.useFakeTimers();
    const period = 10;
    const events = [0, 1, 2, 3, 4, 5];
    const source = interval(period, animationFrameScheduler).pipe(take(6));
    source.subscribe({
      next(x) {
        expect(x).to.equal(events.shift());
      },
      error(e) {
        sandbox.restore();
        done(e);
      },
      complete() {
        expect(animationFrameScheduler.actions.length).to.equal(0);
        expect(animationFrameScheduler.scheduled).to.equal(undefined);
        sandbox.restore();
        done();
      }
    });
    let i = -1, n = events.length;
    while (++i < n) {
      fakeTimer.tick(period);
    }
  });
});
