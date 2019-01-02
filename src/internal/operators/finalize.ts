import { Observable } from 'rxjs/internal/Observable';
import { OperatorFunction} from 'rxjs/internal/types';

export function finalize<T>(callback: () => void): OperatorFunction<T, T> {
  return (source: Observable<T>) => new Observable(subscriber => {
    (subscriber as any)._subscription.add(callback);
    return source.subscribe(subscriber);
  });
}
