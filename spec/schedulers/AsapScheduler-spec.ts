import { expect } from 'chai';
import * as sinon from 'sinon';
import { asapScheduler, Subscription } from 'rxjs';

const asap = asapScheduler;

/** @test {Scheduler} */
describe('Scheduler.asap', () => {
  it('should exist', () => {
    expect(asap).exist;
  });

  it('should act like the async scheduler if delay > 0', () => {
    let actionHappened = false;
    const sandbox = sinon.sandbox.create();
    const fakeTimer = sandbox.useFakeTimers();
    asap.schedule(() => {
      actionHappened = true;
    }, 50);
    expect(actionHappened).to.be.false;
    fakeTimer.tick(25);
    expect(actionHappened).to.be.false;
    fakeTimer.tick(25);
    expect(actionHappened).to.be.true;
    sandbox.restore();
  });

  it('should cancel asap actions when delay > 0', () => {
    let actionHappened = false;
    const sandbox = sinon.sandbox.create();
    const fakeTimer = sandbox.useFakeTimers();
    asap.schedule(() => {
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
    asap.schedule(() => {
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
    function work(index: number) {
      if (index === 0) {
        asap.schedule(work, 0, 1);
        asap.schedule(() => { syncExec1 = false; });
      } else if (index === 1) {
        asap.schedule(work, 0, 2);
        asap.schedule(() => { syncExec2 = false; });
      } else if (index === 2) {
        asap.schedule(work, 0, 3);
      } else if (index === 3) {
        if (!syncExec1 && !syncExec2) {
          done();
        } else {
          done(new Error('Execution happened synchronously.'));
        }
      }
    }
    asap.schedule(work, 0, 0);
  });

  it('should cancel the setImmediate if all scheduled actions unsubscribe before it executes', (done: MochaDone) => {
    let asapExec1 = false;
    let asapExec2 = false;
    const subs1 = asap.schedule(() => { asapExec1 = true; });
    const subs2 = asap.schedule(() => { asapExec2 = true; });
    subs1.unsubscribe();
    subs2.unsubscribe();
    asap.schedule(() => {
      expect(asapExec1).to.equal(false);
      expect(asapExec2).to.equal(false);
      done();
    });
  });

  it('should execute the rest of the scheduled actions if the first action is canceled', (done: MochaDone) => {
    let actionHappened = false;
    let secondSubscription: Subscription | null = null;

    const firstSubscription = asap.schedule(() => {
      actionHappened = true;
      if (secondSubscription) {
        secondSubscription.unsubscribe();
      }
      done(new Error('The first action should not have executed.'));
    });

    secondSubscription = asap.schedule(() => {
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
