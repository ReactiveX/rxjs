import { Observable } from '../observable/Observable';
import { FObs, FOType, FOArg, FSub, FSubType, SubscriptionLike } from '../types';
import { createSubscription } from './createSubscription';

export function toFObs<T>(observable: Observable<T>) {
  return (type: FOType, sink: FOArg<T>, subs: FSub) => {
    let hasSubscription = false;

    observable.subscribe({
      next (value: T, subscription: SubscriptionLike) {
        if (!hasSubscription) {
          hasSubscription = true;
          subs(FSubType.ADD, () => subscription.unsubscribe());
        }
        if (typeof sink !== 'function') {
          console.log((new Error()).stack);
        }
        sink(FOType.NEXT, value, subs);
      },
      error (err: any) {
        sink(FOType.ERROR, err, subs);
      },
      complete() {
        sink(FOType.COMPLETE, undefined, subs);
      }
    });
  };
}

export function toObservable<T>(fobs: FObs<T>): Observable<T> {
  return new Observable<T>(subscriber => {
    const subscription = createSubscription();
    fobs(FOType.SUBSCRIBE, (t: FOType, v: FOArg<T>, subscription: FSub) => {
      switch (t) {
        case FOType.NEXT:
          subscriber.next(v);
          break;
        case FOType.ERROR:
          subscriber.error(v);
          break;
        case FOType.COMPLETE:
          subscriber.complete();
          break;
        default:
      }
    }, subscription);
    return subscription;
  });
}
