
import { Observable } from '../../internal/Observable';
import { letProto } from '../../internal/patching/operator/let';

Observable.prototype.let = letProto;
Observable.prototype.letBind = letProto;

declare module '../../internal/Observable' {
  interface Observable<T> {
    let: typeof letProto;
    letBind: typeof letProto;
  }
}
