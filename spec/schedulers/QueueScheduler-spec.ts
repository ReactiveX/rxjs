import {expect} from 'chai';
import * as Rx from '../../dist/cjs/Rx';

const Scheduler = Rx.Scheduler;
const queue = Scheduler.queue;

/** @test {Scheduler} */
describe('Scheduler.queue', () => {
  it('should switch from synchronous to asynchronous at will', (done: MochaDone) => {
    let lastExecTime = 0;
    let asyncExec = false;
    queue.schedule(function (index) {
      if (index === 0) {
        lastExecTime = queue.now();
        this.schedule(1, 100);
      } else if (index === 1) {
        if (queue.now() - lastExecTime < 100) {
          done(new Error('Execution happened synchronously.'));
        } else {
          asyncExec = true;
          lastExecTime = queue.now();
          this.schedule(2, 0);
        }
      } else if (index === 2) {
        if (asyncExec === false) {
          done(new Error('Execution happened synchronously.'));
        } else {
          done();
        }
      }
    }, 0, 0);
    asyncExec = false;
  });
  it('should unsubscribe the rest of the scheduled actions if an action throws an error', () => {
    const actions = [];
    let action2Exec = false;
    let action3Exec = false;
    let errorValue = undefined;
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
    expect(actions.every((action) => action.isUnsubscribed)).to.be.true;
    expect(action2Exec).to.be.false;
    expect(action3Exec).to.be.false;
    expect(errorValue).exist;
    expect(errorValue.message).to.equal('oops');
  });
});
