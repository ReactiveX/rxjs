import { expect } from 'chai';
import * as sinon from 'sinon';
import { animationFrameScheduler, Subscription } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { observableMatcher } from 'spec/helpers/observableMatcher';

const animationFrame = animationFrameScheduler;

declare const globalThis: NodeJS.Global | Window;

/** @test {Scheduler} */
describe('Scheduler.animationFrame', () => {
  let testScheduler: TestScheduler;

  const ROOT = (typeof globalThis !== 'undefined' && globalThis)
    || (typeof global !== 'undefined' && global)
    || (typeof window !== 'undefined' && window)
    || (typeof self !== 'undefined' && self);

  beforeEach(() => {
    testScheduler = new TestScheduler(observableMatcher);
  });


  it('should exist', () => {
    expect(animationFrame).exist;
  });

  it('should act like the async scheduler if delay > 0', () => {
    let actionHappened = false;
    const sandbox = sinon.sandbox.create();
    const fakeTimer = sandbox.useFakeTimers();
    animationFrame.schedule(() => {
      actionHappened = true;
    }, 50);
    expect(actionHappened).to.be.false;
    fakeTimer.tick(25);
    expect(actionHappened).to.be.false;
    fakeTimer.tick(25);
    expect(actionHappened).to.be.true;
    sandbox.restore();
  });

  // This test not supported in 6.x (ported from cherry-pick).

  // it('should cancel animationFrame actions when delay > 0', () => {
  //   testScheduler.run(({ animate, cold, expectObservable, flush }) => {
  //     const requestSpy = sinon.spy(ROOT, 'requestAnimationFrame');
  //     const setSpy = sinon.spy(ROOT, 'setInterval');
  //     const clearSpy = sinon.spy(ROOT, 'clearInterval');

  //     animate('         ----------x--');
  //     const a = cold('  a            ');
  //     const ta = 4;
  //     const subs = '    ^-!          ';
  //     const expected = '-------------';

  //     const result = merge(
  //       a.pipe(delay(ta, animationFrame))
  //     );
  //     expectObservable(result, subs).toBe(expected);

  //     flush();
  //     expect(requestSpy).to.have.not.been.called;
  //     expect(setSpy).to.have.been.calledOnce;
  //     expect(clearSpy).to.have.been.calledOnce;
  //     requestSpy.restore();
  //     setSpy.restore();
  //     clearSpy.restore();
  //   });
  // });

  it('should schedule an action to happen later', (done: MochaDone) => {
    let actionHappened = false;
    animationFrame.schedule(() => {
      actionHappened = true;
      done();
    });
    if (actionHappened) {
      done(new Error('Scheduled action happened synchronously'));
    }
  });

  it('should execute recursively scheduled actions in separate asynchronous contexts', (done: MochaDone) => {
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

  it('should cancel the animation frame if all scheduled actions unsubscribe before it executes', (done: MochaDone) => {
    let animationFrameExec1 = false;
    let animationFrameExec2 = false;
    const action1 = animationFrame.schedule(() => { animationFrameExec1 = true; });
    const action2 = animationFrame.schedule(() => { animationFrameExec2 = true; });
    expect(animationFrame.scheduled).to.exist;
    expect(animationFrame.actions.length).to.equal(2);
    action1.unsubscribe();
    action2.unsubscribe();
    expect(animationFrame.actions.length).to.equal(0);
    expect(animationFrame.scheduled).to.equal(undefined);
    animationFrame.schedule(() => {
      expect(animationFrameExec1).to.equal(false);
      expect(animationFrameExec2).to.equal(false);
      done();
    });
  });

  it('should execute the rest of the scheduled actions if the first action is canceled', (done: MochaDone) => {
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

  if ('cancelAnimationFrame' in ROOT) {
    it('should properly cancel an unnecessary flush', (done) => {
      const sandbox = sinon.createSandbox();
      const cancelAnimationFrameStub = sandbox.stub(ROOT, 'cancelAnimationFrame').callThrough();

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
  }
});
