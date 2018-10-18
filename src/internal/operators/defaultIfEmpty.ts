import { lift } from 'rxjs/internal/util/lift';
import { Observable } from 'rxjs/internal/Observable';
import { FOType, Sink, Operation, SinkArg } from 'rxjs/internal/types';
import { Subscription } from 'rxjs/internal/Subscription';

export function defaultIfEmpty<T>(defaultValue?: T): Operation<T, T>;
export function defaultIfEmpty<T, R>(defaultValue: R = null): Operation<T, T|R> {
  return lift((source: Observable<T>, dest: Sink<T|R>, subs: Subscription) => {
    let hasValue = false;
    source(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T>, subs: Subscription) => {
      hasValue = hasValue || t === FOType.NEXT;
      if (t === FOType.COMPLETE && !hasValue) {
        dest(FOType.NEXT, defaultValue, subs);
      }
      dest(t, v, subs);
    }, subs);
  });
}
