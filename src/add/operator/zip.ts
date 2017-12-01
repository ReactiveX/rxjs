
import { Observable } from '../../Observable';
import { zipProto } from '../../internal/patching/operator/zip';

Observable.prototype.zip = zipProto;

declare module '../../Observable' {
  interface Observable<T> {
    zip: typeof zipProto;
  }
}
