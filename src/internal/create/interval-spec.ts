import { expect } from 'chai';
import { NEVER, interval, asapScheduler, Observable, animationFrameScheduler, queueScheduler } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { take, concatWith } from 'rxjs/operators';
import * as sinon from 'sinon';
import { assertDeepEquals } from '../test_helpers/assertDeepEquals';

declare const testScheduler: TestScheduler;

/** @test {interval} */
describe('interval', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(assertDeepEquals);
  });

  //asDiagram('interval(1000)')
  it('should create an observable emitting periodically', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = interval(2, testScheduler).pipe(
        take(6), // make it actually finite, so it can be rendered
        concatWith(NEVER) // but pretend it's infinite by not completing
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
  });

  it('should set up an interval', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const expected = '----------0---------1---------2---------3---------4---------5---------6-----';
      const subs =     '^--------------------------------------------------------------------------!';
      expectObservable(interval(10, testScheduler), subs).toBe(expected, [0, 1, 2, 3, 4, 5, 6]);
    });
  });

  it('should emit when relative interval set to zero', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = interval(0, testScheduler).pipe(take(7));
      const expected = '(0123456|)';
      expectObservable(e1).toBe(expected, [0, 1, 2, 3, 4, 5, 6]);
    });
  });

  it('should consider negative interval as zero', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = interval(-1, testScheduler).pipe(take(7));
      const expected = '(0123456|)';
      expectObservable(e1).toBe(expected, [0, 1, 2, 3, 4, 5, 6]);
    });
  });

  it('should emit values until unsubscribed', done => {
    const values: number[] = [];
    const expected = [0, 1, 2, 3, 4, 5, 6];
    const e1 = interval(5);
    const subscription = e1.subscribe({
      next: x => {
        values.push(x);
        if (x === 6) {
          subscription.unsubscribe();
          expect(values).to.deep.equal(expected);
          done();
        }
      },
      error: () => {
        done(new Error('should not be called'));
      },
      complete: () => {
        done(new Error('should not be called'));
      }
    });
  });

  it('should create an observable emitting periodically with the AsapScheduler', done => {
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
        sandbox.restore();
        done();
      }
    });
    let i = -1, n = events.length;
    while (++i < n) {
      fakeTimer.tick(period);
    }
  });

  it('should create an observable emitting periodically with the QueueScheduler', done => {
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
        sandbox.restore();
        done();
      }
    });
    let i = -1, n = events.length;
    while (++i < n) {
      fakeTimer.tick(period);
    }
  });

  // TODO: Find better stubs for testing rAF in Node

  // it('should create an observable emitting periodically with the AnimationFrameScheduler', done => {
  //   const sandbox = sinon.createSandbox();
  //   const fakeTimer = sandbox.useFakeTimers();
  //   const period = 10;
  //   const events = [0, 1, 2, 3, 4, 5];
  //   const source = interval(period, animationFrameScheduler).pipe(take(6));
  //   source.subscribe({
  //     next(x) {
  //       expect(x).to.equal(events.shift());
  //     },
  //     error(e) {
  //       sandbox.restore();
  //       done(e);
  //     },
  //     complete() {
  //       sandbox.restore();
  //       done();
  //     }
  //   });
  //   let i = -1, n = events.length;
  //   while (++i < n) {
  //     fakeTimer.tick(period);
  //   }
  // });
});
