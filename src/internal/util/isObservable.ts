import { Observable } from 'rxjs/internal/Observable';

export function isObservable<T>(obj: any): obj is Observable<T> {
  return typeof obj === 'function' && typeof obj.subscribe === 'function' && typeof obj.toPromise === 'function';
}
