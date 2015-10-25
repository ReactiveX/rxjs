import InnerSubscriber from './InnerSubscriber';
import Subscriber from './Subscriber';

export default class OuterSubscriber<T, R> extends Subscriber<T> {
  notifyComplete(inner?: InnerSubscriber<T, R>): void {
    this.destination.complete();
  }

  notifyNext(outerValue: T, innerValue: R, outerIndex: number, innerIndex: number): void {
    this.destination.next(innerValue);
  }

  notifyError(error?: any, inner?: InnerSubscriber<T, R>): void {
    this.destination.error(error);
  }
}