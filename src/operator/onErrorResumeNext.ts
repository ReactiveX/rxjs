import { Observable, ObservableInput } from '../Observable';
import { FromObservable } from '../observable/FromObservable';
import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { isArray } from '../util/isArray';
import { OuterSubscriber } from '../OuterSubscriber';
import { InnerSubscriber } from '../InnerSubscriber';
import { subscribeToResult } from '../util/subscribeToResult';

/* tslint:disable:max-line-length */
export function onErrorResumeNext<T, R>(this: Observable<T>, v: ObservableInput<R>): Observable<R>;
export function onErrorResumeNext<T, T2, T3, R>(this: Observable<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>): Observable<R>;
export function onErrorResumeNext<T, T2, T3, T4, R>(this: Observable<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>): Observable<R>;
export function onErrorResumeNext<T, T2, T3, T4, T5, R>(this: Observable<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>): Observable<R>;
export function onErrorResumeNext<T, T2, T3, T4, T5, T6, R>(this: Observable<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>): Observable<R> ;
export function onErrorResumeNext<T, R>(this: Observable<T>, ...observables: Array<ObservableInput<any> | ((...values: Array<any>) => R)>): Observable<R>;
export function onErrorResumeNext<T, R>(this: Observable<T>, array: ObservableInput<any>[]): Observable<R>;
/* tslint:disable:max-line-length */
export function onErrorResumeNext<T, R>(this: Observable<T>, ...nextSources: Array<ObservableInput<any> |
                                                       Array<ObservableInput<any>> |
                                                       ((...values: Array<any>) => R)>): Observable<R> {
  if (nextSources.length === 1 && isArray(nextSources[0])) {
    nextSources = <Array<Observable<any>>>nextSources[0];
  }

  return this.lift(new OnErrorResumeNextOperator<T, R>(nextSources));
}

/* tslint:disable:max-line-length */
export function onErrorResumeNextStatic<R>(v: ObservableInput<R>): Observable<R>;
export function onErrorResumeNextStatic<T2, T3, R>(v2: ObservableInput<T2>, v3: ObservableInput<T3>): Observable<R>;
export function onErrorResumeNextStatic<T2, T3, T4, R>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>): Observable<R>;
export function onErrorResumeNextStatic<T2, T3, T4, T5, R>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>): Observable<R>;
export function onErrorResumeNextStatic<T2, T3, T4, T5, T6, R>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>): Observable<R>;

export function onErrorResumeNextStatic<R>(...observables: Array<ObservableInput<any> | ((...values: Array<any>) => R)>): Observable<R>;
export function onErrorResumeNextStatic<R>(array: ObservableInput<any>[]): Observable<R>;
/* tslint:enable:max-line-length */

export function onErrorResumeNextStatic<T, R>(...nextSources: Array<ObservableInput<any> |
                                                              Array<ObservableInput<any>> |
                                                              ((...values: Array<any>) => R)>): Observable<R> {
  let source: ObservableInput<any> = null;

  if (nextSources.length === 1 && isArray(nextSources[0])) {
    nextSources = <Array<ObservableInput<any>>>nextSources[0];
  }
  source = nextSources.shift();

  return new FromObservable(source, null).lift(new OnErrorResumeNextOperator<T, R>(nextSources));
}

class OnErrorResumeNextOperator<T, R> implements Operator<T, R> {
  constructor(private nextSources: Array<ObservableInput<any>>) {
  }

  call(subscriber: Subscriber<R>, source: any): any {
    return source._subscribe(new OnErrorResumeNextSubscriber(subscriber, this.nextSources));
  }
}

class OnErrorResumeNextSubscriber<T, R> extends OuterSubscriber<T, R> {
  constructor(protected destination: Subscriber<T>,
              private nextSources: Array<ObservableInput<any>>) {
    super(destination);
  }

  notifyError(error: any, innerSub: InnerSubscriber<T, any>): void {
    this.subscribeToNextSource();
  }

  notifyComplete(innerSub: InnerSubscriber<T, any>): void {
    this.subscribeToNextSource();
  }

  protected _error(err: any): void {
    this.subscribeToNextSource();
  }

  protected _complete(): void {
    this.subscribeToNextSource();
  }

  private subscribeToNextSource(): void {
    const next = this.nextSources.shift();
    if (next) {
      this.add(subscribeToResult(this, next));
    } else {
      this.destination.complete();
    }
  }
}