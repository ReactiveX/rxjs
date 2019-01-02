import { OperatorFunction, FOType, Sink, SinkArg } from 'rxjs/internal/types';
import { Observable } from 'rxjs/internal/Observable';
import { Subscription } from 'rxjs/internal/Subscription';
import { Subscriber } from '../Subscriber';
import { OperatorSubscriber } from '../OperatorSubscriber';

export function retry<T>(count: number = Number.POSITIVE_INFINITY): OperatorFunction<T, T> {
  return (source: Observable<T>) => new Observable(subscriber => source.subscribe(new RetrySubscriber(subscriber, count, source)));
}
class RetrySubscriber<T> extends OperatorSubscriber<T> {
  private _counter = 0;

  constructor(
    destination: Subscriber<T>,
    private _count: number,
    private _source: Observable<T>,
  ) {
    super(destination);
  }

  private _resubscribe() {
    (this._subscription as any)._teardown();
    this._source.subscribe(this);
  }

  error(err: any) {
    if (this._counter++ < this._count) {
      this._resubscribe();
    } else {
      super.error(err);
    }
  }
}
