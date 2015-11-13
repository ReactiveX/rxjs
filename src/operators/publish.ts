import {Observable} from '../Observable';
import {Subject} from '../Subject';
import {multicast} from './multicast';

export function publish<T>(): Observable<T> {
  return multicast.call(this, new Subject());
}
