/** @prettier */
import { expect } from 'chai';
import { NEVER, interval, asapScheduler, animationFrameScheduler, queueScheduler } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { take } from 'rxjs/operators';
import * as sinon from 'sinon';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {interval} */
describe('interval', () => {
  let rxTestScheduler: TestScheduler;

  beforeEach(() => {
    rxTestScheduler = new TestScheduler(observableMatcher);
  });

  it('should set up an interval', () => {
    rxTestScheduler.run(({ expectObservable, time }) => {
      const period = time('----------|                                                                 ');
      //                             ----------|
      //                                       ----------|
      //                                                 ----------|
      //                                                           ----------|
      //                                                                     ----------|
      //                                                                               ----------|
      const unsubs = '     ---------------------------------------------------------------------------!';
      const expected = '   ----------0---------1---------2---------3---------4---------5---------6-----';
      expectObservable(interval(period), unsubs).toBe(expected, [0, 1, 2, 3, 4, 5, 6]);
    });
  });

  it('should emit when relative interval set to zero', () => {
    rxTestScheduler.run(({ expectObservable, time }) => {
      const period = time('|         ');
      const expected = '   (0123456|)';

      const e1 = interval(period).pipe(take(7));
      expectObservable(e1).toBe(expected, [0, 1, 2, 3, 4, 5, 6]);
    });
  });

  it('should consider negative interval as zero', () => {
    rxTestScheduler.run(({ expectObservable }) => {
      const expected = '(0123456|)';
      const e1 = interval(-1).pipe(take(7));
      expectObservable(e1).toBe(expected, [0, 1, 2, 3, 4, 5, 6]);
    });
  });

  it('should emit values until unsubscribed', (done) => {
    const values: number[] = [];
    const expected = [0, 1, 2, 3, 4, 5, 6];
    const e1 = interval(5);
    const subscription = e1.subscribe({
      next: (x: number) => {
        values.push(x);
        if (x === 6) {
          subscription.unsubscribe();
          expect(values).to.deep.equal(expected);
          done();
        }
      },
      error: (err: any) => {
        done(new Error('should not be called'));
      },
      complete: () => {
        done(new Error('should not be called'));
      },
    });
  });

  it('should create an observable emitting periodically with the AsapScheduler', (done) => {
    const sandbox = sinon.createSandbox();
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
        expect(asapScheduler._scheduled).to.equal(undefined);
        sandbox.restore();
        done();
      },
    });
    let i = -1;
    const n = events.length;
    while (++i < n) {
      fakeTimer.tick(period);
    }
  });

  it('should create an observable emitting periodically with the QueueScheduler', (done) => {
    const sandbox = sinon.createSandbox();
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
        expect(queueScheduler._scheduled).to.equal(undefined);
        sandbox.restore();
        done();
      },
    });
    let i = -1;
    const n = events.length;
    while (++i < n) {
      fakeTimer.tick(period);
    }
  });

  it('should create an observable emitting periodically with the AnimationFrameScheduler', (done) => {
    const sandbox = sinon.createSandbox();
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
        expect(animationFrameScheduler._scheduled).to.equal(undefined);
        sandbox.restore();
        done();
      },
    });
    let i = -1;
    const n = events.length;
    while (++i < n) {
      fakeTimer.tick(period);
    }
  });
});
