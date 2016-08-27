
import { Observable } from '../../Observable';
import { ignoreElements, IgnoreElementsSignature } from '../../operator/ignoreElements';

Observable.prototype.ignoreElements = ignoreElements;

declare module '../../Observable' {
  interface Observable<T> {
    ignoreElements: IgnoreElementsSignature<T>;
  }
}