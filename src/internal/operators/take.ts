import { Operation, FOType, Sink, SinkArg } from "../types";
import { Observable, sourceAsObservable } from "../Observable";
import { Subscription } from '../Subscription';
import { operator } from '../util/operator';

export function take<T>(count: number): Operation<T, T> {
  return operator((source: Observable<T>, type: FOType, dest: Sink<T>, subs: Subscription) => {
    if (count <= 0) {
      dest(FOType.COMPLETE, undefined, subs);
      subs.unsubscribe();
    }
    let i = 0;
    let taking = true;
    source(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T>, subs: Subscription) => {
      if (taking && t === FOType.NEXT) {
        taking = ++i < count;
      }
      dest(t, v, subs);
      if (!taking && t === FOType.NEXT) {
        dest(FOType.COMPLETE, undefined, subs);
        subs.unsubscribe();
      }
    }, subs);
  });
}
