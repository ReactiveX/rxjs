import Subscriber from '../Subscriber';
import Observable from '../Observable';
import Subject from '../Subject';
import Map from '../util/Map';
import FastMap from '../util/FastMap';
import {RefCountSubscription, GroupedObservable} from './groupBy-support';

import tryCatch from '../util/tryCatch';
import {errorObject} from '../util/errorObject';

export function groupBy<T, R>(keySelector: (value: T) => string,
                              elementSelector?: (value: T) => R,
                              durationSelector?: (grouped: GroupedObservable<R>) => Observable<any>): GroupByObservable<T, R> {
  return new GroupByObservable<T, R>(this, keySelector, elementSelector, durationSelector);
}

export class GroupByObservable<T, R> extends Observable<GroupedObservable<R>> {
  constructor(public source: Observable<T>,
              private keySelector: (value: T) => string,
              private elementSelector?: (value: T) => R,
              private durationSelector?: (grouped: GroupedObservable<R>) => Observable<any>) {
    super();
  }

  _subscribe(subscriber) {
    const refCountSubscription = new RefCountSubscription();
    const groupBySubscriber = new GroupBySubscriber(
      subscriber, refCountSubscription, this.keySelector, this.elementSelector, this.durationSelector
    );
    refCountSubscription.setPrimary(this.source.subscribe(groupBySubscriber));
    return refCountSubscription;
  }
}

class GroupBySubscriber<T, R> extends Subscriber<T> {
  private groups = null;

  constructor(destination: Subscriber<R>,
              private refCountSubscription: RefCountSubscription<T>,
              private keySelector: (value: T) => string,
              private elementSelector?: (value: T) => R,
              private durationSelector?: (grouped: GroupedObservable<R>) => Observable<any>) {
    super();
    this.destination = destination;
    this.add(destination);
  }

  _next(x: T) {
    let key = tryCatch(this.keySelector)(x);
    if (key === errorObject) {
      this.error(key.e);
    } else {
      let groups = this.groups;
      const elementSelector = this.elementSelector;
      const durationSelector = this.durationSelector;

      if (!groups) {
        groups = this.groups = typeof key === 'string' ? new FastMap() : new Map();
      }

      let group: Subject<R> = groups.get(key);

      if (!group) {
        groups.set(key, group = new Subject());
        let groupedObservable = new GroupedObservable<R>(key, group, this.refCountSubscription);

        if (durationSelector) {
          let duration = tryCatch(durationSelector)(new GroupedObservable<R>(key, group));
          if (duration === errorObject) {
            this.error(duration.e);
          } else {
            this.add(duration._subscribe(new GroupDurationSubscriber(key, group, this)));
          }
        }

        this.destination.next(groupedObservable);
      }

      if (elementSelector) {
        let value = tryCatch(elementSelector)(x);
        if (value === errorObject) {
          this.error(value.e);
        } else {
          group.next(value);
        }
      } else {
        group.next(x);
      }
    }
  }

  _error(err: any) {
    const groups = this.groups;
    if (groups) {
      groups.forEach((group, key) => {
        group.error(err);
        this.removeGroup(key);
      });
    }
    this.destination.error(err);
  }

  _complete() {
    const groups = this.groups;
    if (groups) {
      groups.forEach((group, key) => {
        group.complete();
        this.removeGroup(group);
      });
    }
    this.destination.complete();
  }

  removeGroup(key: string) {
    this.groups.delete(key);
  }
}

class GroupDurationSubscriber<T> extends Subscriber<T> {
  constructor(private key: string,
              private group: Subject<T>,
              private parent: GroupBySubscriber<any, T>) {
    super(null);
  }

  _next(value: T) {
    this.group.complete();
    this.parent.removeGroup(this.key);
  }

  _error(err: any) {
    this.group.error(err);
    this.parent.removeGroup(this.key);
  }

  _complete() {
    this.group.complete();
    this.parent.removeGroup(this.key);
  }
}