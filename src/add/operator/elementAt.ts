
import {Observable} from '../../Observable';
import {elementAt, ElementAtSignature} from '../../operator/elementAt';

Observable.prototype.elementAt = elementAt;

declare module '../../Observable' {
  interface Observable<T> {
    elementAt: ElementAtSignature<T>;
  }
}