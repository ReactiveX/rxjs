import { Operation, FOType, Sink, SinkArg } from "rxjs/internal/types";
import { Observable } from "../Observable";
import { Subscription } from 'rxjs/internal/Subscription';
import { lift } from 'rxjs/internal/util/lift';
import { tryUserFunction, resultIsError } from 'rxjs/internal/util/userFunction';


export function takeWhile<T>(predicate: (value: T, index: number) => boolean): Operation<T, T> {
  return lift((source: Observable<T>, dest: Sink<T>, subs: Subscription) => {
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
