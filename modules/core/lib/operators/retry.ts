import { FObs, FOType, FOArg, FSub, FSubType } from '../types';
import { createSubscription } from '../createSubscription';
import { queue } from '../util/queue';

export function retry<T>(count = Number.POSITIVE_INFINITY) {
  return (source: FObs<T>) =>
    (type: FOType, sink: FOArg<T>, subs: FSub) => {
      if (type === FOType.SUBSCRIBE) {
        let retryCount = 0;
        const enqueue = queue();
        let doSubs: () => void;
        doSubs = () =>
          source(FOType.SUBSCRIBE, (t: FOType, v: FOArg<T>, subs: FSub) => {
            if (t === FOType.ERROR) {
              subs();
              subs = createSubscription();
              if (retryCount++ < count) {
                enqueue(doSubs);
              }
            } else {
              sink(t, v, subs);
            }
          }, subs);
        enqueue(doSubs);
      }
    };
}