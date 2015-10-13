import Operator from '../Operator';
import Observable from '../Observable';
import Subscriber from '../Subscriber';
import Scheduler from '../Scheduler';
import Subscription from '../Subscription';
import nextTick from '../schedulers/nextTick';

export default function debounceTime<T>(dueTime: number, scheduler: Scheduler = nextTick): Observable<T> {
  return this.lift(new DebounceTimeOperator(dueTime, scheduler));
}

class DebounceTimeOperator<T, R> implements Operator<T, R> {
  constructor(private dueTime: number, private scheduler: Scheduler) {
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new DebounceTimeSubscriber(subscriber, this.dueTime, this.scheduler);
  }
}

class DebounceTimeSubscriber<T> extends Subscriber<T> {
  private debouncedSubscription: Subscription<any> = null;
  private lastValue: any = null;

  constructor(destination: Subscriber<T>,
              private dueTime: number,
              private scheduler: Scheduler) {
    super(destination);
  }

  _next(value: T) {
    this.clearDebounce();
    this.lastValue = value;
    this.add(this.debouncedSubscription = this.scheduler.schedule(dispatchNext, this.dueTime, this));
  }

  _complete() {
    this.debouncedNext();
    this.destination.complete();
  }

  debouncedNext(): void {
    this.clearDebounce();
    if (this.lastValue != null) {
      this.destination.next(this.lastValue);
      this.lastValue = null;
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

function dispatchNext(subscriber) {
  subscriber.debouncedNext();
}