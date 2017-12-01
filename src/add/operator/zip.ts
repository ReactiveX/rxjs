
import { Observable } from '../../internal/Observable';
import { zipProto } from '../../internal/patching/operator/zip';

Observable.prototype.zip = zipProto;

declare module '../../internal/Observable' {
  interface Observable<T> {
    zip: typeof zipProto;
  }
}
