import Operator from '../Operator';
import Observer from '../Observer';
import Subscriber from '../Subscriber';
import Observable from '../Observable';
import immediate from '../schedulers/immediate';

export default function repeat<T>(count: number = -1): Observable<T> {
  return this.lift(new RepeatOperator(count, this));
}

class RepeatOperator<T, R> implements Operator<T, R> {
  constructor(private count: number, private original: Observable<T>) {
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new RepeatSubscriber(subscriber, this.count, this.original);
  }
}

class RepeatSubscriber<T> extends Subscriber<T> {
  constructor(destination: Observer<T>, private count: number, private original: Observable<T>) {
    super(destination);
    this.invalidateRepeat();
  }

  private repeatSubscription(): void {
    let state = { dest: this.destination, count: this.count, original: this.original };
    immediate.scheduleNow(RepeatSubscriber.dispatchSubscription, state);
  }

  private invalidateRepeat(): Boolean {
    let completed = this.count === 0;
    if (completed) {
      this.destination.complete();
    }
    return completed;
  }

  private static dispatchSubscription({ dest, count, original }): void {
    return original.subscribe(new RepeatSubscriber(dest, count, original));
  }

  _complete() {
    if (!this.invalidateRepeat()) {
      this.count--;
      this.repeatSubscription();
    }
  }
}
