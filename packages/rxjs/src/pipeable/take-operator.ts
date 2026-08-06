import { subscribeToSource } from '../util/observable-helpers.js';

/** @internal */
export function takeOperator<In>(count: number): (source: Observable<In>, subscriber: Subscriber<In>) => void {
  return (source, subscriber) => {
    if (count <= 0) {
      subscriber.complete();
      return;
    }

    let seen = 0;
    const sourceController = new AbortController();
    subscribeToSource(
      source,
      subscriber,
      {
        next(value) {
          if (++seen <= count) {
            const reachedLimit = count <= seen;
            if (reachedLimit) {
              sourceController.abort();
            }
            subscriber.next(value);
            if (reachedLimit) {
              subscriber.complete();
            }
          }
        },
      },
      sourceController.signal
    );
  };
}
