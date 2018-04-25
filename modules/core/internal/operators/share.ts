import { Operation, FOType, Sink, SinkArg } from "../types";
import { sourceAsObservable, Observable } from "../Observable";
import { Subscription } from "../Subscription";

export function share<T>(): Operation<T, T> {
  let state: any[];
  let connection: Subscription;
  return (source: Observable<T>) =>
    sourceAsObservable((type: FOType.SUBSCRIBE, sink: Sink<T>, subs: Subscription) => {
      if (type === FOType.SUBSCRIBE) {
        state = state || [];
        state.push(sink, subs);
        if (!connection) {
          connection = new Subscription();
          source(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T>, connection: Subscription) => {
            if (t === FOType.SUBSCRIBE) return;
            const copy = state.slice(0);
            let conn: Subscription;
            if (t !== FOType.NEXT) {
              state = [];
              conn = connection;
              connection = undefined;
            }
            for (let i = 0; i < copy.length; i += 2) {
              copy[i](t, v, copy[i + 1]);
            }
            if (conn){
              conn.unsubscribe();
            }
          }, connection);
        }
      }
    });
}
