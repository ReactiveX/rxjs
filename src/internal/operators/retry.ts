import { OperatorFunction, FOType, Sink, SinkArg } from 'rxjs/internal/types';
import { Observable } from 'rxjs/internal/Observable';
import { RecyclableSubscription } from 'rxjs/internal/RecyclableSubscription';
import { Subscription } from 'rxjs/internal/Subscription';
import { Subscriber } from '../Subscriber';
import { OperatorSubscriber } from '../OperatorSubscriber';

export function retry<T>(count: number = Number.POSITIVE_INFINITY): OperatorFunction<T, T> {
  return (source: Observable<T>) => source.lift(retryOperator(count));
}

function retryOperator<T>(count: number) {
  return function retryLift(this: Subscriber<T>, source: Observable<T>, downstreamSubs: Subscription) {
    const upstreamSubs = new RecyclableSubscription();
    downstreamSubs.add(upstreamSubs);
    return source.subscribe(new RetrySubscriber(upstreamSubs, this, count, source, downstreamSubs), downstreamSubs);
  };
}

class RetrySubscriber<T> extends OperatorSubscriber<T> {
  private _counter = 0;

  constructor(
    private _upstreamSubs: RecyclableSubscription,
    destination: Subscriber<T>,
    private _count: number,
    private _source: Observable<T>,
    private _downstreamSubs: Subscription
  ) {
    super(_upstreamSubs, destination);
  }

  private _resubscribe() {
    debugger;
    this._upstreamSubs.recycle();
    this._upstreamSubs.add(this._source.subscribe(this, this._downstreamSubs));
  }

  error(err: any) {
    this._counter++;
    if (this._counter <= this._count) {
      this._resubscribe();
    } else {
      debugger;
      this._destination.error(err);
      this._upstreamSubs.unsubscribe();
    }
  }
}
