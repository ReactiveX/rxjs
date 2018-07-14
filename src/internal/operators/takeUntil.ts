import { operator } from '../util/operator';
import { Observable } from '../Observable';
import { Subscription } from '../Subscription';
import { fromSource } from '../create/from';
import { FOType, ObservableInput, Operation, Sink, SinkArg } from '../types';

export function takeUntil<T>(notifier: ObservableInput<any>): Operation<T, T> {
  return operator((source: Observable<T>, type: FOType, dest: Sink<T>, subs: Subscription) => {
    let notified = false;
    const notifierSubs = new Subscription();
    subs.add(notifierSubs);

    fromSource(notifier)(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<any>, notiferSubs: Subscription) => {
      if (t === FOType.NEXT) {
        notified = true;
        dest(FOType.COMPLETE, undefined, subs);
        subs.unsubscribe();
      }
    }, notifierSubs);

    if (!notified) {
      source(FOType.SUBSCRIBE, dest, subs);
    }
  });
}
