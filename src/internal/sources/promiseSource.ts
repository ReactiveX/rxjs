import { Source, FOType, Sink } from '../types';
import { Subscription } from '../Subscription';
export function promiseSource<T>(promise: PromiseLike<T>): Source<T> {
  return (type: FOType.SUBSCRIBE, sink: Sink<T>, subs: Subscription) => {
    if (type === FOType.SUBSCRIBE) {
      promise.then(value => {
        if (!subs.closed) {
          sink(FOType.NEXT, value, subs);
          sink(FOType.COMPLETE, undefined, subs);
        }
      }, err => {
        if (!subs.closed) {
          sink(FOType.ERROR, err, subs);
        }
      });
    }
  };
}
