import { Operation, FOType, Sink, SinkArg } from "../types";
import { Observable } from "../Observable";
import { Subscription } from '../Subscription';
import { operator } from '../util/operator';
import { tryUserFunction, resultIsError } from '../util/userFunction';


export function takeWhile<T>(predicate: (value: T, index: number) => boolean): Operation<T, T> {
  return operator((source: Observable<T>, dest: Sink<T>, subs: Subscription) => {
    let i = 0;
    source(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T>, subs: Subscription) => {
      if (t === FOType.NEXT) {
        const match = tryUserFunction(predicate, v, i++);
        if (resultIsError(match)) {
          dest(FOType.ERROR, match.error, subs);
          subs.unsubscribe();
          return;
        }
        if (!match) {
          dest(FOType.COMPLETE, undefined, subs);
          subs.unsubscribe();
          return;
        }
      }
      dest(t, v, subs);
    }, subs);
  });
}
