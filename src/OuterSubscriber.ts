import {Subscriber} from './Subscriber';
import {InnerSubscriber} from './InnerSubscriber';

export class OuterSubscriber<T, R> extends Subscriber<T> {
  notifyNext(outerValue: T, innerValue: R, outerIndex: number, innerIndex: number): void {
    this.destination.next(innerValue);
  }

  notifyError(error: any, innerSub: InnerSubscriber<T, R>): void {
    this.destination.error(error);
  }

  notifyComplete(innerSub: InnerSubscriber<T, R>): void {
    this.destination.complete();
  }
}
