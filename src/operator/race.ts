import {Observable} from '../Observable';
import {isArray} from '../util/isArray';
import {ArrayObservable} from '../observable/ArrayObservable';
import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {Subscription} from '../Subscription';
import {OuterSubscriber} from '../OuterSubscriber';
import {InnerSubscriber} from '../InnerSubscriber';
import {subscribeToResult} from '../util/subscribeToResult';

/**
 * Returns an Observable that mirrors the first source Observable to emit an item
 * from the combination of this Observable and supplied Observables
 * @param {...Observables} ...observables sources used to race for which Observable emits first.
 * @return {Observable} an Observable that mirrors the output of the first Observable to emit an item.
 * @method race
 * @owner Observable
 */
export function race<T>(...observables: Array<Observable<T> | Array<Observable<T>>>): Observable<T> {
  // if the only argument is an array, it was most likely called with
  // `pair([obs1, obs2, ...])`
  if (observables.length === 1 && isArray(observables[0])) {
    observables = <Array<Observable<T>>>observables[0];
  }

  observables.unshift(this);
  return raceStatic.apply(this, observables);
}

export interface RaceSignature<T> {
  (...observables: Array<Observable<T> | Array<Observable<T>>>): Observable<T>;
  <R>(...observables: Array<Observable<any> | Array<Observable<T>>>): Observable<R>;
}

/**
 * Returns an Observable that mirrors the first source Observable to emit an item.
 * @param {...Observables} ...observables sources used to race for which Observable emits first.
 * @return {Observable} an Observable that mirrors the output of the first Observable to emit an item.
 * @static true
 * @name race
 * @owner Observable
 */
export function raceStatic<T>(...observables: Array<Observable<T> | Array<Observable<T>>>): Observable<T>;
export function raceStatic<T>(...observables: Array<Observable<any> | Array<Observable<any>>>): Observable<T> {
  // if the only argument is an array, it was most likely called with
  // `pair([obs1, obs2, ...])`
  if (observables.length === 1) {
    if (isArray(observables[0])) {
      observables = <Array<Observable<any>>>observables[0];
    } else {
      return <Observable<any>>observables[0];
    }
  }

  return new ArrayObservable<T>(<any>observables).lift(new RaceOperator<T>());
}

export class RaceOperator<T> implements Operator<T, T> {
  call(subscriber: Subscriber<T>, source: any): any {
    return source._subscribe(new RaceSubscriber(subscriber));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
export class RaceSubscriber<T> extends OuterSubscriber<T, T> {
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

  notifyNext(outerValue: T, innerValue: T,
             outerIndex: number, innerIndex: number,
             innerSub: InnerSubscriber<T, T>): void {
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

    this.destination.next(innerValue);
  }
}
