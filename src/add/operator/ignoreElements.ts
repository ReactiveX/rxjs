
import { Observable } from '../../Observable';
import { ignoreElements } from '../../internal/patching/operator/ignoreElements';

Observable.prototype.ignoreElements = ignoreElements;

declare module '../../Observable' {
  interface Observable<T> {
    ignoreElements: typeof ignoreElements;
  }
}
