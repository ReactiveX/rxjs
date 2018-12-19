import { ObservableInput } from 'rxjs/internal/types';
import { Observable } from 'rxjs/internal/Observable';
import { from } from './from';

export function defer<T>(fn: () => ObservableInput<T>): Observable<T> {
  return new Observable<T>(subscriber => {
    const result = from(fn());
    return result.subscribe(subscriber);
  });
}
