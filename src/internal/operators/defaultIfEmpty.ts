import { lift } from 'rxjs/internal/util/lift';
import { Observable } from 'rxjs/internal/Observable';
import { FOType, Sink, OperatorFunction, SinkArg } from 'rxjs/internal/types';
import { Subscription } from 'rxjs/internal/Subscription';

export function defaultIfEmpty<T>(defaultValue?: T): OperatorFunction<T, T>;
export function defaultIfEmpty<T, R>(defaultValue: R = null): OperatorFunction<T, T|R> {
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
