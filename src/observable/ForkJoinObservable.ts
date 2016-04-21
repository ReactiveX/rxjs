import {Observable, SubscribableOrPromise} from '../Observable';
import {Subscriber} from '../Subscriber';
import {Subscription} from '../Subscription';
import {EmptyObservable} from './EmptyObservable';
import {isArray} from '../util/isArray';

import {subscribeToResult} from '../util/subscribeToResult';
import {OuterSubscriber} from '../OuterSubscriber';
import {InnerSubscriber} from '../InnerSubscriber';

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @extends {Ignored}
 * @hide true
 */
export class ForkJoinObservable<T> extends Observable<T> {
  constructor(private sources: Array<SubscribableOrPromise<any>>,
              private resultSelector?: (...values: Array<any>) => T) {
    super();
  }

  /* tslint:disable:max-line-length */
  static create<T, T2>(v1: SubscribableOrPromise<T>, v2: SubscribableOrPromise<T2>): Observable<[T, T2]>;
  static create<T, T2, T3>(v1: SubscribableOrPromise<T>, v2: SubscribableOrPromise<T2>, v3: SubscribableOrPromise<T3>): Observable<[T, T2, T3]>;
  static create<T, T2, T3, T4>(v1: SubscribableOrPromise<T>, v2: SubscribableOrPromise<T2>, v3: SubscribableOrPromise<T3>, v4: SubscribableOrPromise<T4>): Observable<[T, T2, T3, T4]>;
  static create<T, T2, T3, T4, T5>(v1: SubscribableOrPromise<T>, v2: SubscribableOrPromise<T2>, v3: SubscribableOrPromise<T3>, v4: SubscribableOrPromise<T4>, v5: SubscribableOrPromise<T5>): Observable<[T, T2, T3, T4, T5]>;
  static create<T, T2, T3, T4, T5, T6>(v1: SubscribableOrPromise<T>, v2: SubscribableOrPromise<T2>, v3: SubscribableOrPromise<T3>, v4: SubscribableOrPromise<T4>, v5: SubscribableOrPromise<T5>, v6: SubscribableOrPromise<T6>): Observable<[T, T2, T3, T4, T5, T6]>;
  static create<T, T2, R>(v1: SubscribableOrPromise<T>, v2: SubscribableOrPromise<T2>, project: (v1: T, v2: T2) => R): Observable<R>;
  static create<T, T2, T3, R>(v1: SubscribableOrPromise<T>, v2: SubscribableOrPromise<T2>, v3: SubscribableOrPromise<T3>, project: (v1: T, v2: T2, v3: T3) => R): Observable<R>;
  static create<T, T2, T3, T4, R>(v1: SubscribableOrPromise<T>, v2: SubscribableOrPromise<T2>, v3: SubscribableOrPromise<T3>, v4: SubscribableOrPromise<T4>, project: (v1: T, v2: T2, v3: T3, v4: T4) => R): Observable<R>;
  static create<T, T2, T3, T4, T5, R>(v1: SubscribableOrPromise<T>, v2: SubscribableOrPromise<T2>, v3: SubscribableOrPromise<T3>, v4: SubscribableOrPromise<T4>, v5: SubscribableOrPromise<T5>, project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5) => R): Observable<R>;
  static create<T, T2, T3, T4, T5, T6, R>(v1: SubscribableOrPromise<T>, v2: SubscribableOrPromise<T2>, v3: SubscribableOrPromise<T3>, v4: SubscribableOrPromise<T4>, v5: SubscribableOrPromise<T5>, v6: SubscribableOrPromise<T6>, project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6) => R): Observable<R>;
  static create<T>(sources: SubscribableOrPromise<T>[]): Observable<T[]>;
  static create<R>(sources: SubscribableOrPromise<any>[]): Observable<R>;
  static create<T, R>(sources: SubscribableOrPromise<T>[], project: (...values: Array<T>) => R): Observable<R>;
  static create<R>(sources: SubscribableOrPromise<any>[], project: (...values: Array<any>) => R): Observable<R>;
  static create<T>(...sources: SubscribableOrPromise<T>[]): Observable<T[]>;
  static create<R>(...sources: SubscribableOrPromise<any>[]): Observable<R>;
  /* tslint:enable:max-line-length */
  /**
   * @param sources
   * @return {any}
   * @static true
   * @name forkJoin
   * @owner Observable
   */
  static create<T>(...sources: Array<SubscribableOrPromise<any> |
                                  Array<SubscribableOrPromise<any>> |
                                  ((...values: Array<any>) => any)>): Observable<T> {
    if (sources === null || arguments.length === 0) {
      return new EmptyObservable<T>();
    }

    let resultSelector: (...values: Array<any>) => any = null;
    if (typeof sources[sources.length - 1] === 'function') {
      resultSelector = <(...values: Array<any>) => any>sources.pop();
    }

    // if the first and only other argument besides the resultSelector is an array
    // assume it's been called with `forkJoin([obs1, obs2, obs3], resultSelector)`
    if (sources.length === 1 && isArray(sources[0])) {
      sources = <Array<SubscribableOrPromise<any>>>sources[0];
    }

    if (sources.length === 0) {
      return new EmptyObservable<T>();
    }

    return new ForkJoinObservable(<Array<SubscribableOrPromise<any>>>sources, resultSelector);
  }

  protected _subscribe(subscriber: Subscriber<any>): Subscription {
    return new ForkJoinSubscriber(subscriber, this.sources, this.resultSelector);
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class ForkJoinSubscriber<T> extends OuterSubscriber<T, T> {
  private completed = 0;
  private total: number;
  private values: any[];
  private haveValues = 0;

  constructor(destination: Subscriber<T>,
              private sources: Array<SubscribableOrPromise<any>>,
              private resultSelector?: (...values: Array<any>) => T) {
    super(destination);

    const len = sources.length;
    this.total = len;
    this.values = new Array(len);

    for (let i = 0; i < len; i++) {
      const source = sources[i];
      const innerSubscription = subscribeToResult(this, source, null, i);

      if (innerSubscription) {
        (<any> innerSubscription).outerIndex = i;
        this.add(innerSubscription);
      }
    }
  }

  notifyNext(outerValue: any, innerValue: T,
             outerIndex: number, innerIndex: number,
             innerSub: InnerSubscriber<T, T>): void {
    this.values[outerIndex] = innerValue;
    if (!(<any>innerSub)._hasValue) {
      (<any>innerSub)._hasValue = true;
      this.haveValues++;
    }
  }

  notifyComplete(innerSub: InnerSubscriber<T, T>): void {
    const destination = this.destination;
    const { haveValues, resultSelector, values } = this;
    const len = values.length;

    if (!(<any>innerSub)._hasValue) {
      destination.complete();
      return;
    }

    this.completed++;

    if (this.completed !== len) {
      return;
    }

    if (haveValues === len) {
      const value = resultSelector ? resultSelector.apply(this, values) : values;
      destination.next(value);
    }

    destination.complete();
  }
}