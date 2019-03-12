import * as sinon from 'sinon';
import { asyncScheduler } from 'rxjs';
import { expect } from 'chai';

describe('asyncScheduler', () => {
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

  it('should allow recursive scheduling', () => {
    const results: number[] = [];

    asyncScheduler.schedule((state, reschedule) => {
      results.push(state);
      if (state < 3) {
        reschedule(state + 1);
      }
    }, 10, 0);

    expect(results).to.deep.equal([]);
    fakeTimer.tick(10);
    expect(results).to.deep.equal([0]);
    fakeTimer.tick(10);
    expect(results).to.deep.equal([0, 1]);
    fakeTimer.tick(10);
    expect(results).to.deep.equal([0, 1, 2]);
    fakeTimer.tick(10);
    expect(results).to.deep.equal([0, 1, 2, 3]);
    fakeTimer.tick(1000);
    expect(results).to.deep.equal([0, 1, 2, 3]);
  });
});
