/** @prettier  */
import { expect } from 'chai';
import * as sinon from 'sinon';
import type { Subscription, SchedulerAction} from 'rxjs';
import { asapScheduler, merge } from 'rxjs';
import { delay } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { observableMatcher } from '../helpers/observableMatcher';
import { immediateProvider } from 'rxjs/internal/scheduler/immediateProvider';
import { intervalProvider } from 'rxjs/internal/scheduler/intervalProvider';

const asap = asapScheduler;

/** @test {Scheduler} */
describe('Scheduler.asap', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(observableMatcher);
  });

  it('should exist', () => {
    expect(asap).exist;
  });

  it('should act like the async scheduler if delay > 0', () => {
    testScheduler.run(({ cold, expectObservable, time }) => {
      const a = cold('  a            ');
      const ta = time(' ----|        ');
      const b = cold('  b            ');
      const tb = time(' --------|    ');
      const expected = '----a---b----';

      const result = merge(a.pipe(delay(ta, asap)), b.pipe(delay(tb, asap)));
      expectObservable(result).toBe(expected);
    });
  });

  it('should cancel asap actions when delay > 0', () => {
    testScheduler.run(({ cold, expectObservable, flush, time }) => {
      const sandbox = sinon.createSandbox();
      const setImmediateSpy = sandbox.spy(immediateProvider, 'setImmediate');
      const setSpy = sandbox.spy(intervalProvider, 'setInterval');
      const clearSpy = sandbox.spy(intervalProvider, 'clearInterval');

      const a = cold('  a            ');
      const ta = time(' ----|        ');
      const subs = '    ^-!          ';
      const expected = '-------------';

      const result = merge(a.pipe(delay(ta, asap)));
      expectObservable(result, subs).toBe(expected);

      flush();
      expect(setImmediateSpy).to.have.not.been.called;
      expect(setSpy).to.have.been.calledOnce;
      expect(clearSpy).to.have.been.calledOnce;
      sandbox.restore();
    });
  });

  it('should reuse the interval for recursively scheduled actions with the same delay', () => {
    const sandbox = sinon.createSandbox();
    const fakeTimer = sandbox.useFakeTimers();
    // callThrough is missing from the declarations installed by the typings tool in stable
    const stubSetInterval = (<any>sandbox.stub(global, 'setInterval')).callThrough();
    const period = 50;
    const state = { index: 0, period };
    type State = typeof state;
    function dispatch(this: SchedulerAction<State>, state: State): void {
      state.index += 1;
      if (state.index < 3) {
        this.schedule(state, state.period);
      }
    }
    asap.schedule(dispatch as any, period, state);
    expect(state).to.have.property('index', 0);
    expect(stubSetInterval).to.have.property('callCount', 1);
    fakeTimer.tick(period);
    expect(state).to.have.property('index', 1);
    expect(stubSetInterval).to.have.property('callCount', 1);
    fakeTimer.tick(period);
    expect(state).to.have.property('index', 2);
    expect(stubSetInterval).to.have.property('callCount', 1);
    sandbox.restore();
  });

  it('should not reuse the interval for recursively scheduled actions with a different delay', () => {
    const sandbox = sinon.createSandbox();
    const fakeTimer = sandbox.useFakeTimers();
    // callThrough is missing from the declarations installed by the typings tool in stable
    const stubSetInterval = (<any>sandbox.stub(global, 'setInterval')).callThrough();
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
    asap.schedule(dispatch as any, period, state);
    expect(state).to.have.property('index', 0);
    expect(stubSetInterval).to.have.property('callCount', 1);
    fakeTimer.tick(period);
    expect(state).to.have.property('index', 1);
    expect(stubSetInterval).to.have.property('callCount', 2);
    fakeTimer.tick(period);
    expect(state).to.have.property('index', 2);
    expect(stubSetInterval).to.have.property('callCount', 3);
    sandbox.restore();
  });

  it('should schedule an action to happen later', (done) => {
    let actionHappened = false;
    asap.schedule(() => {
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
    asap.schedule(
      function (index) {
        if (index === 0) {
          this.schedule(1);
          asap.schedule(() => {
            syncExec1 = false;
          });
        } else if (index === 1) {
          this.schedule(2);
          asap.schedule(() => {
            syncExec2 = false;
          });
        } else if (index === 2) {
          this.schedule(3);
        } else if (index === 3) {
          if (!syncExec1 && !syncExec2) {
            done();
          } else {
            done(new Error('Execution happened synchronously.'));
          }
        }
      },
      0,
      0
    );
  });

  it('should cancel the setImmediate if all scheduled actions unsubscribe before it executes', (done) => {
    let asapExec1 = false;
    let asapExec2 = false;
    const action1 = asap.schedule(() => {
      asapExec1 = true;
    });
    const action2 = asap.schedule(() => {
      asapExec2 = true;
    });
    expect(asap._scheduled).to.exist;
    expect(asap.actions.length).to.equal(2);
    action1.unsubscribe();
    action2.unsubscribe();
    expect(asap.actions.length).to.equal(0);
    expect(asap._scheduled).to.equal(undefined);
    asap.schedule(() => {
      expect(asapExec1).to.equal(false);
      expect(asapExec2).to.equal(false);
      done();
    });
  });

  it('should execute the rest of the scheduled actions if the first action is canceled', (done) => {
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

  it('should not execute rescheduled actions when flushing', (done) => {
    let flushCount = 0;
    const scheduledIndices: number[] = [];

    const originalFlush = asap.flush;
    asap.flush = (...args) => {
      ++flushCount;
      originalFlush.apply(asap, args);
      if (flushCount === 2) {
        asap.flush = originalFlush;
        try {
          expect(scheduledIndices).to.deep.equal([0, 1]);
          done();
        } catch (error) {
          done(error);
        }
      }
    };

    asap.schedule(
      function (index) {
        if (flushCount < 2) {
          this.schedule(index! + 1);
          scheduledIndices.push(index! + 1);
        }
      },
      0,
      0
    );
    scheduledIndices.push(0);
  });

  it('should execute actions scheduled when flushing in a subsequent flush', (done) => {
    const sandbox = sinon.createSandbox();
    const stubFlush = sandbox.stub(asapScheduler, 'flush').callThrough();

    asapScheduler.schedule(() => {
      expect(stubFlush).to.have.callCount(1);
      asapScheduler.schedule(() => {
        expect(stubFlush).to.have.callCount(2);
        sandbox.restore();
        done();
      });
    });
    asapScheduler.schedule(() => {
      expect(stubFlush).to.have.callCount(1);
    });
  });

  it('should execute actions scheduled when flushing in a subsequent flush when some actions are unsubscribed', (done) => {
    const sandbox = sinon.createSandbox();
    const stubFlush = sandbox.stub(asapScheduler, 'flush').callThrough();

    // eslint-disable-next-line prefer-const
    let b: Subscription;

    asapScheduler.schedule(() => {
      expect(stubFlush).to.have.callCount(1);
      asapScheduler.schedule(() => {
        expect(stubFlush).to.have.callCount(2);
        sandbox.restore();
        done();
      });
      b.unsubscribe();
    });
    b = asapScheduler.schedule(() => {
      done(new Error('Unexpected execution of b'));
    });
  });

  it('should properly cancel an unnecessary flush', (done) => {
    const sandbox = sinon.createSandbox();
    const clearImmediateStub = sandbox.stub(immediateProvider, 'clearImmediate').callThrough();

    let c: Subscription;

    asapScheduler.schedule(() => {
      expect(asapScheduler.actions).to.have.length(1);
      c = asapScheduler.schedule(() => {
        done(new Error('Unexpected execution of c'));
      });
      expect(asapScheduler.actions).to.have.length(2);
      // What we're testing here is that the unsubscription of action c effects
      // the cancellation of the microtask in a scenario in which the actions
      // queue is not empty - it contains action b.
      c.unsubscribe();
      expect(asapScheduler.actions).to.have.length(1);
      expect(clearImmediateStub).to.have.callCount(1);
    });
    asapScheduler.schedule(() => {
      sandbox.restore();
      done();
    });
  });

  it('scheduling inside of an executing action more than once should work', (done) => {
    const results: any[] = [];

    let resolve: () => void;
    const promise = new Promise<void>((r) => (resolve = r));

    asapScheduler.schedule(() => {
      results.push(1);
      asapScheduler.schedule(() => {
        results.push(2);
      });
      asapScheduler.schedule(() => {
        results.push(3);
        resolve();
      });
    });

    promise.then(() => {
      // This should always fire after two recursively scheduled microtasks.
      expect(results).to.deep.equal([1, 2, 3]);
      done();
    });
  });
});
