import { lift } from '../util/lift';
import { Observable } from '../Observable';
import { Subscription } from '../Subscription';
import { fromSource } from "../sources/fromSource";
import { FOType, ObservableInput, Operation, Sink, SinkArg } from '../types';

export function skipUntil<T>(notifier: ObservableInput<any>): Operation<T, T> {
  return lift((source: Observable<T>, dest: Sink<T>, subs: Subscription) => {
    let notified = false;
    const notifierSubs = new Subscription();
    subs.add(notifierSubs);

    fromSource(notifier)(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<any>, notiferSubs: Subscription) => {
      switch (t) {
        case FOType.ERROR:
          dest(t, v, subs);
          subs.unsubscribe();
          break;
        case FOType.NEXT:
          notified = true;
        case FOType.COMPLETE:
          notifierSubs.unsubscribe();
        default:
          break;
      }
    }, notifierSubs);

    source(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T>, subs: Subscription) => {
      if (notified || t !== FOType.NEXT) {
        dest(t, v, subs);
      }
    }, subs);
  });
}
