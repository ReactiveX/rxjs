import { operator } from '../util/operator';
import { Observable } from '../Observable';
import { FOType, Sink, Operation, SinkArg } from '../types';
import { Subscription } from '../Subscription';

export function defaultIfEmpty<T, R>(defaultValue: R = null): Operation<T, T|R> {
  return operator((source: Observable<T>, type: FOType, dest: Sink<T|R>, subs: Subscription) => {
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
