import { Operation, FOType, Sink, SinkArg } from 'rxjs/internal/types';
import { Observable } from 'rxjs/internal/Observable';
import { Subscription } from 'rxjs/internal/Subscription';
import { lift } from 'rxjs/internal/util/lift';

export function share<T>(): Operation<T, T> {
  let state: any[];
  let connection: Subscription;
  return lift((source: Observable<T>, sink: Sink<T>, subs: Subscription) => {
    state = state || [];
    state.push(sink, subs);
    subs.add(() => {
      const index = state.indexOf(sink);
      if (index >= 0) {
        state.splice(index, 2);
        if (connection && state.length === 0) {
          connection.unsubscribe();
          connection = undefined;
        }
      }
    });
    if (!connection) {
      connection = new Subscription();
      source(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T>, conn: Subscription) => {
        if (t === FOType.SUBSCRIBE) return;
        const copy = state.slice(0);
        if (t !== FOType.NEXT) {
          connection = undefined;
        }

        for(let i = 0; i < copy.length; i += 2) {
          copy[i](t, v, copy[i + 1]);
        }

        if (t !== FOType.NEXT) {
          conn.unsubscribe();
        }
      }, connection);
    }
  });
}
