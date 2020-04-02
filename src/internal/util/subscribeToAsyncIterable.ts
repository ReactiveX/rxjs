import { Subscriber } from '../Subscriber';

export function subscribeToAsyncIterable<T>(asyncIterable: AsyncIterable<T>) {
  return (subscriber: Subscriber<T>) => {
    process(asyncIterable, subscriber).catch(err => subscriber.error(err));
  };
}

async function process<T>(asyncIterable: AsyncIterable<T>, subscriber: Subscriber<T>) {
  for await (const value of asyncIterable) {
    subscriber.next(value);
  }
  subscriber.complete();
}