import {$$observable} from '../util/Symbol_observable';
import {Observable} from '../Observable';
export function isObservable<T>(value: any): value is Observable<T> {
  return value && typeof value[$$observable] === 'function';
}
