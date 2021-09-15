import { expect } from 'chai';
import * as sinon from 'sinon';
import { queueScheduler, Subscription, merge } from 'rxjs';
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

  it('should unsubscribe the rest of the scheduled actions if an action throws an error', () => {
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
    expect(actions.every((action) => action.closed)).to.be.true;
    expect(action2Exec).to.be.false;
    expect(action3Exec).to.be.false;
    expect(errorValue).exist;
    expect(errorValue.message).to.equal('oops');
  });
});
