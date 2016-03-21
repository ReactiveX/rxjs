import {expect} from 'chai';
import * as Rx from '../../dist/cjs/Rx.KitchenSink';

const asap = Rx.Scheduler.asap;

/** @test {Scheduler} */
describe('Scheduler.asap', () => {
  it('should exist', () => {
    expect(asap).exist;
  });

  it('should schedule an action to happen later', (done: MochaDone) => {
    let actionHappened = false;
    asap.schedule(() => {
      actionHappened = true;
      done();
    });
    if (actionHappened) {
      done(new Error('Scheduled action happened synchronously'));
    }
  });

  it('should execute the rest of the scheduled actions if the first action is canceled', (done: MochaDone) => {
    let actionHappened = false;
    let firstSubscription = null;
    let secondSubscription = null;

    firstSubscription = asap.schedule(() => {
      actionHappened = true;
      if (secondSubscription) {
        secondSubscription.unsubscribe();
      }
      done(new Error('The first action should not have executed.'));
    });

    secondSubscription = asap.schedule(() => {
      if (!actionHappened) {
        done();
      }
    });

    if (actionHappened) {
      done(new Error('Scheduled action happened synchronously'));
    } else {
      firstSubscription.unsubscribe();
    }
  });
});
