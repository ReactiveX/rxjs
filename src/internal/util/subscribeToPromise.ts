import { Subscriber } from '../Subscriber';

export const subscribeToPromise = <T>(promise: PromiseLike<T>) => (subscriber: Subscriber<T>) => {
  promise.then(
    (value) => {
      if (!subscriber.closed) {
        subscriber.next(value);
        subscriber.complete();
      }
    },
    (err: any) => subscriber.error(err)
  )
  .then(null, (err: any) => {
    // Escaping the Promise trap: globally throw unhandled errors
    setTimeout(() => { throw err; });
  });
  return subscriber;
};
