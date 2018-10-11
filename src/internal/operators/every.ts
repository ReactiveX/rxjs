import { Operation, FOType, Sink, SinkArg } from 'rxjs/internal/types';
import { lift } from 'rxjs/internal/util/lift';
import { Observable } from 'rxjs/internal/Observable';
import { Subscription } from 'rxjs/internal/Subscription';
import { tryUserFunction, resultIsError } from 'rxjs/internal/util/userFunction';

export function every<T>(predicate: (value: T, index: number) => boolean): Operation<T, boolean> {
  return lift((source: Observable<T>, dest: Sink<boolean>, subs: Subscription) => {
    let i = 0;
    const everySubs = new Subscription();
    subs.add(everySubs);
    source(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T>, subs: Subscription) => {
      if (t === FOType.NEXT) {
        const match = tryUserFunction(predicate, v, i++);
        if (resultIsError(match)) {
          dest(FOType.ERROR, match.error, subs);
          return;
        }
        if (!match) {
          dest(FOType.NEXT, false, subs);
          dest(FOType.COMPLETE, undefined, subs);
          everySubs.unsubscribe();
        }
      } else if (t === FOType.COMPLETE) {
        dest(FOType.NEXT, true, subs);
        dest(FOType.COMPLETE, undefined, subs);
      } else {
        dest(t, v, subs);
      }
    }, everySubs);
  });
}
