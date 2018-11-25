import { Observable } from 'rxjs/internal/Observable';

export function throwError(err: any): Observable<never> {
  return new Observable(subscriber => subscriber.error(err));
}
