import { FObs, FOType, FOArg, FSub, FSubType } from '../types';
import { createSubscription } from '../createSubscription';
import { queue } from '../util/queue';

export function repeat<T>(count = Number.POSITIVE_INFINITY) {
  return (source: FObs<T>) =>
    (type: FOType, sink: FOArg<T>, subs: FSub) => {
      if (type === FOType.SUBSCRIBE) {
        let repetitions = 0;
        const enqueue = queue();
        let doSubs: (subs: FSub) => () => void;
        doSubs = (subs) => () =>
          source(FOType.SUBSCRIBE, (t: FOType, v: FOArg<T>, subs: FSub) => {
            if (t === FOType.COMPLETE) {
              if (!subs) {
                console.log((new Error()).stack);
              }
              subs();
              subs = createSubscription();
              if (repetitions++ < count - 1) {
                enqueue(doSubs(subs));
              }
            } else {
              sink(t, v, subs);
            }
          }, subs);
        enqueue(doSubs(subs));
      }
    };
}