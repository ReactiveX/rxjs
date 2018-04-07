import { FObs, FOType, FOArg, FSub } from '../types';

export function map<T, R>(project: (value: T) => R) {
  return (source: FObs<T>) =>
    (type: FOType, sink: FOArg<R>, subscription: FSub) => {
      const error = (err: any) => {
        sink(FOType.ERROR, err, subscription);
        subscription();
      };
      if (type === FOType.SUBSCRIBE) {
        source(FOType.SUBSCRIBE, (t: FOType, v: FOArg<T>, subscription: FSub) => {
          if (t === FOType.NEXT) {
            let result: R;
            try {
              result = project(v);
            } catch (err) {
              sink(FOType.ERROR, err, subscription);
              return;
            }
            sink(FOType.NEXT, result, subscription);
          } else {
            sink(t, v, subscription);
          }
        }, subscription);
      }
    };
}
