import { Operation, FOType, Sink, SinkArg } from '../types';
import { sourceAsObservable, Observable } from '../Observable';
import { Subscription } from '../Subscription';
import { operator } from '../util/operator';

export function share<T>(): Operation<T, T> {
  let state: any[];
  let connection: Subscription;
  return operator((source: Observable<T>, type: FOType, sink: Sink<T>, subs: Subscription) => {
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
  });
}
