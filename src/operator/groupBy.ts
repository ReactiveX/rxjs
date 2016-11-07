import { Subscriber } from '../Subscriber';
import { Subscription } from '../Subscription';
import { Observable } from '../Observable';
import { Operator } from '../Operator';
import { Subject } from '../Subject';
import { Map } from '../util/Map';
import { FastMap } from '../util/FastMap';

/* tslint:disable:max-line-length */
export function groupBy<T, K>(this: Observable<T>, keySelector: (value: T) => K): Observable<GroupedObservable<K, T>>;
export function groupBy<T, K>(this: Observable<T>, keySelector: (value: T) => K, elementSelector: void, durationSelector: (grouped: GroupedObservable<K, T>) => Observable<any>): Observable<GroupedObservable<K, T>>;
export function groupBy<T, K, R>(this: Observable<T>, keySelector: (value: T) => K, elementSelector?: (value: T) => R, durationSelector?: (grouped: GroupedObservable<K, R>) => Observable<any>): Observable<GroupedObservable<K, R>>;
export function groupBy<T, K, R>(this: Observable<T>, keySelector: (value: T) => K, elementSelector?: (value: T) => R, durationSelector?: (grouped: GroupedObservable<K, R>) => Observable<any>, subjectSelector?: () => Subject<R>): Observable<GroupedObservable<K, R>>;
/* tslint:disable:max-line-length */

/**
 * Groups the items emitted by an Observable according to a specified criterion,
 * and emits these grouped items as `GroupedObservables`, one
 * {@link GroupedObservable} per group.
 *
 * <img src="./img/groupBy.png" width="100%">
 *
 * @param {function(value: T): K} keySelector a function that extracts the key
 * for each item.
 * @param {function(value: T): R} [elementSelector] a function that extracts the
 * return element for each item.
 * @param {function(grouped: GroupedObservable<K,R>): Observable<any>} [durationSelector]
 * a function that returns an Observable to determine how long each group should
 * exist.
 * @return {Observable<GroupedObservable<K,R>>} an Observable that emits
 * GroupedObservables, each of which corresponds to a unique key value and each
 * of which emits those items from the source Observable that share that key
 * value.
 * @method groupBy
 * @owner Observable
 */
export function groupBy<T, K, R>(this: Observable<T>, keySelector: (value: T) => K,
                                 elementSelector?: ((value: T) => R) | void,
                                 durationSelector?: (grouped: GroupedObservable<K, R>) => Observable<any>,
                                 subjectSelector?: () => Subject<R>): Observable<GroupedObservable<K, R>> {
  return this.lift(new GroupByOperator(keySelector, elementSelector, durationSelector, subjectSelector));
}

export interface RefCountSubscription {
  count: number;
  unsubscribe: () => void;
  closed: boolean;
  attemptedToUnsubscribe: boolean;
}

class GroupByOperator<T, K, R> implements Operator<T, GroupedObservable<K, R>> {
  constructor(private keySelector: (value: T) => K,
              private elementSelector?: ((value: T) => R) | void,
              private durationSelector?: (grouped: GroupedObservable<K, R>) => Observable<any>,
              private subjectSelector?: () => Subject<R>) {
  }

  call(subscriber: Subscriber<GroupedObservable<K, R>>, source: any): any {
    return source._subscribe(new GroupBySubscriber(
      subscriber, this.keySelector, this.elementSelector, this.durationSelector, this.subjectSelector
    ));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class GroupBySubscriber<T, K, R> extends Subscriber<T> implements RefCountSubscription {
  private groups: Map<K, Subject<T|R>> = null;
  public attemptedToUnsubscribe: boolean = false;
  public count: number = 0;

  constructor(destination: Subscriber<GroupedObservable<K, R>>,
              private keySelector: (value: T) => K,
              private elementSelector?: ((value: T) => R) | void,
              private durationSelector?: (grouped: GroupedObservable<K, R>) => Observable<any>,
              private subjectSelector?: () => Subject<R>) {
    super(destination);
  }

  protected _next(value: T): void {
    let key: K;
    try {
      key = this.keySelector(value);
    } catch (err) {
      this.error(err);
      return;
    }

    this._group(value, key);
  }

  private _group(value: T, key: K) {
    let groups = this.groups;

    if (!groups) {
      groups = this.groups = typeof key === 'string' ? new FastMap() : new Map();
    }

    let group = groups.get(key);

    let element: R;
    if (this.elementSelector) {
      try {
        element = this.elementSelector(value);
      } catch (err) {
        this.error(err);
      }
    } else {
      element = <any>value;
    }

    if (!group) {
      group = this.subjectSelector ? this.subjectSelector() : new Subject<R>();
      groups.set(key, group);
      const groupedObservable = new GroupedObservable(key, group, this);
      this.destination.next(groupedObservable);
      if (this.durationSelector) {
        let duration: any;
        try {
          duration = this.durationSelector(new GroupedObservable<K, R>(key, <Subject<R>>group));
        } catch (err) {
          this.error(err);
          return;
        }
        this.add(duration.subscribe(new GroupDurationSubscriber(key, group, this)));
      }
    }

    if (!group.closed) {
      group.next(element);
    }
  }

  protected _error(err: any): void {
    const groups = this.groups;
    if (groups) {
      groups.forEach((group, key) => {
        group.error(err);
      });

      groups.clear();
    }
    this.destination.error(err);
  }

  protected _complete(): void {
    const groups = this.groups;
    if (groups) {
      groups.forEach((group, key) => {
        group.complete();
      });

      groups.clear();
    }
    this.destination.complete();
  }

  removeGroup(key: K): void {
    this.groups.delete(key);
  }

  unsubscribe() {
    if (!this.closed && !this.attemptedToUnsubscribe) {
      this.attemptedToUnsubscribe = true;
      if (this.count === 0) {
        super.unsubscribe();
      }
    }
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class GroupDurationSubscriber<K, T> extends Subscriber<T> {
  constructor(private key: K,
              private group: Subject<T>,
              private parent: GroupBySubscriber<any, K, T>) {
    super();
  }

  protected _next(value: T): void {
    this._complete();
  }

  protected _error(err: any): void {
    const group = this.group;
    if (!group.closed) {
      group.error(err);
    }
    this.parent.removeGroup(this.key);
  }

  protected _complete(): void {
    const group = this.group;
    if (!group.closed) {
      group.complete();
    }
    this.parent.removeGroup(this.key);
  }
}

/**
 * An Observable representing values belonging to the same group represented by
 * a common key. The values emitted by a GroupedObservable come from the source
 * Observable. The common key is available as the field `key` on a
 * GroupedObservable instance.
 *
 * @class GroupedObservable<K, T>
 */
export class GroupedObservable<K, T> extends Observable<T> {
  constructor(public key: K,
              private groupSubject: Subject<T>,
              private refCountSubscription?: RefCountSubscription) {
    super();
  }

  protected _subscribe(subscriber: Subscriber<T>) {
    const subscription = new Subscription();
    const {refCountSubscription, groupSubject} = this;
    if (refCountSubscription && !refCountSubscription.closed) {
      subscription.add(new InnerRefCountSubscription(refCountSubscription));
    }
    subscription.add(groupSubject.subscribe(subscriber));
    return subscription;
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class InnerRefCountSubscription extends Subscription {
  constructor(private parent: RefCountSubscription) {
    super();
    parent.count++;
  }

  unsubscribe() {
    const parent = this.parent;
    if (!parent.closed && !this.closed) {
      super.unsubscribe();
      parent.count -= 1;
      if (parent.count === 0 && parent.attemptedToUnsubscribe) {
        parent.unsubscribe();
      }
    }
  }
}
