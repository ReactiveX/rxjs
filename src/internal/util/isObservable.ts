import { Observable } from 'rxjs/internal/Observable';

export function isObservable<T>(obj: any): obj is Observable<T> {
  return obj && typeof obj.subscribe === 'function' && typeof obj.toPromise === 'function';
}
