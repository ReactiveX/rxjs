import Scheduler from '../Scheduler';
import Observable from '../Observable';

export default class ArrayObservable<T> extends Observable<T> {

  static create<T>(array: T[], scheduler?: Scheduler) {
    return new ArrayObservable(array, scheduler);
  }

  static of<T>(...array: (T | Scheduler)[]) {
    let scheduler = array[array.length - 1];
    if (scheduler && typeof (<Scheduler> scheduler).schedule === "function") {
      array.pop();
    } else {
      scheduler = void 0;
    }
    return new ArrayObservable(array, <Scheduler> scheduler);
  }

  static dispatch(state) {

    const { array, index, count, subscriber } = state;

    if (index >= count) {
      subscriber.complete();
      return;
    }

    subscriber.next(array[index + 1]);

    if (subscriber.isUnsubscribed) {
      return;
    }

    state.index = index + 1;

    (<any> this).schedule(state);
  }

  constructor(private array: T[], private scheduler?: Scheduler) {
    super();
  }

  _subscribe(subscriber) {

    let index = -1;
    const array = this.array;
    const count = array.length;
    const scheduler = this.scheduler;

    if (scheduler) {
      subscriber.add(scheduler.schedule(0, {
        array, index, count, subscriber
      }, ArrayObservable.dispatch));
    } else {
      do {
        if (++index >= count) {
          subscriber.complete();
          break;
        }
        subscriber.next(array[index]);
        if (subscriber.isUnsubscribed) {
          break;
        }
      } while (true);
    }
  }
}
