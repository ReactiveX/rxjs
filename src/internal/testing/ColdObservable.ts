import { sourceAsObservable } from 'rxjs/internal/util/sourceAsObservable';
import { Subscription } from 'rxjs/internal/Subscription';
import { TestMessage, TestScheduler, subscriptionLogger, TestObservable } from 'rxjs/internal/testing/TestScheduler';
import { FOType, Sink } from 'rxjs/internal/types';

export function coldObservable<T>(messages: TestMessage<T>[], scheduler: TestScheduler): TestObservable<T> {
  const subsLogger = subscriptionLogger();

  const result = sourceAsObservable((type: FOType.SUBSCRIBE, sink: Sink<any>, subs: Subscription) => {
    if (type === FOType.SUBSCRIBE) {
      const subsLogIndex = subsLogger.logSubscription(scheduler.now());

      subs.add(() => subsLogger.logUnsubscription(subsLogIndex, scheduler.now()));

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
            sink(t, a, subs);
          }, frame, { t, a, subs }, subs);
        }
      }, 0, undefined, subs);
    }
  });

  (result as TestObservable<T>).subscriptions = subsLogger.logs;
  (result as TestObservable<T>).messages = messages;

  return result as TestObservable<T>;
}
