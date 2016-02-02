
import {Observable} from '../../Observable';
import {retryWhen} from '../../operator/retryWhen';

Observable.prototype.retryWhen = retryWhen;

declare module '../../Observable' {
  interface Observable<T> {
    retryWhen: (notifier: (errors: Observable<any>) => Observable<any>) => Observable<T>;
  }
}