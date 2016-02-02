
import {Observable} from '../../Observable';
import {retry} from '../../operator/retry';

Observable.prototype.retry = retry;

declare module '../../Observable' {
  interface Observable<T> {
    retry: (count?: number) => Observable<T>;
  }
}