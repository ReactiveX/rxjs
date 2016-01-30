
import {Observable} from '../../Observable';
import {_do, DoSignature} from '../../operator/do';

Observable.prototype.do = _do;

declare module '../../Observable' {
  interface Observable<T> {
    do: DoSignature<T>;
  }
}