import { Observable, sourceAsObservable } from '../Observable';
import { FOType, Sink } from '../types';
import { Subscription } from '../Subscription';

export function operator<T, R>(cb: (source: Observable<T>, type: FOType, dest: Sink<R>, subs: Subscription) => void) {
  return (source: Observable<T>) =>
    sourceAsObservable((type: FOType, dest: Sink<R>, subs: Subscription) => {
      if (type === FOType.SUBSCRIBE) {
        cb(source, type, dest, subs);
      }
    });
}
