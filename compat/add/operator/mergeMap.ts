
import { Observable } from 'rxjs';
import { mergeMap } from '../../operator/mergeMap';

(Observable as any).prototype.mergeMap = <any>mergeMap;
(Observable as any).prototype.flatMap = <any>mergeMap;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    flatMap: typeof mergeMap;
    mergeMap: typeof mergeMap;
  }
}
