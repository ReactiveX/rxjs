
import {Observable} from '../../Observable';
import {letProto} from '../../operator/let';

Observable.prototype.let = letProto;
Observable.prototype.letBind = letProto;

declare module '../../Observable' {
  interface Observable<T> {
    let: <T, R>(func: (selector: Observable<T>) => Observable<R>) => Observable<R>;
    letBind: <T, R>(func: (selector: Observable<T>) => Observable<R>) => Observable<R>;
  }
}