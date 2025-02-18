import { expect } from 'chai';
import * as sinon from 'sinon';
import { animationFrameScheduler, Subscription, merge } from 'rxjs';
import { delay } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { observableMatcher } from '../helpers/observableMatcher';
import { animationFrameProvider } from 'rxjs/internal/scheduler/animationFrameProvider';
import { intervalProvider } from 'rxjs/internal/scheduler/intervalProvider';

const animationFrame = animationFrameScheduler;

/** @test {Scheduler} */
describe('Scheduler.animationFrame', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(observableMatcher);
  });

  it('should exist', () => {
    expect(animationFrame).exist;
  });

  it('should act like the async scheduler if delay > 0', () => {
    testScheduler.run(({ animate, cold, expectObservable, time }) => {
      animate('         ----------x--');
      const a = cold('  a            ');
      const ta = time(' ----|        ');
      const b = cold('  b            ');
      const tb = time(' --------|    ');
      const expected = '----a---b----';

      const result = merge(
        a.pipe(delay(ta, animationFrame)),
        b.pipe(delay(tb, animationFrame))
      );
      expectObservable(result).toBe(expected);
    });
  });

  it('should cancel animationFrame actions when delay > 0', () => {
    testScheduler.run(({ animate, cold, expectObservable, flush, time }) => {
      const requestSpy = sinon.spy(animationFrameProvider, 'requestAnimationFrame');
      const setSpy = sinon.spy(intervalProvider, 'setInterval');
      const clearSpy = sinon.spy(intervalProvider, 'clearInterval');

      animate('         ----------x--');
      const a = cold('  a            ');
      const ta = time(' ----|        ');
      const subs = '    ^-!          ';
      const expected = '-------------';

      const result = merge(
        a.pipe(delay(ta, animationFrame))
      );
      expectObservable(result, subs).toBe(expected);

      flush();
      expect(requestSpy).to.have.not.been.called;
      expect(setSpy).to.have.been.calledOnce;
      expect(clearSpy).to.have.been.calledOnce;
      requestSpy.restore();
      setSpy.restore();
      clearSpy.restore();
    });
  });

  it('should schedule an action to happen later', (done) => {
    let actionHappened = false;
    animationFrame.schedule(() => {
      actionHappened = true;
      done();
    });
    if (actionHappened) {
      done(new Error('Scheduled action happened synchronously'));
    }
  });

  it('should execute recursively scheduled actions in separate asynchronous contexts', (done) => {
    let syncExec1 = true;
    let syncExec2 = true;
    animationFrame.schedule(function (index) {
      if (index === 0) {
        this.schedule(1);
        animationFrame.schedule(() => { syncExec1 = false; });
      } else if (index === 1) {
        this.schedule(2);
        animationFrame.schedule(() => { syncExec2 = false; });
      } else if (index === 2) {
        this.schedule(3);
      } else if (index === 3) {
        if (!syncExec1 && !syncExec2) {
          done();
        } else {
          done(new Error('Execution happened synchronously.'));
        }
      }
    }, 0, 0);
  });

  it('should cancel the animation frame if all scheduled actions unsubscribe before it executes', (done) => {
    let animationFrameExec1 = false;
    let animationFrameExec2 = false;
    const action1 = animationFrame.schedule(() => { animationFrameExec1 = true; });
    const action2 = animationFrame.schedule(() => { animationFrameExec2 = true; });
    expect(animationFrame._scheduled).to.exist;
    expect(animationFrame.actions.length).to.equal(2);
    action1.unsubscribe();
    action2.unsubscribe();
    expect(animationFrame.actions.length).to.equal(0);
    expect(animationFrame._scheduled).to.equal(undefined);
    animationFrame.schedule(() => {
      expect(animationFrameExec1).to.equal(false);
      expect(animationFrameExec2).to.equal(false);
      done();
    });
  });

  it('should execute the rest of the scheduled actions if the first action is canceled', (done) => {
    let actionHappened = false;
    let secondSubscription: Subscription | null = null;

    const firstSubscription = animationFrame.schedule(() => {
      actionHappened = true;
      if (secondSubscription) {
        secondSubscription.unsubscribe();
      }
      done(new Error('The first action should not have executed.'));
    });

    secondSubscription = animationFrame.schedule(() => {
      if (!actionHappened) {
        done();
      }
    });

    if (actionHappened) {
      done(new Error('Scheduled action happened synchronously'));
    } else {
      firstSubscription.unsubscribe();
    }
  });

  it('should schedule next frame actions from a delayed one', (done) => {
    animationFrame.schedule(() => {
      animationFrame.schedule(() => { done(); });
    }, 1);
  });

  it('should schedule 2 actions for a subsequent frame', (done) => {
    let runFirst = false;
    animationFrame.schedule(() => {
      animationFrame.schedule(() => { runFirst = true; });
      animationFrame.schedule(() => {
        if (runFirst) {
          done();
        } else {
          done(new Error('First action did not run'));
        }
      });
    });
  });

  it('should handle delayed action without affecting next frame actions', (done) => {
    let runDelayed = false;
    let runFirst = false;
    animationFrame.schedule(() => {
      animationFrame.schedule(() => {
        if (!runDelayed) {
          done(new Error('Delayed action did not run'));
          return;
        }
        runFirst = true;
      });
      animationFrame.schedule(() => {
        if (!runFirst) {
          done(new Error('First action did not run'));
        } else {
          done();
        }
      });

      // This action will execute before the next frame because the delay is less than the one of the frame
      animationFrame.schedule(() => {
        runDelayed = true;
      }, 1);
    });
  });

  it('should not execute rescheduled actions when flushing', (done) => {
    let flushCount = 0;
    let scheduledIndices: number[] = [];

    let originalFlush = animationFrame.flush;
    animationFrame.flush = (...args) => {
      ++flushCount;
      originalFlush.apply(animationFrame, args);
      if (flushCount === 2) {
        animationFrame.flush = originalFlush;
        try {
          expect(scheduledIndices).to.deep.equal([0, 1]);
          done();
        } catch (error) {
          done(error);
        }
      }
    };

    animationFrame.schedule(function (index) {
      if (flushCount < 2) {
        this.schedule(index! + 1);
        scheduledIndices.push(index! + 1);
      }
    }, 0, 0);
    scheduledIndices.push(0);
  });

  it('should execute actions scheduled when flushing in a subsequent flush', (done) => {
    const sandbox = sinon.createSandbox();
    const stubFlush = (sandbox.stub(animationFrameScheduler, 'flush')).callThrough();

    let a: Subscription;
    let b: Subscription;
    let c: Subscription;

    a = animationFrameScheduler.schedule(() => {
      expect(stubFlush).to.have.callCount(1);
      c = animationFrameScheduler.schedule(() => {
        expect(stubFlush).to.have.callCount(2);
        sandbox.restore();
        done();
      });
    });
    b = animationFrameScheduler.schedule(() => {
      expect(stubFlush).to.have.callCount(1);
    });
  });

  it('should execute actions scheduled when flushing in a subsequent flush when some actions are unsubscribed', (done) => {
    const sandbox = sinon.createSandbox();
    const stubFlush = (sandbox.stub(animationFrameScheduler, 'flush')).callThrough();

    let a: Subscription;
    let b: Subscription;
    let c: Subscription;

    a = animationFrameScheduler.schedule(() => {
      expect(stubFlush).to.have.callCount(1);
      c = animationFrameScheduler.schedule(() => {
        expect(stubFlush).to.have.callCount(2);
        sandbox.restore();
        done();
      });
      b.unsubscribe();
    });
    b = animationFrameScheduler.schedule(() => {
      done(new Error('Unexpected execution of b'));
    });
  });

  it('should properly cancel an unnecessary flush', (done) => {
    const sandbox = sinon.createSandbox();
    const cancelAnimationFrameStub = sandbox.stub(animationFrameProvider, 'cancelAnimationFrame').callThrough();

    let a: Subscription;
    let b: Subscription;
    let c: Subscription;

    a = animationFrameScheduler.schedule(() => {
      expect(animationFrameScheduler.actions).to.have.length(1);
      c = animationFrameScheduler.schedule(() => {
        done(new Error('Unexpected execution of c'));
      });
      expect(animationFrameScheduler.actions).to.have.length(2);
      // What we're testing here is that the unsubscription of action c effects
      // the cancellation of the animation frame in a scenario in which the
      // actions queue is not empty - it contains action b.
      c.unsubscribe();
      expect(animationFrameScheduler.actions).to.have.length(1);
      expect(cancelAnimationFrameStub).to.have.callCount(1);
    });
    b = animationFrameScheduler.schedule(() => {
      sandbox.restore();
      done();
    });
  });
});
