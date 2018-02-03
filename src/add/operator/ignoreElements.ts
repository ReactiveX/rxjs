
import { Observable } from '../../internal/Observable';
import { ignoreElements } from '../../internal/patching/operator/ignoreElements';

Observable.prototype.ignoreElements = ignoreElements;

declare module '../../internal/Observable' {
  interface Observable<T> {
    ignoreElements: typeof ignoreElements;
  }
}
