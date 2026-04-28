import { expect } from 'chai';
import * as sinon from 'sinon';
import { queueScheduler, Subscription, merge, Subject, Observable, observeOn, config } from 'rxjs';
import { delay } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { observableMatcher } from '../helpers/observableMatcher';

const queue = queueScheduler;

/** @test {Scheduler} */
describe('Scheduler.queue', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(observableMatcher);
  });

  it('should act like the async scheduler if delay > 0', () => {
    testScheduler.run(({ cold, expectObservable, time }) => {
      const a = cold('  a            ');
      const ta = time(' ----|        ');
      const b = cold('  b            ');
      const tb = time(' --------|    ');
      const expected = '----a---b----';

      const result = merge(
        a.pipe(delay(ta, queue)),
        b.pipe(delay(tb, queue))
      );
      expectObservable(result).toBe(expected);
    });
  });

  it('should switch from synchronous to asynchronous at will', () => {
    const sandbox = sinon.createSandbox();
    const fakeTimer = sandbox.useFakeTimers();

    let asyncExec = false;
    let state: Array<number> = [];

    queue.schedule(function (index) {
      state.push(index!);
      if (index === 0) {
        this.schedule(1, 100);
      } else if (index === 1) {
        asyncExec = true;
        this.schedule(2, 0);
      }
    }, 0, 0);

    expect(asyncExec).to.be.false;
    expect(state).to.be.deep.equal([0]);

    fakeTimer.tick(100);

    expect(asyncExec).to.be.true;
    expect(state).to.be.deep.equal([0, 1, 2]);

    sandbox.restore();
  });

  it('should report errors via reportUnhandledError instead of throwing synchronously', () => {
    const sandbox = sinon.createSandbox();
    const fakeTimer = sandbox.useFakeTimers();
    const errors: any[] = [];
    config.onUnhandledError = (err) => errors.push(err);

    queue.schedule(() => {
      queue.schedule(() => { throw new Error('oops'); });
    });

    // Error is not thrown synchronously
    expect(errors).to.deep.equal([]);

    // Error surfaces asynchronously via onUnhandledError
    fakeTimer.tick(0);
    expect(errors.length).to.equal(1);
    expect(errors[0].message).to.equal('oops');

    config.onUnhandledError = null;
    sandbox.restore();
  });

  it('should not unsubscribe sibling actions when one action errors during flush', () => {
    const sandbox = sinon.createSandbox();
    const fakeTimer = sandbox.useFakeTimers();
    config.onUnhandledError = () => {};

    const actions: Subscription[] = [];
    queue.schedule(() => {
      actions.push(
        queue.schedule(() => { throw new Error('oops'); }),
        queue.schedule(() => {}),
        queue.schedule(() => {})
      );
    });

    fakeTimer.tick(0);

    expect(actions[0].closed).to.be.true;
    expect(actions[1].closed).to.be.false;
    expect(actions[2].closed).to.be.false;

    config.onUnhandledError = null;
    sandbox.restore();
  });

  it('should continue executing sibling actions in the same flush after an error', () => {
    const sandbox = sinon.createSandbox();
    const fakeTimer = sandbox.useFakeTimers();
    config.onUnhandledError = () => {};

    let action2Exec = false;
    let action3Exec = false;
    queue.schedule(() => {
      queue.schedule(() => { throw new Error('oops'); });
      queue.schedule(() => { action2Exec = true; });
      queue.schedule(() => { action3Exec = true; });
    });

    // Siblings execute in the same flush — no need for a second flush
    expect(action2Exec).to.be.true;
    expect(action3Exec).to.be.true;

    fakeTimer.tick(0);
    config.onUnhandledError = null;
    sandbox.restore();
  });

  it('should not tear down the subscriber chain when a queued action errors (NgRx pattern)', () => {
    const sandbox = sinon.createSandbox();
    const fakeTimer = sandbox.useFakeTimers();
    config.onUnhandledError = () => {};

    const source = new Subject<number>();
    const results: number[] = [];

    const scheduled$ = source.pipe(observeOn(queue));

    // Subscriber 1 will throw
    const sub1 = scheduled$.subscribe({
      next: () => { throw new Error('subscriber 1 error'); }
    });
    // Subscriber 2 is innocent
    const sub2 = scheduled$.subscribe({
      next: (v) => results.push(v)
    });

    source.next(42);

    fakeTimer.tick(0);

    // The subscriber chain should remain intact — neither subscription
    // should have been torn down by the error propagation.
    expect(sub1.closed).to.be.false;
    expect(sub2.closed).to.be.false;
    expect(results).to.deep.equal([42]);

    // Verify the store is still alive — subsequent emissions still work
    source.next(99);
    expect(results).to.deep.equal([42, 99]);

    config.onUnhandledError = null;
    sandbox.restore();
  });
});
