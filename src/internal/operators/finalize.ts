import { Observable } from 'rxjs/internal/Observable';
import { OperatorFunction, Operator} from 'rxjs/internal/types';
import { MutableSubscriber } from 'rxjs/internal/MutableSubscriber';

export function finalize<T>(callback: () => void): OperatorFunction<T, T> {
  return (source: Observable<T>) => source.lift(finalizeOperator(callback));
}

function finalizeOperator<T>(callback: () => void): Operator<T> {
  return function finalizeLifted(this: MutableSubscriber<any>, source: Observable<T>) {
    const mut = this;
    mut.subscription.add(callback);
    return source.subscribe(mut);
  };
}
