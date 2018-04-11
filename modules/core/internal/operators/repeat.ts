import { Operation, FOType, Sink, SinkArg } from "../types";
import { Observable, Subscription } from "../..";
import { sourceAsObservable } from "../Observable";

export function repeat<T>(count: number): Operation<T, T> {
  return (source: Observable<T>) =>
    sourceAsObservable((type: FOType.SUBSCRIBE, dest: Sink<T>) => {
      if (type === FOType.SUBSCRIBE) {
        let subs: Subscription;
        let counter = 0;
        let sink: Sink<T>;
        sink = (t: FOType, v: SinkArg<T>) => {
          switch (t) {
            case FOType.SUBSCRIBE:
              subs = v;
              dest(FOType.SUBSCRIBE, subs);
              break;
            case FOType.COMPLETE:
              counter++;
              if (counter < count) {
                source(FOType.SUBSCRIBE, sink);
              } else {
                dest(FOType.COMPLETE, undefined);
                subs.unsubscribe();
              }
              break;
            case FOType.NEXT:
            case FOType.ERROR:
            default:
              dest(t, v);
              break;
          }
        };

        source(FOType.SUBSCRIBE, sink);
      }
    });
}
