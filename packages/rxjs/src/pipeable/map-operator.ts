import { subscribeToSource } from '../util/observable-helpers.js';

/** @internal */
export function mapOperator<In, Out>(
  project: (value: In, index: number) => Out
): (source: Observable<In>, subscriber: Subscriber<Out>) => void {
  return (source, subscriber) => {
    let index = 0;

    subscribeToSource(source, subscriber, {
      next(value) {
        subscriber.next(project(value, index++));
      },
    });
  };
}
