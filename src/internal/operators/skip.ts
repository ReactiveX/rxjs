import { operator } from '../util/operator';
import { Observable } from '../Observable';
import { FOType, Sink, SinkArg } from '../types';
import { Subscription } from '../Subscription';

export function skip<T>(count: number) {
  return operator((source: Observable<T>, dest: Sink<T>, subs: Subscription) => {
    let i = 0;
    source(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T>, subs: Subscription) => {
      if (t !== FOType.NEXT || i++ >= count) {
        dest(t, v, subs);
      }
    }, subs);
  });
}
