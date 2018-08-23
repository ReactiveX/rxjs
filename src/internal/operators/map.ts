import { Observable } from '../Observable';
import { Operation, FOType, Sink, SinkArg, FObs } from '../types';
import { Subscription } from '../Subscription';
import { tryUserFunction, resultIsError } from '../util/userFunction';
import { lift } from '../util/lift';

export function map<T, R>(project: (value: T, index: number) => R): Operation<T, R> {
  return lift((source: Observable<T>, dest: Sink<R>, subs: Subscription) => {
    let i = 0;
    source(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T>, subs: Subscription) => {
      if (t === FOType.NEXT) {
        v = tryUserFunction(project, v, i++);
        if (resultIsError(v)) {
          dest(FOType.ERROR, v.error, subs);
          subs.unsubscribe();
          return;
        }
      }
      dest(t, v, subs);
    }, subs);
  });
}
