
import { Observable } from '../../internal/Observable';
import { mergeMap } from '../../internal/patching/operator/mergeMap';

Observable.prototype.mergeMap = <any>mergeMap;
Observable.prototype.flatMap = <any>mergeMap;

declare module '../../internal/Observable' {
  interface Observable<T> {
    flatMap: typeof mergeMap;
    mergeMap: typeof mergeMap;
  }
}
