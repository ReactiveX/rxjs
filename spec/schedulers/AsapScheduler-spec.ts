import * as Rx from '../../dist/cjs/Rx.KitchenSink';
import {DoneSignature} from '../helpers/test-helper';

const asap = Rx.Scheduler.asap;

/** @test {AsapScheduler} */
describe('AsapScheduler', () => {
  it('should exist', () => {
    expect(asap).toBeDefined();
  });

  it('should schedule an action to happen later', (done: DoneSignature) => {
    let actionHappened = false;
    asap.schedule(() => {
      actionHappened = true;
      done();
    });
    if (actionHappened) {
      done.fail('Scheduled action happened synchronously');
    }
  });

  it('should execute the rest of the scheduled actions if the first action is canceled', (done: DoneSignature) => {
    let actionHappened = false;
    let firstSubscription = null;
    let secondSubscription = null;

    firstSubscription = asap.schedule(() => {
      actionHappened = true;
      if (secondSubscription) {
        secondSubscription.unsubscribe();
      }
      done.fail('The first action should not have executed.');
    });

    secondSubscription = asap.schedule(() => {
      if (!actionHappened) {
        done();
      }
    });

    if (actionHappened) {
      done.fail('Scheduled action happened synchronously');
    } else {
      firstSubscription.unsubscribe();
    }
  });
});
