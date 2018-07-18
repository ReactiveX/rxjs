import { Operation, FOType, Sink, SinkArg } from '../types';
import { operator } from '../util/operator';
import { Observable } from '../Observable';
import { Subscription } from '../Subscription';
import { tryUserFunction, resultIsError } from '../util/userFunction';

export function every<T>(predicate: (value: T, index: number) => boolean): Operation<T, boolean> {
  return operator((source: Observable<T>, dest: Sink<boolean>, subs: Subscription) => {
    let i = 0;
    source(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T>, subs: Subscription) => {
      if (t === FOType.NEXT) {
        const match = tryUserFunction(predicate, v, i++);
        if (resultIsError(match)) {
          dest(FOType.ERROR, match, subs);
          return;
        }
        if (!match) {
          dest(FOType.NEXT, false, subs);
          dest(FOType.COMPLETE, undefined, subs);
        }
      } else if (t === FOType.COMPLETE) {
        dest(FOType.NEXT, true, subs);
        dest(FOType.COMPLETE, undefined, subs);
      } else {
        dest(t, v, subs);
      }
    }, subs);
  });
}
