import { FObs, FOType, FOArg, FSub, FSubType } from '../types';

export function filter<T>(predicate: (value: T) => boolean) {
  return (source: FObs<T>) =>
    (type: FOType, sink: FOArg<T>, subs: FSub) => {
      if (type === FOType.SUBSCRIBE) {
        source(FOType.SUBSCRIBE, (t: FOType, v: FOArg<T>, subs: FSub) => {
          if (t === FOType.NEXT) {
            let result: boolean;
            try {
              result = predicate(v);
            } catch (err) {
              sink(FOType.ERROR, err, subs);
              subs();
              return;
            }
            if (result) {
              sink(FOType.NEXT, v, subs);
            }
          } else {
            sink(t, v, subs);
          }
        }, subs);
      }
    };
}