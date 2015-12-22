import {Observable} from '../Observable';

export function letProto<T, R>(func: (selector: Observable<T>) => Observable<R>): Observable<R> {
  return func(this);
}
