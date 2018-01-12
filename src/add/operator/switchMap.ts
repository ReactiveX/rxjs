
import { Observable } from '../../internal/Observable';
import { switchMap } from '../../internal/patching/operator/switchMap';

Observable.prototype.switchMap = switchMap;

declare module '../../internal/Observable' {
  interface Observable<T> {
    switchMap: typeof switchMap;
  }
}
