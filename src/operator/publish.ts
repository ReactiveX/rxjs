import {Subject} from '../Subject';
import {multicast} from './multicast';
import {ConnectableObservable} from '../observable/ConnectableObservable';

/**
 * Returns a ConnectableObservable, which is a variety of Observable that waits until its connect method is called
 * before it begins emitting items to those Observers that have subscribed to it.
 *
 * <img src="./img/publish.png" width="100%">
 *
 * @return a ConnectableObservable that upon connection causes the source Observable to emit items to its Observers.
 * @method publish
 * @owner Observable
 */
export function publish<T>(): ConnectableObservable<T> {
  return multicast.call(this, new Subject<T>());
}

export interface PublishSignature<T> {
  (): ConnectableObservable<T>;
}
