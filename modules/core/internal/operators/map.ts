import { Observable, sourceAsObservable } from '../Observable';
import { Operation, FOType, Sink, SinkArg, FObs, Subs, } from '../types';

export function map<T, R>(project: (value: T) => R): Operation<T, R> {
  return (source: Observable<T>) =>
    sourceAsObservable((type: FOType, dest: Sink<R>) => {
      if (type === FOType.SUBSCRIBE) {
        let subs: Subs;
        source(type, (t: FOType, v: SinkArg<T>) => {
          if (t === FOType.SUBSCRIBE) {
            subs = v;
          } else if (t === FOType.NEXT) {
            let result: R;
            try {
              result = project(v);
            } catch (err) {
              dest(FOType.ERROR, err);
              subs(FOType.COMPLETE, undefined);
              return;
            }
            dest(FOType.NEXT, result);
          } else {
            dest(t, v);
          }
        });
      }
    });
}
