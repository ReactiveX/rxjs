
import { Observable } from '../../internal/Observable';
import { multicast } from '../../internal/patching/operator/multicast';

Observable.prototype.multicast = <any>multicast;

declare module '../../internal/Observable' {
  interface Observable<T> {
    multicast: typeof multicast;
  }
}
