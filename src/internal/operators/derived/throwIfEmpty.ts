import { tap } from 'rxjs/internal/operators/tap';
import { EmptyError } from 'rxjs/internal/util/EmptyError';
import { OperatorFunction, Sink, FOType, SinkArg } from 'rxjs/internal/types';
import { Observable } from 'rxjs/internal/Observable';
import { lift } from 'rxjs/internal/util/lift';
import { Subscription } from 'rxjs/internal/Subscription';

function defaultErrorFactory() {
  return new EmptyError();
}

export function throwIfEmpty<T>(errorFactory: (() => any) = defaultErrorFactory): OperatorFunction<T, T|never> {
  return lift((source: Observable<T>, dest: Sink<T>, subs: Subscription) => {
    let hasValue = false;
    source(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T>, subs: Subscription) => {
      hasValue = hasValue || t === FOType.NEXT;
      if (t === FOType.COMPLETE && !hasValue) {
        dest(FOType.ERROR, errorFactory(), subs);
        return;
      }
      dest(t, v, subs);
    }, subs);
  });
}
