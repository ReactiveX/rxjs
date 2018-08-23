import { FOType, Sink, InteropObservable, ObservableLike } from '../types';
import { Subscription } from '../Subscription';
import { symbolObservable } from '../util/symbolObservable';
export function symbolObservableSource<T>(input: InteropObservable<T>) {
  return (type: FOType.SUBSCRIBE, sink: Sink<T>, subs: Subscription) => {
    if (type === FOType.SUBSCRIBE) {
      const obs: ObservableLike<T> = input[symbolObservable]();
      if (!obs) {
        sink(FOType.ERROR, new Error('invalid Symbol.observable implementation, observable not returned'), subs);
      }
      if (typeof obs.subscribe !== 'function') {
        sink(FOType.ERROR, new Error('invalid Symbol.observable implementation, no subscribe method on returned value'), subs);
        return;
      }
      let subscription: any;
      subs.add(() => {
        if (subscription && typeof subscription.unsubscribe === 'function') {
          subscription.unsubscribe();
        }
      });
      subscription = obs.subscribe({
        next(value: T) { sink(FOType.NEXT, value, subs); },
        error(err: any) { sink(FOType.ERROR, err, subs); },
        complete() { sink(FOType.COMPLETE, undefined, subs); },
      });
    }
  };
}
