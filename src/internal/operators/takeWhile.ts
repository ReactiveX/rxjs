import { Operation, FOType, Sink, SinkArg } from "../types";
import { Observable } from "../Observable";
import { Subscription } from '../Subscription';
import { lift } from '../util/lift';
import { tryUserFunction, resultIsError } from '../util/userFunction';


export function takeWhile<T>(predicate: (value: T, index: number) => boolean): Operation<T, T> {
  return lift((source: Observable<T>, dest: Sink<T>, subs: Subscription) => {
    let i = 0;
    const takeSubs = new Subscription();
    subs.add(takeSubs);
    source(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T>, subs: Subscription) => {
      if (t === FOType.NEXT) {
        const match = tryUserFunction(predicate, v, i++);
        if (resultIsError(match)) {
          dest(FOType.ERROR, match.error, subs);
          takeSubs.unsubscribe();
          return;
        }
        if (!match) {
          dest(FOType.COMPLETE, undefined, subs);
          takeSubs.unsubscribe();
          return;
        }
      }
      dest(t, v, subs);
    }, takeSubs);
  });
}
