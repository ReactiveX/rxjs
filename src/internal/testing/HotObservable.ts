import { Subject } from '../Subject';
import { Subscription } from '../Subscription';
import { TestMessage, TestScheduler, subscriptionLogger, TestObservable } from './TestScheduler';
import { FOType, Sink } from '../types';
import { sourceAsObservable } from '../Observable';

export interface HotObservable<T> extends TestObservable<T> {
  setup(): void;
}

export function hotObservable<T>(messages: TestMessage<T>[], scheduler: TestScheduler): HotObservable<T> {
  const subsLogger = subscriptionLogger();
  const subject = new Subject();

  const result = sourceAsObservable((type: FOType.SUBSCRIBE, sink: Sink<any>, subs: Subscription) => {
    if (type === FOType.SUBSCRIBE) {
      const subsLogIndex = subsLogger.logSubscription(scheduler.now());

      subs.add(() => subsLogger.logUnsubscription(subsLogIndex, scheduler.now()));

      subject(type, sink, subs);
    }
  });

  (result as HotObservable<T>).subscriptions = subsLogger.logs;
  (result as HotObservable<T>).messages = messages;
  (result as HotObservable<T>).setup = () => {
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
        scheduler.schedule(({ t, a, subs }) => subject(t, a, subs), frame, { t, a, subs });
      }
    });
  }
  return result as HotObservable<T>;
}
