import {Operator} from '../Operator';
import {Observable} from '../Observable';
import {Subscriber} from '../Subscriber';
import {Scheduler} from '../Scheduler';
import {Subscription} from '../Subscription';
import {async} from '../scheduler/async';

/**
 * Returns the source Observable delayed by the computed debounce duration,
 * with the duration lengthened if a new source item arrives before the delay
 * duration ends.
 * In practice, for each item emitted on the source, this operator holds the
 * latest item, waits for a silence for the `dueTime` length, and only then
 * emits the latest source item on the result Observable.
 * Optionally takes a scheduler for manging timers.
 * @param {number} dueTime the timeout value for the window of time required to not drop the item.
 * @param {Scheduler} [scheduler] the Scheduler to use for managing the timers that handle the timeout for each item.
 * @return {Observable} an Observable the same as source Observable, but drops items.
 * @method debounceTime
 * @owner Observable
 */
export function debounceTime<T>(dueTime: number, scheduler: Scheduler = async): Observable<T> {
  return this.lift(new DebounceTimeOperator(dueTime, scheduler));
}

export interface DebounceTimeSignature<T> {
  (dueTime: number, scheduler?: Scheduler): Observable<T>;
}

class DebounceTimeOperator<T> implements Operator<T, T> {
  constructor(private dueTime: number, private scheduler: Scheduler) {
  }

  call(subscriber: Subscriber<T>, source: any): any {
    return source._subscribe(new DebounceTimeSubscriber(subscriber, this.dueTime, this.scheduler));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class DebounceTimeSubscriber<T> extends Subscriber<T> {
  private debouncedSubscription: Subscription = null;
  private lastValue: T = null;
  private hasValue: boolean = false;

  constructor(destination: Subscriber<T>,
              private dueTime: number,
              private scheduler: Scheduler) {
    super(destination);
  }

  protected _next(value: T) {
    this.clearDebounce();
    this.lastValue = value;
    this.hasValue = true;
    this.add(this.debouncedSubscription = this.scheduler.schedule(dispatchNext, this.dueTime, this));
  }

  protected _complete() {
    this.debouncedNext();
    this.destination.complete();
  }

  debouncedNext(): void {
    this.clearDebounce();

    if (this.hasValue) {
      this.destination.next(this.lastValue);
      this.lastValue = null;
      this.hasValue = false;
    }
  }

  private clearDebounce(): void {
    const debouncedSubscription = this.debouncedSubscription;

    if (debouncedSubscription !== null) {
      this.remove(debouncedSubscription);
      debouncedSubscription.unsubscribe();
      this.debouncedSubscription = null;
    }
  }
}

function dispatchNext(subscriber: DebounceTimeSubscriber<any>) {
  subscriber.debouncedNext();
}
