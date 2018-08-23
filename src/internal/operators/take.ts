import { Operation, FOType, Sink, SinkArg } from "../types";
import { Observable } from "../Observable";
import { Subscription } from '../Subscription';
import { lift } from '../util/lift';

export function take<T>(count: number): Operation<T, T> {
  return lift((source: Observable<T>, dest: Sink<T>, subs: Subscription) => {
    if (count <= 0) {
      dest(FOType.COMPLETE, undefined, subs);
      subs.unsubscribe();
    }
    let i = 0;
    let doneTaking = false;
    source(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T>, subs: Subscription) => {
      if (t === FOType.NEXT) {
        doneTaking = ++i >= count;
        dest(t, v, subs);
        if (doneTaking) {
          dest(FOType.COMPLETE, undefined, subs);
          subs.unsubscribe();
        }
      } else {
        dest(t, v, subs);
      }
    }, subs);
  });
}
