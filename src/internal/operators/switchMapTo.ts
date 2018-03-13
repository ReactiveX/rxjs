import { Operator } from '../Operator';
import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';
import { Subscription } from '../Subscription';
import { OuterSubscriber } from '../OuterSubscriber';
import { InnerSubscriber } from '../InnerSubscriber';
import { subscribeToResult } from '../util/subscribeToResult';
import { ObservableInput, OperatorFunction } from '../types';

/**
 * Projects each source value to the same Observable which is flattened multiple
 * times with {@link switch} in the output Observable.
 *
 * <span class="informal">It's like {@link switchMap}, but maps each value
 * always to the same inner Observable.</span>
 *
 * <img src="./img/switchMapTo.png" width="100%">
 *
 * Maps each source value to the given Observable `innerObservable` regardless
 * of the source value, and then flattens those resulting Observables into one
 * single Observable, which is the output Observable. The output Observables
 * emits values only from the most recently emitted instance of
 * `innerObservable`.
 *
 * @example <caption>Rerun an interval Observable on every click event</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var result = clicks.switchMapTo(Rx.Observable.interval(1000));
 * result.subscribe(x => console.log(x));
 *
 * @see {@link concatMapTo}
 * @see {@link switch}
 * @see {@link switchMap}
 * @see {@link mergeMapTo}
 *
 * @param {ObservableInput} innerObservable An Observable to replace each value from
 * the source Observable.
 * @return {Observable} An Observable that emits items from the given
 * `innerObservable` (and optionally transformed through `resultSelector`) every
 * time a value is emitted on the source Observable, and taking only the values
 * from the most recently projected inner Observable.
 * @method switchMapTo
 * @owner Observable
 */
export function switchMapTo<T, R>(innerObservable: ObservableInput<R>): OperatorFunction<T, R> {
  return (source: Observable<T>) => source.lift(new SwitchMapToOperator(innerObservable));
}

class SwitchMapToOperator<T, R> implements Operator<T, R> {
  constructor(private observable: ObservableInput<R>) {
  }

  call(subscriber: Subscriber<R>, source: any): any {
    return source.subscribe(new SwitchMapToSubscriber(subscriber, this.observable));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class SwitchMapToSubscriber<T, R> extends OuterSubscriber<T, R> {
  private index: number = 0;
  private innerSubscription: Subscription;

  constructor(destination: Subscriber<R>, private inner: ObservableInput<R>) {
    super(destination);
  }

  protected _next(value: any) {
    const innerSubscription = this.innerSubscription;
    if (innerSubscription) {
      innerSubscription.unsubscribe();
    }
    this.add(this.innerSubscription = subscribeToResult(this, this.inner, value, this.index++));
  }

  protected _complete() {
    const {innerSubscription} = this;
    if (!innerSubscription || innerSubscription.closed) {
      super._complete();
    }
  }

  protected _unsubscribe() {
    this.innerSubscription = null;
  }

  notifyComplete(innerSub: Subscription) {
    this.remove(innerSub);
    this.innerSubscription = null;
    if (this.isStopped) {
      super._complete();
    }
  }

  notifyNext(outerValue: T, innerValue: R,
             outerIndex: number, innerIndex: number,
             innerSub: InnerSubscriber<T, R>): void {
    this.destination.next(innerValue);
  }
}
