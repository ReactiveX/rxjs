import {ConnectableObservable} from '../observables/ConnectableObservable';
import {Subject} from '../Subject';
import {multicast} from './multicast';

export function publish<T>(): ConnectableObservable<T> {
  return multicast.call(this, new Subject());
}
