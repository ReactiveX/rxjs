import { FObs, FOType, FOArg, FSub, FSubType } from '../types';
import { createSubscription } from '../createSubscription';

export function catchError<T, R>(handler: (error: any) => FObs<R>) {
  return (source: FObs<T>) =>
    (type: FOType, sink: FOArg<T>, subs: FSub) => {
      if (type === FOType.SUBSCRIBE) {
        source(FOType.SUBSCRIBE, (t: FOType, v: FOArg<T>, subs: FSub) => {
          if (t === FOType.ERROR) {
            let result: FObs<R>;
            try {
              result = handler(v);
            } catch (err) {
              sink(FOType.ERROR, err, subs);
              subs();
              return;
            }
            subs();
            subs = createSubscription();
            result(FOType.SUBSCRIBE, sink, subs);
          } else {
            sink(t, v, subs);
          }
        }, subs);
      }
    };
}