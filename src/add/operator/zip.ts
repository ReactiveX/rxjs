
import {Observable} from '../../Observable';
import {zipProto, ZipSignature} from '../../operator/zip';

Observable.prototype.zip = zipProto;

declare module '../../Observable' {
  interface Observable<T> {
    zip: ZipSignature<T>;
  }
}