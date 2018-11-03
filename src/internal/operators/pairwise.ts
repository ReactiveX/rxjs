import { lift } from 'rxjs/internal/util/lift';
import { OperatorFunction, FOType, Sink, SinkArg } from 'rxjs/internal/types';
import { Observable } from 'rxjs/internal/Observable';
import { Subscription } from 'rxjs/internal/Subscription';

export function pairwise<T>(): OperatorFunction<T, [T, T]> {
  return lift((source: Observable<T>, dest: Sink<[T, T]>, subs: Subscription) => {
    let prev: T;
    let hasPrev = false;
    source(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T>, subs: Subscription) => {
      if (t === FOType.NEXT) {
        if (hasPrev) {
          dest(FOType.NEXT, [prev, v], subs);
        }
        hasPrev = true;
        prev = v;
      } else {
        dest(t, v, subs);
      }
    }, subs);
  });
}
