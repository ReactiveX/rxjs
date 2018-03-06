
import { Observable } from 'rxjs';
import { mergeMapTo } from 'rxjs/internal/patching/operator/mergeMapTo';

(Observable as any).prototype.flatMapTo = <any>mergeMapTo;
(Observable as any).prototype.mergeMapTo = <any>mergeMapTo;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    flatMapTo: typeof mergeMapTo;
    mergeMapTo: typeof mergeMapTo;
  }
}
