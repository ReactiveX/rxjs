import { OperatorFunction, FOType, Sink, SinkArg, FObs } from 'rxjs/internal/types';
import { Observable } from 'rxjs/internal/Observable';
import { Subscription } from 'rxjs/internal/Subscription';
import { lift } from 'rxjs/internal/util/lift';
import { replaySubjectSource } from 'rxjs/internal/ReplaySubject';

export function shareReplay<T>(
  bufferSize = Number.POSITIVE_INFINITY,
  windowTime = Number.POSITIVE_INFINITY,
): OperatorFunction<T, T> {
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
