import {Operator} from '../Operator';
import {Observable} from '../Observable';
import {Subscriber} from '../Subscriber';
import {Subscription} from '../Subscription';
import {OuterSubscriber} from '../OuterSubscriber';
import {subscribeToResult} from '../util/subscribeToResult';

export class RaceOperator<T, R> implements Operator<T, R> {
  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new RaceSubscriber(subscriber);
  }
}

export class RaceSubscriber<T, R> extends OuterSubscriber<T, R> {
  private hasFirst: boolean = false;
  private observables: Observable<any>[] = [];
  private subscriptions: Subscription[] = [];

  constructor(destination: Subscriber<T>) {
    super(destination);
  }

  protected _next(observable: any): void {
    this.observables.push(observable);
  }

  protected _complete() {
    const observables = this.observables;
    const len = observables.length;
    if (len === 0) {
      this.destination.complete();
    } else {
      for (let i = 0; i < len; i++) {
        let observable = observables[i];
        let subscription = subscribeToResult(this, observable, observable, i);

        this.subscriptions.push(subscription);
        this.add(subscription);
      }
      this.observables = null;
    }
  }

  notifyNext(observable: any, value: R, outerIndex: number): void {
    if (!this.hasFirst) {
      this.hasFirst = true;

      for (let i = 0; i < this.subscriptions.length; i++) {
        if (i !== outerIndex) {
          let subscription = this.subscriptions[i];

          subscription.unsubscribe();
          this.remove(subscription);
        }
      }

      this.subscriptions = null;
    }

    this.destination.next(value);
  }
}
