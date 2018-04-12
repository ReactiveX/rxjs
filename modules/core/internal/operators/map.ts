import { Observable, sourceAsObservable } from '../Observable';
import { Operation, FOType, Sink, SinkArg, FObs } from '../types';
import { Subscription } from '../Subscription';

export function map<T, R>(project: (value: T) => R): Operation<T, R> {
  return (source: Observable<T>) =>
    sourceAsObservable((type: FOType, dest: Sink<R>, subs: Subscription) => {
      if (type === FOType.SUBSCRIBE) {
        source(type, (t: FOType, v: SinkArg<T>, subs: Subscription) => {
          if (t === FOType.NEXT) {
            let result: R;
            try {
              result = project(v);
            } catch (err) {
              dest(FOType.ERROR, err, subs);
              subs.unsubscribe();
              return;
            }
            dest(FOType.NEXT, result, subs);
          } else {
            dest(t, v, subs);
          }
        }, subs);
      }
    });
}
