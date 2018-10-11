import { Operation, FOType, Sink, SinkArg } from "rxjs/internal/types";
import { Observable } from "rxjs/internal/Observable";
import { Subscription } from 'rxjs/internal/Subscription';
import { lift } from 'rxjs/internal/util/lift';

export function take<T>(total: number): Operation<T, T> {
  return lift((source: Observable<T>, dest: Sink<T>, subs: Subscription) => {
    if (total <= 0) {
      dest(FOType.COMPLETE, undefined, subs);
      subs.unsubscribe();
      return;
    }
    let count = 0;

    const takeSubs = new Subscription();
    subs.add(takeSubs);

    source(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T>, subs: Subscription) => {
      if (t === FOType.NEXT) {
        const c = ++count;
        if (c <= total) {
          dest(FOType.NEXT, v, subs);
          if (c === total) {
            dest(FOType.COMPLETE, undefined, subs);
            takeSubs.unsubscribe();
          }
        }
      } else {
        dest(t, v, subs);
      }
    }, takeSubs);
  });
}
