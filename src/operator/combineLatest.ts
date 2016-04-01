import {Observable, ObservableInput} from '../Observable';
import {ArrayObservable} from '../observable/ArrayObservable';
import {isArray} from '../util/isArray';
import {Scheduler} from '../Scheduler';
import {isScheduler} from '../util/isScheduler';
import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {OuterSubscriber} from '../OuterSubscriber';
import {InnerSubscriber} from '../InnerSubscriber';
import {subscribeToResult} from '../util/subscribeToResult';

/**
 * Combines multiple Observables to create an Observable whose values are
 * calculated from the latest values of each of its input Observables.
 *
 * <span class="informal">Whenever any input Observable emits a value, it
 * computes a formula using the latest values from all the inputs, then emits
 * the output of that formula.</span>
 *
 * <img src="./img/combineLatest.png" width="100%">
 *
 * `combineLatest` combines the values from this Observable with values from
 * Observables passed as arguments. This is done by subscribing to each
 * Observable, in order, and collecting an array of each of the most recent
 * values any time any of the input Observables emits, then either taking that
 * array and passing it as arguments to an optional `project` function and
 * emitting the return value of that, or just emitting the array of recent
 * values directly if there is no `project` function.
 *
 * @example <caption>Dynamically calculate the Body-Mass Index from an Observable of weight and one for height</caption>
 * var weight = Rx.Observable.of(70, 72, 76, 79, 75);
 * var height = Rx.Observable.of(1.76, 1.77, 1.78);
 * var bmi = weight.combineLatest(height, (w, h) => w / (h * h));
 * bmi.subscribe(x => console.log('BMI is ' + x));
 *
 * @see {@link combineAll}
 * @see {@link merge}
 * @see {@link withLatestFrom}
 *
 * @param {Observable} other An input Observable to combine with the source
 * Observable. More than one input Observables may be given as argument.
 * @param {function} [project] An optional function to project the values from
 * the combined latest values into a new value on the output Observable.
 * @return {Observable} An Observable of projected values from the most recent
 * values from each input Observable, or an array of the most recent values from
 * each input Observable.
 * @method combineLatest
 * @owner Observable
 */
export function combineLatest<T, R>(...observables: Array<ObservableInput<any> |
                                                       Array<ObservableInput<any>> |
                                                       ((...values: Array<any>) => R)>): Observable<R> {
  let project: (...values: Array<any>) => R = null;
  if (typeof observables[observables.length - 1] === 'function') {
    project = <(...values: Array<any>) => R>observables.pop();
  }

  // if the first and only other argument besides the resultSelector is an array
  // assume it's been called with `combineLatest([obs1, obs2, obs3], project)`
  if (observables.length === 1 && isArray(observables[0])) {
    observables = <any>observables[0];
  }

  observables.unshift(this);

  return new ArrayObservable(observables).lift(new CombineLatestOperator(project));
}

/* tslint:disable:max-line-length */
export interface CombineLatestSignature<T> {
  <R>(project: (v1: T) => R): Observable<R>;
  <T2, R>(v2: ObservableInput<T2>, project: (v1: T, v2: T2) => R): Observable<R>;
  <T2, T3, R>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, project: (v1: T, v2: T2, v3: T3) => R): Observable<R>;
  <T2, T3, T4, R>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, project: (v1: T, v2: T2, v3: T3, v4: T4) => R): Observable<R>;
  <T2, T3, T4, T5, R>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5) => R): Observable<R>;
  <T2, T3, T4, T5, T6, R>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>, project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6) => R): Observable<R>;

  <T2>(v2: ObservableInput<T2>): Observable<[T, T2]>;
  <T2, T3>(v2: ObservableInput<T2>, v3: ObservableInput<T3>): Observable<[T, T2, T3]>;
  <T2, T3, T4>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>): Observable<[T, T2, T3, T4]>;
  <T2, T3, T4, T5>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>): Observable<[T, T2, T3, T4, T5]>;
  <T2, T3, T4, T5, T6>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>): Observable<[T, T2, T3, T4, T5, T6]>;

  <R>(...observables: Array<ObservableInput<any> | ((...values: Array<any>) => R)>): Observable<R>;
  <R>(array: ObservableInput<any>[]): Observable<R>;
  <R>(array: ObservableInput<any>[], project: (...values: Array<any>) => R): Observable<R>;
}
/* tslint:enable:max-line-length */

/* tslint:disable:max-line-length */
export function combineLatestStatic<T>(v1: ObservableInput<T>, scheduler?: Scheduler): Observable<[T]>;
export function combineLatestStatic<T, T2>(v1: ObservableInput<T>, v2: ObservableInput<T2>, scheduler?: Scheduler): Observable<[T, T2]>;
export function combineLatestStatic<T, T2, T3>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, scheduler?: Scheduler): Observable<[T, T2, T3]>;
export function combineLatestStatic<T, T2, T3, T4>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, scheduler?: Scheduler): Observable<[T, T2, T3, T4]>;
export function combineLatestStatic<T, T2, T3, T4, T5>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, scheduler?: Scheduler): Observable<[T, T2, T3, T4, T5]>;
export function combineLatestStatic<T, T2, T3, T4, T5, T6>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>, scheduler?: Scheduler): Observable<[T, T2, T3, T4, T5, T6]>;
export function combineLatestStatic<T, R>(v1: ObservableInput<T>, project: (v1: T) => R, scheduler?: Scheduler): Observable<R>;
export function combineLatestStatic<T, T2, R>(v1: ObservableInput<T>, v2: ObservableInput<T2>, project: (v1: T, v2: T2) => R, scheduler?: Scheduler): Observable<R>;
export function combineLatestStatic<T, T2, T3, R>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, project: (v1: T, v2: T2, v3: T3) => R, scheduler?: Scheduler): Observable<R>;
export function combineLatestStatic<T, T2, T3, T4, R>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, project: (v1: T, v2: T2, v3: T3, v4: T4) => R, scheduler?: Scheduler): Observable<R>;
export function combineLatestStatic<T, T2, T3, T4, T5, R>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5) => R, scheduler?: Scheduler): Observable<R>;
export function combineLatestStatic<T, T2, T3, T4, T5, T6, R>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>, project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6) => R, scheduler?: Scheduler): Observable<R>;
export function combineLatestStatic<R>(...observables: Array<ObservableInput<any> | ((...values: Array<any>) => R) | Scheduler>): Observable<R>;
export function combineLatestStatic<R>(array: ObservableInput<any>[], scheduler?: Scheduler): Observable<R>;
export function combineLatestStatic<R>(array: ObservableInput<any>[], project: (...values: Array<any>) => R, scheduler?: Scheduler): Observable<R>;
/* tslint:enable:max-line-length */

/**
 * Combines multiple Observables to create an Observable whose values are
 * calculated from the latest values of each of its input Observables.
 *
 * <span class="informal">Whenever any input Observable emits a value, it
 * computes a formula using the latest values from all the inputs, then emits
 * the output of that formula.</span>
 *
 * <img src="./img/combineLatest.png" width="100%">
 *
 * `combineLatest` combines the values from all the Observables passed as
 * arguments. This is done by subscribing to each Observable, in order, and
 * collecting an array of each of the most recent values any time any of the
 * input Observables emits, then either taking that array and passing it as
 * arguments to an optional `project` function and emitting the return value of
 * that, or just emitting the array of recent values directly if there is no
 * `project` function.
 *
 * @example <caption>Dynamically calculate the Body-Mass Index from an Observable of weight and one for height</caption>
 * var weight = Rx.Observable.of(70, 72, 76, 79, 75);
 * var height = Rx.Observable.of(1.76, 1.77, 1.78);
 * var bmi = Rx.Observable.combineLatest(weight, height, (w, h) => w / (h * h));
 * bmi.subscribe(x => console.log('BMI is ' + x));
 *
 * @see {@link combineAll}
 * @see {@link merge}
 * @see {@link withLatestFrom}
 *
 * @param {Observable} observable1 An input Observable to combine with the
 * source Observable.
 * @param {Observable} observable2 An input Observable to combine with the
 * source Observable. More than one input Observables may be given as argument.
 * @param {function} [project] An optional function to project the values from
 * the combined latest values into a new value on the output Observable.
 * @param {Scheduler} [scheduler=null] The Scheduler to use for subscribing to
 * each input Observable.
 * @return {Observable} An Observable of projected values from the most recent
 * values from each input Observable, or an array of the most recent values from
 * each input Observable.
 * @static true
 * @name combineLatest
 * @owner Observable
 */
export function combineLatestStatic<T, R>(...observables: Array<any | ObservableInput<any> |
                                                    Array<ObservableInput<any>> |
                                                    (((...values: Array<any>) => R)) |
                                                    Scheduler>): Observable<R> {
  let project: (...values: Array<any>) => R =  null;
  let scheduler: Scheduler = null;

  if (isScheduler(observables[observables.length - 1])) {
    scheduler = <Scheduler>observables.pop();
  }

  if (typeof observables[observables.length - 1] === 'function') {
    project = <(...values: Array<any>) => R>observables.pop();
  }

  // if the first and only other argument besides the resultSelector is an array
  // assume it's been called with `combineLatest([obs1, obs2, obs3], project)`
  if (observables.length === 1 && isArray(observables[0])) {
    observables = <Array<Observable<any>>>observables[0];
  }

  return new ArrayObservable(observables, scheduler).lift(new CombineLatestOperator<T, R>(project));
}

export class CombineLatestOperator<T, R> implements Operator<T, R> {
  constructor(private project?: (...values: Array<any>) => R) {
  }

  call(subscriber: Subscriber<R>, source: any): any {
    return source._subscribe(new CombineLatestSubscriber(subscriber, this.project));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
export class CombineLatestSubscriber<T, R> extends OuterSubscriber<T, R> {
  private active: number = 0;
  private values: any[] = [];
  private observables: any[] = [];
  private toRespond: number[] = [];

  constructor(destination: Subscriber<R>, private project?: (...values: Array<any>) => R) {
    super(destination);
  }

  protected _next(observable: any) {
    const toRespond = this.toRespond;
    toRespond.push(toRespond.length);
    this.observables.push(observable);
  }

  protected _complete() {
    const observables = this.observables;
    const len = observables.length;
    if (len === 0) {
      this.destination.complete();
    } else {
      this.active = len;
      for (let i = 0; i < len; i++) {
        const observable = observables[i];
        this.add(subscribeToResult(this, observable, observable, i));
      }
    }
  }

  notifyComplete(unused: Subscriber<R>): void {
    if ((this.active -= 1) === 0) {
      this.destination.complete();
    }
  }

  notifyNext(outerValue: T, innerValue: R,
             outerIndex: number, innerIndex: number,
             innerSub: InnerSubscriber<T, R>): void {
    const values = this.values;
    values[outerIndex] = innerValue;
    const toRespond = this.toRespond;

    if (toRespond.length > 0) {
      const found = toRespond.indexOf(outerIndex);
      if (found !== -1) {
        toRespond.splice(found, 1);
      }
    }

    if (toRespond.length === 0) {
      if (this.project) {
        this._tryProject(values);
      } else {
        this.destination.next(values);
      }
    }
  }

  private _tryProject(values: any[]) {
    let result: any;
    try {
      result = this.project.apply(this, values);
    } catch (err) {
      this.destination.error(err);
      return;
    }
    this.destination.next(result);
  }
}
