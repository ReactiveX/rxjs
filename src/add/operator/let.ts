
import { Observable } from '../../Observable';
import { letProto } from '../../internal/patching/operator/let';

Observable.prototype.let = letProto;
Observable.prototype.letBind = letProto;

declare module '../../Observable' {
  interface Observable<T> {
    let: typeof letProto;
    letBind: typeof letProto;
  }
}
