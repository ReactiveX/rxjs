import { FObs, FOArg, FOType, FSub, FSubType } from '../types';

export function fromEvent<T>(target: any, eventName: string): FObs<T> {
  return (type: FOType, sink: FOArg<T>, subscription: FSub) => {
    if (type === FOType.SUBSCRIBE) {
      const handler = (e: any) => sink(FOType.NEXT, e, subscription);
      target.addEventListener(eventName, handler);
      subscription(FSubType.ADD, () => {
        target.removeEventListener(eventName, handler);
      });
    }
  };
}