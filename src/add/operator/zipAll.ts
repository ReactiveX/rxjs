
import {Observable} from '../../Observable';
import {zipAll, ZipAllSignature} from '../../operator/zipAll';

Observable.prototype.zipAll = zipAll;

declare module '../../Observable' {
  interface IObservable<T> {
    zipAll: ZipAllSignature<T>;
  }
}