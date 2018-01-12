
import { Observable } from '../../internal/Observable';
import { mergeScan } from '../../internal/patching/operator/mergeScan';

Observable.prototype.mergeScan = mergeScan;

declare module '../../internal/Observable' {
  interface Observable<T> {
    mergeScan: typeof mergeScan;
  }
}
