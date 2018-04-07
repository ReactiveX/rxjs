import { FObs, FOType, FOArg, FSub, FSubType, FScheduler } from '../types';
import { asyncScheduler } from '../schedulers';
import { FObservable, Observable } from '../Observable';

export function fInterval(delay: number, scheduler: FScheduler = asyncScheduler) {
  return (type: FOType, sink: FOArg<number>, subs: FSub) => {
    if (type === FOType.SUBSCRIBE) {
      let i = 0;
      const handler = () => {
        sink(FOType.NEXT, i++, subs);
        if (!subs(FSubType.CHECK)) {
          scheduler(handler, delay, subs);
        }
      };
      if (!subs(FSubType.CHECK)) {
        scheduler(handler, delay, subs);
      }
    }
  };
}

export function interval(delay: number, scheduler: FScheduler = asyncScheduler): Observable<number> {
  return new FObservable(fInterval(delay, scheduler));
}