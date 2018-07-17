import { Observable } from '../Observable';
import { Operation, FOType, Sink, SinkArg } from 'rxjs/internal/types';
import { Subscription } from 'rxjs/internal/Subscription';
import { operator } from 'rxjs/internal/util/operator';

export function ignoreElements<T>(): Operation<T, never> {
  return operator((source: Observable<T>, type: FOType, dest: Sink<never>, subs: Subscription) => {
    source(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T>, subs: Subscription) => {
      if (t !== FOType.NEXT) {
        dest(t, v, subs);
      }
    }, subs);
  });
}
