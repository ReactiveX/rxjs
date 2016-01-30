
import {Observable} from '../../Observable';
import {multicast, MulticastSignature} from '../../operator/multicast';

Observable.prototype.multicast = multicast;

declare module '../../Observable' {
  interface Observable<T> {
    multicast: MulticastSignature<T>;
  }
}