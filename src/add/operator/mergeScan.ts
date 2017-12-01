
import { Observable } from '../../Observable';
import { mergeScan } from '../../internal/patching/operator/mergeScan';

Observable.prototype.mergeScan = mergeScan;

declare module '../../Observable' {
  interface Observable<T> {
    mergeScan: typeof mergeScan;
  }
}
