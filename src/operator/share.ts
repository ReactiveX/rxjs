import {Observable} from '../Observable';
import {multicast} from './multicast';
import {Subject} from '../Subject';

function shareSubjectFactory() {
  return new Subject();
}

export function share<T>(): Observable<T> {
  return multicast.call(this, shareSubjectFactory).refCount();
};
