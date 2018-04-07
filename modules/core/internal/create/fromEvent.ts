import { FObs, FOArg, FOType, FSub, FSubType } from '../types';
import { FObservable, Observable } from '../observable/Observable';

export function fFromEvent<T>(target: any, eventName: string): FObs<T> {
  if (typeof target.addEventListener === 'function') {
    return (type: FOType, sink: FOArg<T>, subscription: FSub) => {
      if (type === FOType.SUBSCRIBE) {
        const handler = (e: any) => sink(FOType.NEXT, e, subscription);
        target.addEventListener(eventName, handler);
        subscription(FSubType.ADD, () => {
          target.removeEventListener(eventName, handler);
        });
      }
    };
  } else if (typeof target.addListener === 'function') {
    // TODO: handle Node event listeners.
  } else if (typeof target.on === 'function') {
    // TODO: add JQuery style event listeners.
  } else {
    throw new Error('unhandled type'); // TODO: match old error
  }
}

export function fromEvent<T>(target: any, eventName: string): Observable<T> {
  return new FObservable(fFromEvent(target, eventName));
}