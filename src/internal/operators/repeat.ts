import { OperatorFunction, Operator } from 'rxjs/internal/types';
import { Observable } from 'rxjs/internal/Observable';
import { EMPTY } from 'rxjs/internal/EMPTY';
import { MutableSubscriber } from 'rxjs/internal/MutableSubscriber';
import { recycleSubscription } from 'rxjs/internal/util/recycleSubscription';

export function repeat<T>(count: number = Number.POSITIVE_INFINITY): OperatorFunction<T, T> {
  count = count < 0 ? Number.POSITIVE_INFINITY : count;
  return (source: Observable<T>) => count === 0 ? EMPTY as any : source.lift(repeatOperator(count));
}

function repeatOperator<T>(count: number): Operator<T> {
  return function repeatLifted(this: MutableSubscriber<any>, source: Observable<T>) {
    const mut = this;
    const _complete = mut.complete;
    let counter = 0;

    mut.complete = () => {
      if (++counter < count) {
        recycleSubscription(mut.subscription);
        source.subscribe(mut);
      } else {
        _complete();
      }
    };

    return source.subscribe(mut);
  };
}
