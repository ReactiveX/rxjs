import Observable from '../Observable';
import publish from './publish';

export default function share<T>(): Observable<T> {
  return publish.call(this).refCount();
};