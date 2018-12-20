import { Observable } from 'rxjs/internal/Observable';
import { OperatorFunction} from 'rxjs/internal/types';
import { Subscription } from 'rxjs/internal/Subscription';
import { Subscriber } from '../Subscriber';

export function finalize<T>(callback: () => void): OperatorFunction<T, T> {
  return (source: Observable<T>) => source.lift(finalizeOperator(callback));
}

function finalizeOperator<T>(callback: () => void) {
  return function finalizeLift(this: Subscriber<T>, source: Observable<T>, subscription: Subscription) {
    subscription.add(callback);
    return source.subscribe(this, subscription);
  };
}
