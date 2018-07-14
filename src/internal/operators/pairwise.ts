import { operator } from '../util/operator';
import { Operation, FOType, Sink, SinkArg } from '../types';
import { Observable } from '../Observable';
import { Subscription } from '../Subscription';

export function pairwise<T>(): Operation<T, [T, T]> {
  return operator((source: Observable<T>, type: FOType, dest: Sink<[T, T]>, subs: Subscription) => {
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
