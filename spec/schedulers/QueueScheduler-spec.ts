import { expect } from 'chai';
import * as sinon from 'sinon';
import { queueScheduler, Subscription } from 'rxjs';

/** @test {queueScheduler} */
describe('queueScheduler', () => {
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

  it('should act like the async scheduler if delay > 0', () => {
    let actionHappened = false;
    queueScheduler.schedule(() => {
      actionHappened = true;
    }, 50);
    expect(actionHappened).to.be.false;
    fakeTimer.tick(25);
    expect(actionHappened).to.be.false;
    fakeTimer.tick(25);
    expect(actionHappened).to.be.true;
  });

  it('should allow recursive scheduling', () => {
    const results: number[] = [];

    queueScheduler.schedule((state, reschedule) => {
      results.push(state);
      if (state < 3) {
        reschedule(state + 1);
      }
    }, 0, 0);

    expect(results).to.deep.equal([0, 1, 2, 3]);
  });

  it('should switch from synchronous to asynchronous at will', () => {
    let asyncExec = false;
    let state: Array<number> = [];

    function work(index: number) {
      state.push(index);
      if (index === 0) {
        queueScheduler.schedule(work, 100, 1);
      } else if (index === 1) {
        asyncExec = true;
        queueScheduler.schedule(work, 0, 2);
      }
    }

    queueScheduler.schedule(work, 0, 0);

    expect(asyncExec).to.be.false;
    expect(state).to.be.deep.equal([0]);

    fakeTimer.tick(100);

    expect(asyncExec).to.be.true;
    expect(state).to.be.deep.equal([0, 1, 2]);
  });

  it('should unsubscribe the rest of the scheduled actions if an action throws an error', () => {
    const actions: Subscription[] = [];
    let action2Exec = false;
    let action3Exec = false;
    let errorValue = undefined;
    try {
      queueScheduler.schedule(() => {
        actions.push(
          queueScheduler.schedule(() => { throw new Error('oops'); }),
          queueScheduler.schedule(() => { action2Exec = true; }),
          queueScheduler.schedule(() => { action3Exec = true; })
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

  it('should schedule things recursively', () => {
    let call1 = false;
    let call2 = false;
    queueScheduler.schedule(() => {
      call1 = true;
      queueScheduler.schedule(() => {
        call2 = true;
      });
    });
    expect(call1).to.be.true;
    expect(call2).to.be.true;
  });

  it('should schedule things in the future too', () => {
    let called = false;
    queueScheduler.schedule(() => {
      called = true;
    }, 60);

    fakeTimer.tick(20);
    expect(called).to.be.false;

    fakeTimer.tick(80);
    expect(called).to.be.true;
  });

  it('should be reusable after an error is thrown during execution', () => {
    const results: number[] = [];

    queueScheduler.schedule(() => {
      results.push(1);
    });

    expect(() => {
      queueScheduler.schedule(() => {
        throw new Error('bad');
      });
    }).to.throw(Error, 'bad');

    queueScheduler.schedule(() => {
      results.push(2);
    });

    expect(results).to.deep.equal([1, 2]);
  });
});
