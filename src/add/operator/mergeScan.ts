
import {Observable} from '../../Observable';
import {mergeScan, MergeScanSignature} from '../../operator/mergeScan';

Observable.prototype.mergeScan = mergeScan;

declare module '../../Observable' {
  interface IObservable<T> {
    mergeScan: MergeScanSignature<T>;
  }
}