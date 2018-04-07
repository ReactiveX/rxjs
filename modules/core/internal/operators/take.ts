import { FObs, FOType, FSub, FOArg } from '../types';

export function take<T>(count: number) {
  return (source: FObs<T>) =>
    (type: FOType, sink: FOArg<T>, subscription: FSub) => {
      if (type === FOType.SUBSCRIBE) {
        let counter = 0;
        source(FOType.SUBSCRIBE, (t: FOType, v: FOArg<T>, subscription: FSub) => {
          switch (t) {
            case FOType.NEXT:
              counter++;
              sink(FOType.NEXT, v, subscription);
              if (counter >= count) {
                sink(FOType.COMPLETE, undefined, subscription);
                subscription();
              }
              break;
            case FOType.ERROR:
              sink(FOType.ERROR, v, subscription);
              subscription();
              break;
            case FOType.COMPLETE:
              sink(FOType.COMPLETE, v, subscription);
              subscription();
              break;
            default:
          }
        }, subscription);
      }
    };
}