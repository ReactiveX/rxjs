import { Operation, FOType, Sink, SinkArg } from "../types";
import { Observable, Subscription } from "../..";
import { sourceAsObservable } from "../Observable";

export function take<T>(count: number): Operation<T, T> {
  return (source: Observable<T>) =>
    sourceAsObservable((type: FOType.SUBSCRIBE, dest: Sink<T>) => {
      if (type === FOType.SUBSCRIBE) {
        let subs: Subscription;
        let counter = 0;
        source(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T>) => {
          switch (t) {
            case FOType.SUBSCRIBE:
              subs = v;
              dest(FOType.SUBSCRIBE, subs);
              break;
            case FOType.NEXT:
              counter++;
              dest(FOType.NEXT, v);
              if (counter === count) {
                dest(FOType.COMPLETE, undefined);
                subs.unsubscribe();
              }
              break;
            case FOType.ERROR:
            case FOType.COMPLETE:
            default:
              dest(t, v);
              break;
          }
        });
      }
    });
}
