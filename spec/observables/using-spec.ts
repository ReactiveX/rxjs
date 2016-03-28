import * as Rx from '../../dist/cjs/Rx.KitchenSink';
import {it} from '../helpers/test-helper';

const Observable = Rx.Observable;
const Subscription = Rx.CompositeSubscription;

describe('Observable.using', () => {
  it('should dispose of the resource when the subscription is disposed', (done) => {
    let disposed = false;
    const source = Observable.using(
      () => new Subscription(() => disposed = true),
      (resource) => Observable.range(0, 3)
    )
    .take(2);

    source.subscribe();

    if (disposed) {
      done();
    } else {
      done.fail('disposed should be true but was false');
    }
  });
});
