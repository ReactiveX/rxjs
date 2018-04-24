import { Observable, sourceAsObservable } from '../Observable';
import { Operation, FOType, Sink, SinkArg, FObs } from '../types';
import { Subscription } from '../Subscription';

export function filter<T>(predicate: (value: T, index: number) => boolean): Operation<T, T> {
  return (source: Observable<T>) =>
    sourceAsObservable((type: FOType, dest: Sink<T>, subs: Subscription) => {
      if (type === FOType.SUBSCRIBE) {
        let i = 0;
        source(type, (t: FOType, v: SinkArg<T>, subs: Subscription) => {
          if (t === FOType.NEXT) {
            let send = false;
            try {
              send = predicate(v, i++);
            } catch (err) {
              dest(FOType.ERROR, err, subs);
              subs.unsubscribe();
              return;
            }
            if (!send) return;
          }
          dest(t, v, subs);
        }, subs);
      }
    });
}
