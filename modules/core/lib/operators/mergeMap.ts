import { FObs, FOType, FOArg, FSub, FSubType } from '../types';
import { createSubscription } from '../createSubscription';

export function mergeMap<T, R>(project: (value: T) => FObs<R>, concurrency = Number.POSITIVE_INFINITY) {
  return (source: FObs<T>) =>
    (type: FOType, sink: FOArg<R>, subs: FSub) => {
      if (type === FOType.SUBSCRIBE) {
        let active = 0;
        let outerComplete = false;
        const buffer = [];

        const complete = () => {
          sink(FOType.COMPLETE, undefined, subs);
          subs();
        };

        const innerSubscribeLoop = () => {
          while (buffer.length > 0 && active < concurrency) {
            active++;
            const innerSubs = createSubscription();
            subs(FSubType.ADD, innerSubs);
            let inner = buffer.shift();
            inner(FOType.SUBSCRIBE, (ti: FOType, vi: FOArg<R>, _: FSub) => {
              switch (ti) {
                case FOType.NEXT:
                  sink(FOType.NEXT, vi, subs);
                  break;
                case FOType.ERROR:
                  sink(FOType.ERROR, vi, subs);
                  subs();
                  break;
                case FOType.COMPLETE:
                  active--;
                  subs(FSubType.REMOVE, innerSubs);
                  innerSubs();
                  if (buffer.length > 0) {
                    innerSubscribeLoop();
                  } else if (outerComplete) {
                    complete();
                  }
                default:
              }
            }, innerSubs);
          }
        };

        source(FOType.SUBSCRIBE, (t: FOType, v: FOArg<T>, subs: FSub) => {
          switch (t) {
            case FOType.NEXT:
              let result: FObs<R>;
              try {
                result = project(v);
              } catch (err) {
                sink(FOType.ERROR, err, subs);
                subs();
                return;
              }
              buffer.push(result);
              innerSubscribeLoop();
              return;
            case FOType.ERROR:
              sink(FOType.ERROR, v, subs);
              subs();
              return;
            case FOType.COMPLETE:
              outerComplete = true;
              if (active === 0 && buffer.length === 0) {
                complete();
              }
              return;
            default:
              sink(t, v, subs);
          }
        }, subs);
      }
    };
}