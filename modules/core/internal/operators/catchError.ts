import { ObservableInput, Operation, FOType, Sink, SinkArg } from "../types";
import { Observable, sourceAsObservable } from "../Observable";
import { Subscription } from "../Subscription";
import { from } from "../create/from";

export function catchError<T, R>(handler: (err: any) => ObservableInput<R>): Operation<T, T|R> {
  return (source: Observable<T>) =>
    sourceAsObservable((type: FOType.SUBSCRIBE, dest: Sink<T|R>) => {
      if (type === FOType.SUBSCRIBE) {
        let subs: Subscription;
        source(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T|R>) => {
          switch (t) {
            case FOType.SUBSCRIBE:
              subs = v;
              dest(FOType.SUBSCRIBE, subs);
              break;
            case FOType.ERROR:
              let result: Observable<R>;
              subs.unsubscribe();
              try {
                result = from(handler(v));
              } catch (err) {
                dest(FOType.ERROR, err);
                return;
              }
              result(FOType.SUBSCRIBE, dest);
              break;
            case FOType.NEXT:
            case FOType.COMPLETE:
            default:
              dest(t, v);
              break;
          }
        });
      }
    });
}
