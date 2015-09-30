import InnerSubscriber from './InnerSubscriber';
import Subscriber from './Subscriber';


export default class OuterSubscriber<T, R> extends Subscriber<T> {
  notifyComplete(inner?: InnerSubscriber<T, R>) {
    this.destination.complete();
  }

  notifyNext(outerValue: T, innerValue: R, outerIndex: number, innerIndex: number) {
    this.destination.next(innerValue);
  }

  notifyError(error?: any, inner?: InnerSubscriber<T, R>) {
    this.destination.error(error);
  }
}