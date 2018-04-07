import { FObs, FOType, FOArg, FSub, FSubType } from '../types';
import { createSubscription } from '../createSubscription';

export function expand<T>(project: (value: T) => FObs<T>) {
  return (source: FObs<T>) =>
    (type: FOType, sink: FOArg<T>, subs: FSub) => {
      let outerComplete = false;
      let active = 0;
      if (type === FOType.SUBSCRIBE) {
        let expandSink: FObs<T>;
        expandSink = (t: FOType, v: FOArg<T>, subs: FSub) => {
          switch (t) {
            case FOType.NEXT:
              let inner: FObs<T>;
              try {
                inner = project(v);
              } catch (err) {
                sink(FOType.ERROR, err, subs);
                subs();
                return;
              }
              active++;
              const innerSubs = createSubscription();
              subs(FSubType.ADD, innerSubs);
              inner(FOType.SUBSCRIBE, (ti: FOType, vi: FOArg<T>, innerSubs: FSub) => {
                switch (ti) {
                  case FOType.NEXT:
                    if (!subs(FSubType.CHECK)) {
                      sink(FOType.NEXT, vi, subs);
                      expandSink(FOType.NEXT, vi, subs);
                    }
                    break;
                  case FOType.ERROR:
                    sink(FOType.ERROR, vi, subs);
                    subs();
                    break;
                  case FOType.COMPLETE:
                    active--;
                    if (!innerSubs) {
                      console.log((new Error()).stack);
                    }
                    innerSubs();
                    subs(FSubType.REMOVE, innerSubs);
                    if (active === 0 && outerComplete) {
                      sink(FOType.COMPLETE, undefined, subs);
                      subs();
                    }
                    break;
                  default:
                    break;
                }
              }, innerSubs);
              break;
            case FOType.ERROR:
              sink(FOType.ERROR, v, subs);
              subs();
              break;
            case FOType.COMPLETE:
              outerComplete = true;
              if (active === 0) {
                sink(FOType.COMPLETE, undefined, subs);
                subs();
              }
              break;
            default:
              return;
          }
        };

        source(FOType.SUBSCRIBE, expandSink, subs);
      }
    };
}