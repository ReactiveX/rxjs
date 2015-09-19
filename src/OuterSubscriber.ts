import InnerSubscriber from './InnerSubscriber';
import Subscriber from './Subscriber';


export default class OuterSubscriber<T, R> extends Subscriber<T> {
  notifyComplete(inner?: InnerSubscriber<T, R>) {
    this.destination.complete();
  }
  
  notifyNext(innerValue: R, outerValue: T, innerIndex: number, outerIndex: number) {
    this.destination.next(innerValue);
  }
  
  notifyError(error?: any, inner?: InnerSubscriber<T, R>) {
    this.destination.error(error);
  }
}