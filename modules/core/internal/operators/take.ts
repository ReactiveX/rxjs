import { Operation, FOType, Sink, SinkArg } from "../types";
import { Observable, Subscription } from "../..";
import { sourceAsObservable } from "../Observable";

export function take<T>(count: number): Operation<T, T> {
  return (source: Observable<T>) =>
    sourceAsObservable((type: FOType.SUBSCRIBE, dest: Sink<T>, subs: Subscription) => {
      if (type === FOType.SUBSCRIBE) {
        let counter = 0;
        source(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T>, subs: Subscription) => {
          switch (t) {
            case FOType.NEXT:
              counter++;
              dest(FOType.NEXT, v, subs);
              if (counter === count) {
                dest(FOType.COMPLETE, undefined, subs);
                subs.unsubscribe();
              }
              break;
            case FOType.ERROR:
            case FOType.COMPLETE:
            default:
              dest(t, v, subs);
              break;
          }
        }, subs);
      }
    });
}
