
import {Observable, IObservable} from '../../Observable';
import {zipProto, ZipSignature} from '../../operator/zip';

Observable.prototype.zip = zipProto;

declare module '../../Observable' {
  interface IObservable<T> {
    zip: ZipSignature<T>;
  }
}