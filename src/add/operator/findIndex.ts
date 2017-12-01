
import { Observable } from '../../internal/Observable';
import { findIndex } from '../../internal/patching/operator/findIndex';

Observable.prototype.findIndex = findIndex;

declare module '../../internal/Observable' {
  interface Observable<T> {
    findIndex: typeof findIndex;
  }
}
