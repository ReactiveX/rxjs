import { Subject } from 'rxjs/internal/Subject';
import { Subscription } from 'rxjs/internal/Subscription';
import { TestMessage, TestScheduler, subscriptionLogger, TestObservable } from 'rxjs/internal/testing/TestScheduler';
import { FOType, Sink } from 'rxjs/internal/types';
import { sourceAsSubject } from '../util/sourceAsSubject';
import { Observable } from '../Observable';

export interface HotObservable<T> extends TestObservable<T>, Subject<T> {
  setup(): void;
}

export function hotObservable<T>(messages: TestMessage<T>[], scheduler: TestScheduler): HotObservable<T> {
  const subsLogger = subscriptionLogger();
  const subject = new Subject();

  const result = sourceAsSubject((type: FOType.SUBSCRIBE, sink: Sink<any>, subs: Subscription) => {
    if (type === FOType.SUBSCRIBE) {
      const subsLogIndex = subsLogger.logSubscription(scheduler.now());

      subs.add(() => subsLogger.logUnsubscription(subsLogIndex, scheduler.now()));

      subject(type, sink, subs);
    }
  }) as Observable<T> as HotObservable<T>;

  result.subscriptions = subsLogger.logs;
  result.messages = messages;
  result.setup = () => {
    const subs = new Subscription();
    scheduler.schedule(() => {
      for (const message of messages) {
        let t: FOType;
        let a: any = undefined;
        const { notification, frame } = message;
        if (notification.kind === 'N') {
          t = FOType.NEXT;
          a = notification.value;
        } else if (notification.kind === 'E') {
          t = FOType.ERROR;
          a = notification.error;
        } else if (notification.kind === 'C') {
          t = FOType.COMPLETE;
        } else {
          continue;
        }
        scheduler.schedule(({ t, a, subs }) => {
          subject(t, a, subs);
        }, frame, { t, a, subs });
      }
    });
  }
  return result;
}
