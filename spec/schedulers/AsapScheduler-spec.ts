import { expect } from 'chai';
import * as sinon from 'sinon';
import { asapScheduler, Subscription, SchedulerAction } from 'rxjs';

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

  it('should reuse the interval for recursively scheduled actions with the same delay', () => {
    const sandbox = sinon.sandbox.create();
    const fakeTimer = sandbox.useFakeTimers();
    // callThrough is missing from the declarations installed by the typings tool in stable
    const stubSetInterval = (<any> sinon.stub(global, 'setInterval')).callThrough();
    const period = 50;
    const state = { index: 0, period };
    type State = typeof state;
    function dispatch(this: SchedulerAction<State>, state: State): void {
      state.index += 1;
      if (state.index < 3) {
        this.schedule(state, state.period);
      }
    }
    asap.schedule(dispatch, period, state);
    expect(state).to.have.property('index', 0);
    expect(stubSetInterval).to.have.property('callCount', 1);
    fakeTimer.tick(period);
    expect(state).to.have.property('index', 1);
    expect(stubSetInterval).to.have.property('callCount', 1);
    fakeTimer.tick(period);
    expect(state).to.have.property('index', 2);
    expect(stubSetInterval).to.have.property('callCount', 1);
    stubSetInterval.restore();
    sandbox.restore();
  });

  it('should not reuse the interval for recursively scheduled actions with a different delay', () => {
    const sandbox = sinon.sandbox.create();
    const fakeTimer = sandbox.useFakeTimers();
    // callThrough is missing from the declarations installed by the typings tool in stable
    const stubSetInterval = (<any> sinon.stub(global, 'setInterval')).callThrough();
    const period = 50;
    const state = { index: 0, period };
    type State = typeof state;
    function dispatch(this: SchedulerAction<State>, state: State): void {
      state.index += 1;
      state.period -= 1;
      if (state.index < 3) {
        this.schedule(state, state.period);
      }
    }
    asap.schedule(dispatch, period, state);
    expect(state).to.have.property('index', 0);
    expect(stubSetInterval).to.have.property('callCount', 1);
    fakeTimer.tick(period);
    expect(state).to.have.property('index', 1);
    expect(stubSetInterval).to.have.property('callCount', 2);
    fakeTimer.tick(period);
    expect(state).to.have.property('index', 2);
    expect(stubSetInterval).to.have.property('callCount', 3);
    stubSetInterval.restore();
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
    asap.schedule(function (index) {
      if (index === 0) {
        this.schedule(1);
        asap.schedule(() => { syncExec1 = false; });
      } else if (index === 1) {
        this.schedule(2);
        asap.schedule(() => { syncExec2 = false; });
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

  it('should cancel the setImmediate if all scheduled actions unsubscribe before it executes', (done: MochaDone) => {
    let asapExec1 = false;
    let asapExec2 = false;
    const action1 = asap.schedule(() => { asapExec1 = true; });
    const action2 = asap.schedule(() => { asapExec2 = true; });
    expect(asap.scheduled).to.exist;
    expect(asap.actions.length).to.equal(2);
    action1.unsubscribe();
    action2.unsubscribe();
    expect(asap.actions.length).to.equal(0);
    expect(asap.scheduled).to.equal(undefined);
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
