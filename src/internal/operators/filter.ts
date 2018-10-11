import { Observable } from 'rxjs/internal/Observable';
import { Operation, FOType, Sink, SinkArg, FObs } from 'rxjs/internal/types';
import { Subscription } from 'rxjs/internal/Subscription';
import { tryUserFunction, resultIsError } from 'rxjs/internal/util/userFunction';
import { lift } from 'rxjs/internal/util/lift';

export function filter<T>(predicate: (value: T, index: number) => boolean): Operation<T, T> {
  return lift((source: Observable<T>, dest: Sink<T>, subs: Subscription) => {
    let i = 0;
    source(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T>, subs: Subscription) => {
      if (t === FOType.NEXT) {
        const result = tryUserFunction(predicate, v, i++);
        if (resultIsError(result)) {
          dest(FOType.ERROR, result.error, subs);
          subs.unsubscribe();
          return;
        }
        if (!result) return;
      }
      dest(t, v, subs);
    }, subs);
  });
}
