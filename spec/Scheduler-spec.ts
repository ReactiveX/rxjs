import { expect } from 'chai';
import { queueScheduler as queue } from 'rxjs';
import { QueueScheduler } from 'rxjs/internal/scheduler/QueueScheduler';

/** @test {Scheduler} */
describe('Scheduler.queue', () => {
  it('should schedule things recursively', () => {
    let call1 = false;
    let call2 = false;
    (queue as QueueScheduler).active = false;
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
    (queue as QueueScheduler).active = false;
    queue.schedule(function (state) {
      call1 = state.call1;
      call2 = state.call2;
      if (!call2) {
        this.schedule({ call1: true, call2: true });
      }
    }, 0, { call1: true, call2: false });
    expect(call1).to.be.true;
    expect(call2).to.be.true;
  });

  it('should schedule things in the future too', (done: MochaDone) => {
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

  it('should be reusable after an error is thrown during execution', (done: MochaDone) => {
    const results: number[] = [];

    expect(() => {
      queue.schedule(() => {
        results.push(1);
      });

      queue.schedule(() => {
        throw new Error('bad');
      });
    }).to.throw(Error, 'bad');

    setTimeout(() => {
      queue.schedule(() => {
        results.push(2);
        done();
      });
    }, 0);
  });
});
