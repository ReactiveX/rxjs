
import {Observable} from '../../Observable';
import {multicast, MulticastSignature} from '../../operator/multicast';

Observable.prototype.multicast = <any>multicast;

declare module '../../Observable' {
  interface Observable<T> {
    multicast: MulticastSignature<T>;
  }
}