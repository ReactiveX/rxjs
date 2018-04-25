import { Operation, Sink, FOType, SinkArg } from "../types";
import { Observable, sourceAsObservable } from "../Observable";
import { Subscription } from "../Subscription";

export function scan<T, R>(reducer: (state: R, value: T, index: number) => R, initialState?: R): Operation<T, R> {
  let hasState = arguments.length >= 2;
  return (source: Observable<T>) =>
    sourceAsObservable((type: FOType.SUBSCRIBE, dest: Sink<R>, subs: Subscription) => {
      if (type === FOType.SUBSCRIBE) {
        let i = 0;
        let state = initialState;
        source(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T>, subs: Subscription) => {
          if (t === FOType.NEXT) {
            const index = i++;
            if (hasState) {
              try {
                v = reducer(state, v, index);
              } catch (err) {
                dest(FOType.ERROR, err, subs);
                subs.unsubscribe();
                return;
              }
            }
            state = v;
            if (!hasState) {
              hasState = true;
              return;
            }
          }
          dest(t, v, subs);
        }, subs);
      }
    });
  }
