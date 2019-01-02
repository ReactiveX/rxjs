import { OperatorFunction } from 'rxjs/internal/types';
import { Observable } from 'rxjs/internal/Observable';
import { OperatorSubscriber } from '../OperatorSubscriber';
import { Subscriber } from '../Subscriber';
import { EMPTY } from 'rxjs/internal/EMPTY';

export function repeat<T>(count: number = Number.POSITIVE_INFINITY): OperatorFunction<T, T> {
  count = count < 0 ? Number.POSITIVE_INFINITY : count;
  return (source: Observable<T>) => count === 0 ? EMPTY :
    new Observable(subscriber => source.subscribe(new RepeatSubscriber(subscriber, count, source)));
}

class RepeatSubscriber<T> extends OperatorSubscriber<T> {
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
    // Subscription returned here is the same as this._subscription
    this._source.subscribe(this);
  }

  complete() {
    if (++this._counter < this._count) {
      this._resubscribe();
    } else {
      super.complete();
    }
  }
}
