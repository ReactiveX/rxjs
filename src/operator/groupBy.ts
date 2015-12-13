import {Subscriber} from '../Subscriber';
import {Subscription} from '../Subscription';
import {Observable} from '../Observable';
import {Subject} from '../Subject';
import {Map} from '../util/Map';
import {FastMap} from '../util/FastMap';
import {RefCountSubscription, GroupedObservable} from './groupBy-support';
import {tryCatch} from '../util/tryCatch';
import {errorObject} from '../util/errorObject';
import {_Selector} from '../types';

export function groupBy<T, TKey, R>(keySelector: _Selector<T, TKey>,
                                    elementSelector?: _Selector<T, R>,
                                    durationSelector?: (grouped: GroupedObservable<TKey, R>) => Observable<any>): GroupByObservable<T, TKey, R> {
  return new GroupByObservable(this, keySelector, elementSelector, durationSelector);
}

export class GroupByObservable<T, TKey, R> extends Observable<GroupedObservable<TKey, R>> {
  constructor(public source: Observable<T>,
              private keySelector: _Selector<T, TKey>,
              private elementSelector?: _Selector<T, R>,
              private durationSelector?: (grouped: GroupedObservable<TKey, R>) => Observable<any>) {
    super();
  }

  _subscribe(subscriber: Subscriber<any>): Subscription<T> {
    const refCountSubscription = new RefCountSubscription();
    const groupBySubscriber = new GroupBySubscriber(
      subscriber, refCountSubscription, this.keySelector, this.elementSelector, this.durationSelector
    );
    refCountSubscription.setPrimary(this.source.subscribe(groupBySubscriber));
    return refCountSubscription;
  }
}

class GroupBySubscriber<T, TKey, R> extends Subscriber<T> {
  private groups: Map<TKey, Subject<T|R>> = null;

  constructor(destination: Subscriber<R>,
              private refCountSubscription: RefCountSubscription<T>,
              private keySelector: _Selector<T, TKey>,
              private elementSelector?: _Selector<T, R>,
              private durationSelector?: (grouped: GroupedObservable<TKey, R>) => Observable<any>) {
    super();
    this.destination = destination;
    this.add(destination);
  }

  _next(x: T): void {
    let key = tryCatch(this.keySelector)(x);
    if (key as any === errorObject) {
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
          let duration = tryCatch(durationSelector)(new GroupedObservable<TKey, R>(key, <any>group));
          if (duration as any === errorObject) {
            this.error(errorObject.e);
          } else {
            this.add(duration._subscribe(new GroupDurationSubscriber(key, group, this)));
          }
        }

        this.destination.next(groupedObservable);
      }

      if (elementSelector) {
        let value = tryCatch(elementSelector)(x);
        if (value as any === errorObject) {
          this.error(errorObject.e);
        } else {
          group.next(value);
        }
      } else {
        group.next(x);
      }
    }
  }

  _error(err: any): void {
    const groups = this.groups;
    if (groups) {
      groups.forEach((group, key) => {
        group.error(err);
        this.removeGroup(key);
      });
    }
    this.destination.error(err);
  }

  _complete(): void {
    const groups = this.groups;
    if (groups) {
      groups.forEach((group, key) => {
        group.complete();
        this.removeGroup(key);
      });
    }
    this.destination.complete();
  }

  removeGroup(key: TKey): void {
    this.groups.delete(key);
  }
}

class GroupDurationSubscriber<TKey, T> extends Subscriber<T> {
  constructor(private key: TKey,
              private group: Subject<T>,
              private parent: GroupBySubscriber<any, TKey, T>) {
    super(null);
  }

  _next(value: T): void {
    this.group.complete();
    this.parent.removeGroup(this.key);
  }

  _error(err: any): void {
    this.group.error(err);
    this.parent.removeGroup(this.key);
  }

  _complete(): void {
    this.group.complete();
    this.parent.removeGroup(this.key);
  }
}
