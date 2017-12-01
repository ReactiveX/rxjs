
import { Observable } from '../../internal/Observable';
import { mergeMapTo } from '../../internal/patching/operator/mergeMapTo';

Observable.prototype.flatMapTo = <any>mergeMapTo;
Observable.prototype.mergeMapTo = <any>mergeMapTo;

declare module '../../internal/Observable' {
  interface Observable<T> {
    flatMapTo: typeof mergeMapTo;
    mergeMapTo: typeof mergeMapTo;
  }
}
