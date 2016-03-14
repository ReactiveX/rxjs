import * as Rx from '../dist/cjs/Rx';
import {DoneSignature} from './helpers/test-helper';

const Scheduler = Rx.Scheduler;

/** @test {Scheduler} */
describe('Scheduler.queue', () => {
  it('should schedule things recursively', () => {
    let call1 = false;
    let call2 = false;
    Scheduler.queue.active = false;
    Scheduler.queue.schedule(() => {
      call1 = true;
      Scheduler.queue.schedule(() => {
        call2 = true;
      });
    });
    expect(call1).toBe(true);
    expect(call2).toBe(true);
  });

  it('should schedule things in the future too', (done: DoneSignature) => {
    let called = false;
    Scheduler.queue.schedule(() => {
      called = true;
    }, 50);

    setTimeout(() => {
      expect(called).toBe(false);
    }, 40);

    setTimeout(() => {
      expect(called).toBe(true);
      done();
    }, 70);
  });

  it('should be reusable after an error is thrown during execution', (done: DoneSignature) => {
    const results = [];

    expect(() => {
      Scheduler.queue.schedule(() => {
        results.push(1);
      });

      Scheduler.queue.schedule(() => {
        throw new Error('bad');
      });
    }).toThrow(new Error('bad'));

    setTimeout(() => {
      Scheduler.queue.schedule(() => {
        results.push(2);
        done();
      });
    }, 0);
  });
});