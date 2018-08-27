import { Operation, FOType, Sink, SinkArg } from "../types";
import { Observable } from "../Observable";
import { Subscription } from '../Subscription';
import { lift } from '../util/lift';

export function take<T>(total: number): Operation<T, T> {
  return lift((source: Observable<T>, dest: Sink<T>, subs: Subscription) => {
    if (total <= 0) {
      dest(FOType.COMPLETE, undefined, subs);
      subs.unsubscribe();
    }
    let count = 0;
    source(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T>, subs: Subscription) => {
      if (t === FOType.NEXT) {
        const c = ++count;
        if (c <= total) {
          dest(FOType.NEXT, v, subs);
          if (c === total) {
            dest(FOType.COMPLETE, undefined, subs);
            subs.unsubscribe();
          }
        }
      } else {
        dest(t, v, subs);
      }
    }, subs);
  });
}
