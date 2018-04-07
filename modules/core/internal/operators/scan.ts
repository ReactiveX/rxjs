import { FObs, FOType, FOArg, FSub, FSubType } from '../types';

export function scan<T, S>(reducer: (acc: S, value: T, index: number) => S, seed: S) {
  return (source: FObs<T>) =>
    (type: FOType, sink: FOArg<S>, subs: FSub) => {
      let state = seed;
      let i = 0;
      if (type === FOType.SUBSCRIBE) {
        source(FOType.SUBSCRIBE, (t: FOType, v: FOArg<T>, subs: FSub) => {
          if (t === FOType.NEXT) {
            let result: S;
            try {
              result = reducer(state, v, i++);
            } catch (err) {
              sink(FOType.ERROR, err, subs);
              subs();
              return;
            }
            state = result;
            sink(FOType.NEXT, state, subs);
          } else {
            sink(t, v, subs);
          }
        }, subs);
      }
    };
}