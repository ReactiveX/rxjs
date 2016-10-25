import { Subscriber } from './Subscriber';
import { InnerSubscriber } from './InnerSubscriber';

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
export class OuterSubscriber<T, R> extends Subscriber<T> {
  notifyNext(_outerValue: T, innerValue: R,
             _outerIndex: number, _innerIndex: number,
             _innerSub: InnerSubscriber<T, R>): void {
    this.destination.next(innerValue);
  }

  notifyError(error: any, _innerSub: InnerSubscriber<T, R>): void {
    this.destination.error(error);
  }

  notifyComplete(_innerSub: InnerSubscriber<T, R>): void {
    this.destination.complete();
  }
}
