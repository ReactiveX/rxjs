import { OperatorFunction, FOType, Sink, SinkArg } from 'rxjs/internal/types';
import { Observable } from 'rxjs/internal/Observable';
import { Subscription } from 'rxjs/internal/Subscription';
import { lift } from 'rxjs/internal/util/lift';

export function takeLast<T>(count: number = 1): OperatorFunction<T, T> {
  count = Math.max(count, 0);
  return lift((source: Observable<T>, dest: Sink<T>, subs: Subscription) => {
    const buffer: T[] = [];
    if (count === 0) {
      dest(FOType.COMPLETE, undefined, subs);
      return;
    }
    source(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T>, subs: Subscription) => {
      switch (t) {
        case FOType.NEXT:
          buffer.push(v);
          buffer.splice(0, buffer.length - count);
          break;
        case FOType.COMPLETE:
          while (buffer.length > 0) {
            dest(FOType.NEXT, buffer.shift(), subs);
          }
          // allow fall through, because t === COMPLETE and v === undefined
        default:
          dest(t, v, subs);
          break;
      }
    }, subs);
  });
}
