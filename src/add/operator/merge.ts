
import {Observable} from '../../Observable';
import {merge, MergeSignature} from '../../operator/merge';

Observable.prototype.merge = merge;

declare module '../../Observable' {
  interface Observable<T> {
    merge: MergeSignature<T>;
  }
}