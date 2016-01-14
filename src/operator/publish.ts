import {Subject} from '../Subject';
import {multicast} from './multicast';
import {ConnectableObservable} from '../observable/ConnectableObservable';

/**
 * Returns a ConnectableObservable, which is a variety of Observable that waits until its connect method is called
 * before it begins emitting items to those Observers that have subscribed to it.
 *
 * <img src="./img/publish.png" width="100%">
 *
 * @returns a ConnectableObservable that upon connection causes the source Observable to emit items to its Observers.
 */
export function publish<T>(): ConnectableObservable<T> {
  return multicast.call(this, new Subject<T>());
}
