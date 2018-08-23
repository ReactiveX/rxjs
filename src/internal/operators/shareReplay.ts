import { Operation, FOType, Sink, SinkArg, FObs } from '../types';
import { Observable } from '../Observable';
import { Subscription } from '../Subscription';
import { lift } from '../util/lift';
import { replaySubjectSource } from '../ReplaySubject';

export function shareReplay<T>(
  bufferSize = Number.POSITIVE_INFINITY,
  windowTime = Number.POSITIVE_INFINITY,
): Operation<T, T> {
  let replayer: FObs<T>;
  let connection: Subscription;
  return lift((source: Observable<T>, sink: Sink<T>, subs: Subscription) => {
    replayer = replayer || replaySubjectSource(bufferSize, windowTime);
    replayer(FOType.SUBSCRIBE, sink, subs);
    if (!connection) {
      connection = new Subscription();
      source(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T>, connection: Subscription) => {
        if (t === FOType.SUBSCRIBE) return;
        let conn: Subscription;
        if (t !== FOType.NEXT) {
          conn = connection;
          connection = undefined;
        }
        replayer(t, v, connection);
        if (conn) {
          replayer = undefined;
          conn.unsubscribe();
        }
      }, connection);
    }
  });
}
