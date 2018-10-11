import { lift } from 'rxjs/internal/util/lift';
import { Observable } from 'rxjs/internal/Observable';
import { FOType, Sink, Operation, SinkArg } from 'rxjs/internal/types';
import { Subscription } from 'rxjs/internal/Subscription';

export function defaultIfEmpty<T, R>(defaultValue: R = null): Operation<T, T|R> {
  return lift((source: Observable<T>, dest: Sink<T|R>, subs: Subscription) => {
    let empty = true;
    source(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T>, subs: Subscription) => {
      if (t === FOType.COMPLETE && empty) {
        dest(FOType.NEXT, defaultValue, subs);
        dest(FOType.COMPLETE, undefined, subs);
      } else {
        if (t === FOType.NEXT) {
          empty = false;
        }
        dest(t, v, subs);
      }
    }, subs);
  });
}
