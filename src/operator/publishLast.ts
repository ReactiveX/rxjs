import { AsyncSubject } from '../AsyncSubject';
import { multicast } from './multicast';
import { ConnectableObservable } from '../observable/ConnectableObservable';

/**
 * @return {ConnectableObservable<T>}
 * @method publishLast
 * @owner Observable
 */
export function publishLast<T>(): ConnectableObservable<T> {
  return multicast.call(this, new AsyncSubject<T>());
}

export interface PublishLastSignature<T> {
  (): ConnectableObservable<T>;
}
