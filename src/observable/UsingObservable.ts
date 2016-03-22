import {Observable, SubscribableOrPromise} from '../Observable';
import {Subscriber} from '../Subscriber';
import {Subscription} from '../Subscription';

import {subscribeToResult} from '../util/subscribeToResult';
import {OuterSubscriber} from '../OuterSubscriber';
/**
 * We need this JSDoc comment for affecting ESDoc.
 * @extends {Ignored}
 * @hide true
 */
export class UsingObservable<T> extends Observable<T> {

  static create<T>(resourceFactory: () => Subscription | void,
                   observableFactory: (resource: Subscription) => SubscribableOrPromise<T> | void): Observable<T> {
    return new UsingObservable<T>(resourceFactory, observableFactory);
  }

  constructor(private resourceFactory: () => Subscription | void,
              private observableFactory: (resource: Subscription) => SubscribableOrPromise<T> | void) {
    super();
  }

  protected _subscribe(subscriber: Subscriber<T>): Subscription | Function | void {
    const { resourceFactory, observableFactory } = this;

    let resource: Subscription;

    try {
      resource = <Subscription>resourceFactory();
      return new UsingSubscriber(subscriber, resource, observableFactory);
    } catch (err) {
      subscriber.error(err);
    }
  }
}

class UsingSubscriber<T> extends OuterSubscriber<T, T> {
  constructor(destination: Subscriber<T>,
              private resource: Subscription,
              private observableFactory: (resource: Subscription) => SubscribableOrPromise<T> | void) {
    super(destination);
    destination.add(resource);
    this.tryUse();
  }

  private tryUse(): void {
    try {
      const source = this.observableFactory.call(this, this.resource);
      if (source) {
        this.add(subscribeToResult(this, source));
      }
    } catch (err) {
      this._error(err);
    }
  }
}