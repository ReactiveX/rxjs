import { Observable } from '../Observable';
import { Observer } from '../Observer';
import { Subscription } from '../Subscription';

export function shareResults<T>(this: Observable<T>): Observable<T> {
  const observers: Observer<T>[] = [];
  let values: T[] = [];
  let completed = false;
  let subscription: Subscription = null;

  const sendNext = (value: T) => {
    values.push(value);
    observers.forEach(o => o.next(value));
  };

  const sendError = (err: any) => {
    values = [];
    subscription = null;
    while (observers.length > 0) {
      observers.shift().error(err);
    }
  };

  const sendComplete = () => {
    completed = true;
    while (observers.length > 0) {
      observers.shift().complete();
    }
  };

  return new Observable<T>((observer: Observer<T>) => {
    observers.push(observer);

    values.forEach((value: T) => {
      observer.next(value);
    });

    if (completed) {
      observer.complete();
    }

    if (!subscription) {
      subscription = this.subscribe(
        sendNext,
        sendError,
        sendComplete
      );
    }

    return () => {
      const i = observers.indexOf(observer);
      if (i !== -1) {
        observers.splice(i, 1);
      }

      if (observers.length === 0 && subscription) {
        subscription.unsubscribe();
      }
    };
  });
}