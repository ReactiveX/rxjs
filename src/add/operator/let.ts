
import {Observable} from '../../Observable';
import {letProto, LetSignature} from '../../operator/let';

Observable.prototype.let = letProto;
Observable.prototype.letBind = letProto;

declare module '../../Observable' {
  interface IObservable<T> {
    let: LetSignature<T>;
    letBind: LetSignature<T>;
  }
}