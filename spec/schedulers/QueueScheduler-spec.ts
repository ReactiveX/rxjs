import { expect } from 'chai';
import * as sinon from 'sinon';
import { queueScheduler, Subscription, merge, Subject, Observable, observeOn } from 'rxjs';
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

  it('should throw error but only unsubscribe the erroring action, not siblings', () => {
    const actions: Subscription[] = [];
    let action2Exec = false;
    let action3Exec = false;
    let errorValue: any = undefined;
    try {
      queue.schedule(() => {
        actions.push(
          queue.schedule(() => { throw new Error('oops'); }),
          queue.schedule(() => { action2Exec = true; }),
          queue.schedule(() => { action3Exec = true; })
        );
      });
    } catch (e) {
      errorValue = e;
    }
    expect(errorValue).exist;
    expect(errorValue.message).to.equal('oops');
    expect(actions[0].closed).to.be.true;
    expect(actions[1].closed).to.be.false;
    expect(actions[2].closed).to.be.false;
    expect(action2Exec).to.be.false;
    expect(action3Exec).to.be.false;
  });

  it('should not unsubscribe sibling actions when one action errors during flush', () => {
    const actions: Subscription[] = [];
    let errorValue: any;
    try {
      queue.schedule(() => {
        actions.push(
          queue.schedule(() => { throw new Error('oops'); }),
          queue.schedule(() => {}),
          queue.schedule(() => {})
        );
      });
    } catch (e) {
      errorValue = e;
    }
    expect(errorValue).to.exist;
    expect(errorValue.message).to.equal('oops');
    expect(actions[0].closed).to.be.true;
    expect(actions[1].closed).to.be.false;
    expect(actions[2].closed).to.be.false;
  });

  it('should execute surviving sibling actions in the next flush after an error', () => {
    let action2Exec = false;
    let action3Exec = false;
    try {
      queue.schedule(() => {
        queue.schedule(() => { throw new Error('oops'); });
        queue.schedule(() => { action2Exec = true; });
        queue.schedule(() => { action3Exec = true; });
      });
    } catch (e) {
      // expected
    }
    expect(action2Exec).to.be.false;
    expect(action3Exec).to.be.false;

    queue.schedule(() => {});

    expect(action2Exec).to.be.true;
    expect(action3Exec).to.be.true;
  });

  it('should not destroy sibling scheduled actions when one errors (NgRx pattern)', () => {
    // Replicates the NgRx pattern: an upstream observeOn(queueScheduler)
    // delivers a value, and during that delivery, multiple downstream
    // subscribers are independently scheduled onto the queue.
    // When one subscriber's handler throws, the others should survive.
    const results: number[] = [];

    try {
      queue.schedule(() => {
        // This outer action represents the upstream observeOn delivery.
        // During execution, it causes multiple downstream subscribers
        // to be independently scheduled (pushed to queue since _active is true).
        queue.schedule(() => { throw new Error('subscriber 1 error'); });
        queue.schedule(() => { results.push(42); });
      });
    } catch (e) {
      // expected from subscriber 1
    }

    expect(results).to.deep.equal([]);

    // The second action should have survived and executes in the next flush
    queue.schedule(() => {});
    expect(results).to.deep.equal([42]);
  });
});
