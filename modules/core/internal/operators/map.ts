import { Observable, sourceAsObservable } from '../Observable';
import { Operation, FOType, Sink, SinkArg, FObs } from '../types';
import { Subscription } from '../Subscription';

export function map<T, R>(project: (value: T, index: number) => R): Operation<T, R> {
  return (source: Observable<T>) =>
    sourceAsObservable((type: FOType, dest: Sink<R>, subs: Subscription) => {
      if (type === FOType.SUBSCRIBE) {
        let i = 0;
        source(type, (t: FOType, v: SinkArg<T>, subs: Subscription) => {
          if (t === FOType.NEXT) {
            try {
              v = project(v, i++);
            } catch (err) {
              dest(FOType.ERROR, err, subs);
              subs.unsubscribe();
              return;
            }
          }
          dest(t, v, subs);
        }, subs);
      }
    });
}
