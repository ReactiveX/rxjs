import {expect} from 'chai';
import * as Rx from '../dist/cjs/Rx';

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
    expect(call1).to.be.true;
    expect(call2).to.be.true;
  });

  it('should schedule things in the future too', (done: MochaDone) => {
    let called = false;
    Scheduler.queue.schedule(() => {
      called = true;
    }, 50);

    setTimeout(() => {
      expect(called).to.be.false;
    }, 40);

    setTimeout(() => {
      expect(called).to.be.true;
      done();
    }, 70);
  });

  it('should be reusable after an error is thrown during execution', (done: MochaDone) => {
    const results = [];

    expect(() => {
      Scheduler.queue.schedule(() => {
        results.push(1);
      });

      Scheduler.queue.schedule(() => {
        throw new Error('bad');
      });
    }).to.throw(Error, 'bad');

    setTimeout(() => {
      Scheduler.queue.schedule(() => {
        results.push(2);
        done();
      });
    }, 0);
  });
});