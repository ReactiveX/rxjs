import { PartialObserver, FOType, Sink, SinkArg } from '../types';
import { Subscription } from '../Subscription';

export function sinkFromObserver<T>(observer: PartialObserver<T>): Sink<T> {
  return (type: FOType, arg: SinkArg<T>, subs: Subscription) => {
    switch (type) {
      case FOType.NEXT:
        if (typeof observer.next === 'function') {
          observer.next(arg, subs);
        }
        break;
      case FOType.ERROR:
        if (typeof observer.error === 'function') {
          observer.error(arg);
        }
        break;
      case FOType.COMPLETE:
        if (typeof observer.complete === 'function') {
          observer.complete();
        }
        break;
      default:
        break;
    }
  };
}
