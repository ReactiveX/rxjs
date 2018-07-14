import { Observable, sourceAsObservable } from '../Observable';
import { Operation, FOType, Sink, SinkArg, FObs } from '../types';
import { Subscription } from '../Subscription';
import { tryUserFunction, resultIsError } from '../util/userFunction';
import { operator } from '../util/operator';

export function filter<T>(predicate: (value: T, index: number) => boolean): Operation<T, T> {
  return operator((source: Observable<T>,type: FOType, dest: Sink<T>, subs: Subscription) => {
    let i = 0;
    source(type, (t: FOType, v: SinkArg<T>, subs: Subscription) => {
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
