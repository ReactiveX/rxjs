import { Source, FOType, Sink } from 'rxjs/internal/types';
import { Subscription } from 'rxjs/internal/Subscription';
export function iterableSource<T>(iterable: Iterable<T>): Source<T> {
  return (type: FOType.SUBSCRIBE, sink: Sink<T>, subs: Subscription) => {
    if (type === FOType.SUBSCRIBE) {
      const iterator = iterable[Symbol.iterator]();
      while (true) {
        if (subs.closed) {
          return;
        }
        const { done, value } = iterator.next();
        if (done) {
          break;
        }
        sink(FOType.NEXT, value, subs);
      }
      sink(FOType.COMPLETE, undefined, subs);
    }
  };
}
