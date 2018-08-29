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
      source(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T>, conn: Subscription) => {
        if (t === FOType.SUBSCRIBE) return;
        if (t === FOType.ERROR) {
          connection = undefined;
        }
        replayer = replayer || replaySubjectSource(bufferSize, windowTime);
        const dest = replayer;
        if (t === FOType.ERROR) {
          replayer = undefined;
        }
        dest(t, v, conn);
        if (t !== FOType.NEXT) {
          conn.unsubscribe();
        }
      }, connection);
    }
  });
}
