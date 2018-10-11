import { Observable } from 'rxjs/internal/Observable';
import { Operation, FOType, Sink, SinkArg } from 'rxjs/internal/types';
import { Subscription } from 'rxjs/internal/Subscription';
import { lift } from 'rxjs/internal/util/lift';

export function ignoreElements<T>(): Operation<T, never> {
  return lift((source: Observable<T>, dest: Sink<never>, subs: Subscription) => {
    source(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T>, subs: Subscription) => {
      if (t !== FOType.NEXT) {
        dest(t, v, subs);
      }
    }, subs);
  });
}
