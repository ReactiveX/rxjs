import { lift } from 'rxjs/internal/util/lift';
import { Observable } from '../Observable';
import { FOType, Sink, SinkArg } from 'rxjs/internal/types';
import { Subscription } from 'rxjs/internal/Subscription';

export function skip<T>(count: number) {
  return lift((source: Observable<T>, dest: Sink<T>, subs: Subscription) => {
    let i = 0;
    source(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T>, subs: Subscription) => {
      if (t !== FOType.NEXT || i++ >= count) {
        dest(t, v, subs);
      }
    }, subs);
  });
}
