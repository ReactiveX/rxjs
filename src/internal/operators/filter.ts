import { Observable } from '../Observable';
import { Operation, FOType, Sink, SinkArg, FObs } from '../types';
import { Subscription } from '../Subscription';
import { tryUserFunction, resultIsError } from '../util/userFunction';
import { lift } from '../util/lift';

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
