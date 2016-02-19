import * as Rx from '../dist/cjs/Rx';
import {it, DoneSignature} from './helpers/test-helper';

const Scheduler = Rx.Scheduler;

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
});