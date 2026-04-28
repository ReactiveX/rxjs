import { expect } from 'chai';
import * as sinon from 'sinon';
import { queueScheduler as queue, config } from 'rxjs';
import { QueueScheduler } from 'rxjs/internal/scheduler/QueueScheduler';

/** @test {Scheduler} */
describe('Scheduler.queue', () => {
  it('should schedule things recursively', () => {
    let call1 = false;
    let call2 = false;
    (queue as QueueScheduler)._active = false;
    queue.schedule(() => {
      call1 = true;
      queue.schedule(() => {
        call2 = true;
      });
    });
    expect(call1).to.be.true;
    expect(call2).to.be.true;
  });

  it('should schedule things recursively via this.schedule', () => {
    let call1 = false;
    let call2 = false;
    (queue as QueueScheduler)._active = false;
    queue.schedule(function (state) {
      call1 = state!.call1;
      call2 = state!.call2;
      if (!call2) {
        this.schedule({ call1: true, call2: true });
      }
    }, 0, { call1: true, call2: false });
    expect(call1).to.be.true;
    expect(call2).to.be.true;
  });

  it('should schedule things in the future too', (done) => {
    let called = false;
    queue.schedule(() => {
      called = true;
    }, 60);

    setTimeout(() => {
      expect(called).to.be.false;
    }, 20);

    setTimeout(() => {
      expect(called).to.be.true;
      done();
    }, 100);
  });

  it('should be reusable after an error is thrown during execution', (done) => {
    const sandbox = sinon.createSandbox();
    const fakeTimer = sandbox.useFakeTimers();
    const errors: any[] = [];
    config.onUnhandledError = (err) => errors.push(err);

    const results: number[] = [];

    queue.schedule(() => {
      results.push(1);
    });

    queue.schedule(() => {
      throw new Error('bad');
    });

    // Error is reported asynchronously, not thrown synchronously
    expect(results).to.deep.equal([1]);
    fakeTimer.tick(0);
    expect(errors.length).to.equal(1);
    expect(errors[0].message).to.equal('bad');

    config.onUnhandledError = null;
    sandbox.restore();

    setTimeout(() => {
      queue.schedule(() => {
        results.push(2);
        done();
      });
    }, 0);
  });
});
