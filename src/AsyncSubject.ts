import {Subject} from './Subject';
import {Subscriber} from './Subscriber';
import {TeardownLogic} from './Subscription';

/**
 * @class AsyncSubject<T>
 */
export class AsyncSubject<T> extends Subject<T> {
  value: T = null;
  hasNext: boolean = false;

  protected _subscribe(subscriber: Subscriber<any>): TeardownLogic {
    if (this.hasCompleted && this.hasNext) {
      subscriber.next(this.value);
    }

    return super._subscribe(subscriber);
  }

  protected _next(value: T): void {
    this.value = value;
    this.hasNext = true;
  }

  protected _complete(): void {
    let index = -1;
    const observers = this.observers;
    const len = observers.length;

    // optimization to block our SubjectSubscriptions from
    // splicing themselves out of the observers list one by one.
    this.isUnsubscribed = true;

    if (this.hasNext) {
      while (++index < len) {
        let o = observers[index];
        o.next(this.value);
        o.complete();
      }
    } else {
      while (++index < len) {
        observers[index].complete();
      }
    }

    this.isUnsubscribed = false;

    this.unsubscribe();
  }
}
