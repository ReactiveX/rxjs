import { expect } from 'chai';
import * as sinon from 'sinon';
import { animationFrameScheduler, Subscription } from 'rxjs';

const animationFrame = animationFrameScheduler;

/** @test {Scheduler} */
describe('Scheduler.animationFrame', () => {
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

  it('should cancel animationFrame actions when unsubscribed', () => {
    let actionHappened = false;
    const sandbox = sinon.sandbox.create();
    const fakeTimer = sandbox.useFakeTimers();
    animationFrame.schedule(() => {
      actionHappened = true;
    }, 50).unsubscribe();
    expect(actionHappened).to.be.false;
    fakeTimer.tick(25);
    expect(actionHappened).to.be.false;
    fakeTimer.tick(25);
    expect(actionHappened).to.be.false;
    sandbox.restore();
  });

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
});
