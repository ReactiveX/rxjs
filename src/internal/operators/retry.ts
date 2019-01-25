import { OperatorFunction, Operator } from 'rxjs/internal/types';
import { Observable } from 'rxjs/internal/Observable';
import { MutableSubscriber } from 'rxjs/internal/MutableSubscriber';
import { recycleSubscription } from 'rxjs/internal/util/recycleSubscription';

export function retry<T>(count: number = Number.POSITIVE_INFINITY): OperatorFunction<T, T> {
  return (source: Observable<T>) => source.lift(retryOperator(count));
}

function retryOperator<T>(count: number): Operator<T> {
  return function retryLifted(this: MutableSubscriber<any>, source: Observable<T>) {
    const mut = this;
    const _error = mut.error;
    let counter = 0;

    mut.error = (err: any) => {
      if (counter++ < count) {
        recycleSubscription(mut.subscription);
        source.subscribe(mut);
      } else {
        _error(err);
      }
    };

    return source.subscribe(mut);
  };
}
