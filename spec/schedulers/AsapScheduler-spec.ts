import { expect } from 'chai';
import * as sinon from 'sinon';
import { asapScheduler, Subscription } from 'rxjs';

/** @test {asapScheduler} */
describe('asapScheduler', () => {
  let sandbox: sinon.SinonSandbox;
  let fakeTimer: sinon.SinonFakeTimers;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    fakeTimer = sandbox.useFakeTimers();
  });

  afterEach(() => {
    fakeTimer.restore();
    sandbox.restore();
  });

  it('should exist', () => {
    expect(asapScheduler).exist;
  });

  it('should act like the async scheduler if delay > 0', () => {
    let actionHappened = false;
    asapScheduler.schedule(() => {
      actionHappened = true;
    }, 50);
    expect(actionHappened).to.be.false;
    fakeTimer.tick(25);
    expect(actionHappened).to.be.false;
    fakeTimer.tick(25);
    expect(actionHappened).to.be.true;
  });

  it('should cancel asap actions when delay > 0', () => {
    let actionHappened = false;
    asapScheduler.schedule(() => {
      actionHappened = true;
    }, 50).unsubscribe();
    expect(actionHappened).to.be.false;
    fakeTimer.tick(25);
    expect(actionHappened).to.be.false;
    fakeTimer.tick(25);
    expect(actionHappened).to.be.false;
  });

  it('should schedule an action to happen later', (done: MochaDone) => {
    let actionHappened = false;
    asapScheduler.schedule(() => {
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
        asapScheduler.schedule(work, 0, 1);
        asapScheduler.schedule(() => { syncExec1 = false; });
      } else if (index === 1) {
        asapScheduler.schedule(work, 0, 2);
        asapScheduler.schedule(() => { syncExec2 = false; });
      } else if (index === 2) {
        asapScheduler.schedule(work, 0, 3);
      } else if (index === 3) {
        if (!syncExec1 && !syncExec2) {
          done();
        } else {
          done(new Error('Execution happened synchronously.'));
        }
      }
    }
    asapScheduler.schedule(work, 0, 0);
  });

  it('should cancel the setImmediate if all scheduled actions unsubscribe before it executes', (done: MochaDone) => {
    let asapExec1 = false;
    let asapExec2 = false;
    const subs1 = asapScheduler.schedule(() => { asapExec1 = true; });
    const subs2 = asapScheduler.schedule(() => { asapExec2 = true; });
    subs1.unsubscribe();
    subs2.unsubscribe();
    asapScheduler.schedule(() => {
      expect(asapExec1).to.equal(false);
      expect(asapExec2).to.equal(false);
      done();
    });
  });

  it('should execute the rest of the scheduled actions if the first action is canceled', (done: MochaDone) => {
    let actionHappened = false;
    let secondSubscription: Subscription | null = null;

    const firstSubscription = asapScheduler.schedule(() => {
      actionHappened = true;
      if (secondSubscription) {
        secondSubscription.unsubscribe();
      }
      done(new Error('The first action should not have executed.'));
    });

    secondSubscription = asapScheduler.schedule(() => {
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
