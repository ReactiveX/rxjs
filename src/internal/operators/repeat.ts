import { OperatorFunction } from 'rxjs/internal/types';
import { Observable } from 'rxjs/internal/Observable';
import { RecyclableSubscription } from 'rxjs/internal/RecyclableSubscription';
import { Subscription } from 'rxjs/internal/Subscription';
import { OperatorSubscriber } from '../OperatorSubscriber';
import { Subscriber } from '../Subscriber';

export function repeat<T>(count: number = Number.POSITIVE_INFINITY): OperatorFunction<T, T> {
  return (source: Observable<T>) => source.lift(repeatOperator(count));
}

function repeatOperator<T>(count: number) {
  return function repeatLift(this: Subscriber<T>, source: Observable<T>, downstreamSubs: Subscription) {
    const upstreamSubs = new RecyclableSubscription();
    downstreamSubs.add(upstreamSubs);
    return source.subscribe(new RepeatSubscriber(downstreamSubs, this, count, source, upstreamSubs), upstreamSubs);
  };
}

class RepeatSubscriber<T> extends OperatorSubscriber<T> {
  private _counter = 0;

  constructor(
    subscription: Subscription,
    destination: Subscriber<T>,
    private _count: number,
    private _source: Observable<T>,
    private _upstreamSubs: RecyclableSubscription,
  ) {
    super(subscription, destination);
  }

  private _subscribe() {
    this._upstreamSubs.add(this._source.subscribe(this, this._subscription));
  }

  complete() {
    this._counter++;
    if (this._counter < this._count) {
      this._upstreamSubs.recycle();
      this._subscribe();
    } else {
      this._destination.complete();
      this._upstreamSubs.unsubscribe();
    }
  }
}
