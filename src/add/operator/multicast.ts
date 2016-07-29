
import {Observable, IObservable} from '../../Observable';
import {multicast, MulticastSignature} from '../../operator/multicast';

Observable.prototype.multicast = <any>multicast;

declare module '../../Observable' {
  interface IObservable<T> {
    multicast: MulticastSignature<T>;
  }
}