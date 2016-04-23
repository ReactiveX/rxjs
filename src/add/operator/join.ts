import {Observable} from '../../Observable';
import {join, JoinSignature} from '../../operator/join';

Observable.prototype.join = join;

declare module '../../Observable' {
  interface Observable<T> {
    join: JoinSignature<T>;
  }
}
