
import {Observable} from '../../Observable';
import {expand, ExpandSignature} from '../../operator/expand';

Observable.prototype.expand = expand;

declare module '../../Observable' {
  interface Observable<T> {
    expand: ExpandSignature<T>;
  }
}