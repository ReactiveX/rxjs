
import {Observable} from '../../Observable';
import {mergeScan, MergeScanSignature} from '../../operator/mergeScan';

Observable.prototype.mergeScan = mergeScan;

declare module '../../Observable' {
  interface Observable<T> {
    mergeScan: MergeScanSignature<T>;
  }
}