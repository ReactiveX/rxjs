import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { Observable } from '../Observable';
import { OuterSubscriber } from '../OuterSubscriber';
import { subscribeToResult } from '../util/subscribeToResult';
import { ObservableInput, MonoTypeOperatorFunction, OperatorFunction } from '../types';

/* tslint:disable:max-line-length */
export function filterByLatestFrom<T>(filter: ObservableInput<boolean>): MonoTypeOperatorFunction<T>;
export function filterByLatestFrom<T, S extends T>(filter: ObservableInput<boolean>): OperatorFunction<T, S>;
/* tslint:enable:max-line-length */
/**
 * Filters the source Observable by the latest value emitted by the filter Observable
 *
 * ![](filterByLatestFrom.png)
 *
 * ## Example
 * On every click event, emit if the timer has emitted an odd number of times
 * ```ts
 * import { fromEvent, interval } from 'rxjs';
 * import { filterByLatestFrom } from 'rxjs/operators';
 *
 * const clicks = fromEvent(document, 'click');
 * const timer = interval(1000);
 * const result = clicks.pipe(filterByLatestFrom(timer, map(interval => interval % 2 === 1)));
 * result.subscribe(x => console.log(x));
 * ```
 *
 * @param {ObservableInput} filter An input Observable to filter the source by.
 * @return {Observable} An Observable which only emits if the latest value of
 * the inputObservable is true.
 * @method filterByLatestFrom
 * @owner Observable
 */
export function filterByLatestFrom<T>(filter: ObservableInput<boolean>): MonoTypeOperatorFunction<T> {
  return (source: Observable<T>) => {
    return source.lift(new FilterByLatestFromOperator(filter));
  };
}

class FilterByLatestFromOperator<T> implements Operator<T, T> {
  constructor(private observable: ObservableInput<boolean>) {}

  call(subscriber: Subscriber<T>, source: any): any {
    return source.subscribe(new FilterByLatestFromSubscriber(subscriber, this.observable));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class FilterByLatestFromSubscriber<T> extends OuterSubscriber<T, boolean> {
  private value = false;

  constructor(destination: Subscriber<T>,
              private observable: ObservableInput<boolean>) {
    super(destination);

    this.add(subscribeToResult<T, boolean>(this, observable));
  }

  notifyNext(outerValue: T, innerValue: boolean): void {
    this.value = innerValue;
  }

  notifyComplete() {
    // noop
  }

  protected _next(value: T) {
    if (this.value === true) {
      this.destination.next(value);
    }
  }
}
