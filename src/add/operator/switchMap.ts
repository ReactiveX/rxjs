
import { Observable } from '../../Observable';
import { switchMap } from '../../internal/patching/operator/switchMap';

Observable.prototype.switchMap = switchMap;

declare module '../../Observable' {
  interface Observable<T> {
    switchMap: typeof switchMap;
  }
}
