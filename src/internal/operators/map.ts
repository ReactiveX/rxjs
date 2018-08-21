import { Observable } from '../Observable';
import { Operation, FOType, Sink, SinkArg, FObs } from 'rxjs/internal/types';
import { Subscription } from 'rxjs/internal/Subscription';
import { tryUserFunction, resultIsError } from 'rxjs/internal/util/userFunction';
import { lift } from 'rxjs/internal/util/lift';

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
