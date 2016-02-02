
import {Observable} from '../../Observable';
import {defaultIfEmpty} from '../../operator/defaultIfEmpty';

Observable.prototype.defaultIfEmpty = defaultIfEmpty;

declare module '../../Observable' {
  interface Observable<T> {
    defaultIfEmpty: <R>(defaultValue?: T | R) => Observable<T> | Observable<R>;
  }
}