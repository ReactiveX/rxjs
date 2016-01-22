import {Subscriber} from '../Subscriber';
import {Subscription} from '../Subscription';
import {Observable} from '../Observable';
import {Subject} from '../Subject';
import {Map} from '../util/Map';
import {FastMap} from '../util/FastMap';
import {tryCatch} from '../util/tryCatch';
import {errorObject} from '../util/errorObject';

export function groupBy<T, K, R>(keySelector: (value: T) => K,
                                 elementSelector?: (value: T) => R,
                                 durationSelector?: (grouped: GroupedObservable<K, R>) => Observable<any>): GroupByObservable<T, K, R> {
  return new GroupByObservable(this, keySelector, elementSelector, durationSelector);
}

export class GroupByObservable<T, K, R> extends Observable<GroupedObservable<K, R>> {
  constructor(public source: Observable<T>,
              private keySelector: (value: T) => K,
              private elementSelector?: (value: T) => R,
              private durationSelector?: (grouped: GroupedObservable<K, R>) => Observable<any>) {
    super();
  }

  protected _subscribe(subscriber: Subscriber<any>): Subscription {
    const refCountSubscription = new RefCountSubscription();
    const groupBySubscriber = new GroupBySubscriber(
      subscriber, refCountSubscription, this.keySelector, this.elementSelector, this.durationSelector
    );
    refCountSubscription.setPrimary(this.source.subscribe(groupBySubscriber));
    return refCountSubscription;
  }
}

class GroupBySubscriber<T, K, R> extends Subscriber<T> {
  private groups: Map<K, Subject<T|R>> = null;

  constructor(destination: Subscriber<R>,
              private refCountSubscription: RefCountSubscription,
              private keySelector: (value: T) => K,
              private elementSelector?: (value: T) => R,
              private durationSelector?: (grouped: GroupedObservable<K, R>) => Observable<any>) {
    super();
    this.destination = destination;
    this.add(destination);
  }

  protected _next(x: T): void {
    let key = tryCatch(this.keySelector)(x);
    if (key === errorObject) {
      this.error(errorObject.e);
    } else {
      let groups = this.groups;
      const elementSelector = this.elementSelector;
      const durationSelector = this.durationSelector;

      if (!groups) {
        groups = this.groups = typeof key === 'string' ? new FastMap() : new Map();
      }

      let group = groups.get(key);

      if (!group) {
        groups.set(key, group = new Subject<T|R>());
        let groupedObservable = new GroupedObservable(key, group, this.refCountSubscription);

        if (durationSelector) {
          let duration = tryCatch(durationSelector)(new GroupedObservable<K, R>(key, <any>group));
          if (duration === errorObject) {
            this.error(errorObject.e);
          } else {
            this.add(duration.subscribe(new GroupDurationSubscriber(key, group, this)));
          }
        }

        this.destination.next(groupedObservable);
      }

      if (elementSelector) {
        let value = tryCatch(elementSelector)(x);
        if (value === errorObject) {
          this.error(errorObject.e);
        } else {
          group.next(value);
        }
      } else {
        group.next(x);
      }
    }
  }

  protected _error(err: any): void {
    const groups = this.groups;
    if (groups) {
      groups.forEach((group, key) => {
        group.error(err);
        this.removeGroup(key);
      });
    }
    this.destination.error(err);
  }

  protected _complete(): void {
    const groups = this.groups;
    if (groups) {
      groups.forEach((group, key) => {
        group.complete();
        this.removeGroup(key);
      });
    }
    this.destination.complete();
  }

  removeGroup(key: K): void {
    this.groups.delete(key);
  }
}

class GroupDurationSubscriber<K, T> extends Subscriber<T> {
  constructor(private key: K,
              private group: Subject<T>,
              private parent: GroupBySubscriber<any, K, T>) {
    super();
  }

  protected _next(value: T): void {
    this.group.complete();
    this.parent.removeGroup(this.key);
  }

  protected _error(err: any): void {
    this.group.error(err);
    this.parent.removeGroup(this.key);
  }

  protected _complete(): void {
    this.group.complete();
    this.parent.removeGroup(this.key);
  }
}

export class RefCountSubscription extends Subscription {
  primary: Subscription;
  attemptedToUnsubscribePrimary: boolean = false;
  count: number = 0;

  constructor() {
    super();
  }

  setPrimary(subscription: Subscription) {
    this.primary = subscription;
  }

  unsubscribe() {
    if (!this.isUnsubscribed && !this.attemptedToUnsubscribePrimary) {
      this.attemptedToUnsubscribePrimary = true;
      if (this.count === 0) {
        super.unsubscribe();
        this.primary.unsubscribe();
      }
    }
  }
}

export class GroupedObservable<K, T> extends Observable<T> {
  constructor(public key: K,
              private groupSubject: Subject<T>,
              private refCountSubscription?: RefCountSubscription) {
    super();
  }

  protected _subscribe(subscriber: Subscriber<T>) {
    const subscription = new Subscription();
    if (this.refCountSubscription && !this.refCountSubscription.isUnsubscribed) {
      subscription.add(new InnerRefCountSubscription(this.refCountSubscription));
    }
    subscription.add(this.groupSubject.subscribe(subscriber));
    return subscription;
  }
}

export class InnerRefCountSubscription extends Subscription {
  constructor(private parent: RefCountSubscription) {
    super();
    parent.count++;
  }

  unsubscribe() {
    if (!this.parent.isUnsubscribed && !this.isUnsubscribed) {
      super.unsubscribe();
      this.parent.count--;
      if (this.parent.count === 0 && this.parent.attemptedToUnsubscribePrimary) {
        this.parent.unsubscribe();
        this.parent.primary.unsubscribe();
      }
    }
  }
}
