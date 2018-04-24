import { Operation, FOType, Sink, SinkArg } from "../types";
import { Observable, Subscription } from "../..";
import { sourceAsObservable } from "../Observable";

export function repeat<T>(count: number): Operation<T, T> {
  return (source: Observable<T>) =>
    sourceAsObservable((type: FOType.SUBSCRIBE, dest: Sink<T>, subs: Subscription) => {
      if (type === FOType.SUBSCRIBE) {
        let counter = 0;
        let sink: Sink<T>;
        let currentSubs: Subscription;

        sink = (t: FOType, v: SinkArg<T>, subs: Subscription) => {
          switch (t) {
            case FOType.COMPLETE:
              counter++;
              if (counter < count) {
                currentSubs.unsubscribe();
                subs.remove(currentSubs);
                currentSubs = new Subscription();
                subs.add(currentSubs);
                source(FOType.SUBSCRIBE, sink, currentSubs);
              } else {
                dest(FOType.COMPLETE, undefined, subs);
                subs.unsubscribe();
              }
              break;
            case FOType.NEXT:
            case FOType.ERROR:
            default:
              dest(t, v, subs);
              break;
          }
        };

        currentSubs = new Subscription();
        subs.add(currentSubs);
        source(FOType.SUBSCRIBE, sink, currentSubs);
      }
    });
}
