import { FObs, FOType, FOArg, FSub, FSubType } from '../types';
import { FObservable } from '../Observable';

export function fRange(start: number, end: number): FObs<number> {
  return (type: FOType, sink: FOArg<number>, subs: FSub) => {
    if (type !== FOType.SUBSCRIBE) { return; }
    if (start === end && !subs(FSubType.CHECK)) {
      sink(FOType.NEXT, start, subs);
      sink(FOType.COMPLETE, undefined, subs);
    }
    const mod = start < end ? 1 : -1;
    const check = start < end ? ((a, b) => a < b) : ((a, b) => b < a);
    for (let i = start; check(i, end) && !subs(FSubType.CHECK); i += mod) {
      sink(FOType.NEXT, i, subs);
    }
    sink(FOType.COMPLETE, undefined, subs);
  };
}

export function range(start: number, end: number) {
  return new FObservable(fRange(start, end));
}