import { ObservableInput, Operation, FOType, Sink, SinkArg } from "../types";
import { Observable, sourceAsObservable } from "../Observable";
import { Subscription } from "../Subscription";
import { from } from "../create/from";

export function catchError<T, R>(handler: (err: any) => ObservableInput<R>): Operation<T, T|R> {
  return (source: Observable<T>) =>
    sourceAsObservable((type: FOType.SUBSCRIBE, dest: Sink<T|R>, subs: Subscription) => {
      if (type === FOType.SUBSCRIBE) {
        source(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T|R>, subs: Subscription) => {
          switch (t) {
            case FOType.ERROR:
              let result: Observable<R>;
              subs.unsubscribe();
              try {
                result = from(handler(v));
              } catch (err) {
                dest(FOType.ERROR, err, subs);
                return;
              }
              result(FOType.SUBSCRIBE, dest, subs);
              break;
            case FOType.NEXT:
            case FOType.COMPLETE:
            default:
              dest(t, v, subs);
              break;
          }
        }, subs);
      }
    });
}
