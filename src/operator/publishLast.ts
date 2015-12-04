import {AsyncSubject} from '../subject/AsyncSubject';
import {multicast} from './multicast';
import {ConnectableObservable} from '../observable/ConnectableObservable';

export function publishLast<T>(): ConnectableObservable<T> {
  return multicast.call(this, new AsyncSubject());
}