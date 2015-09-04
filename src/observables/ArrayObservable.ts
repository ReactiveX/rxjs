import Scheduler from '../Scheduler';
import Observable from '../Observable';
import ScalarObservable from './ScalarObservable';
import EmptyObservable from './EmptyObservable';

export default class ArrayObservable<T> extends Observable<T> {

  static create<T>(array: T[], scheduler?: Scheduler) {
    return new ArrayObservable(array, scheduler);
  }

  static of<T>(...array: (T | Scheduler)[]) : Observable<T> {
    let scheduler = <Scheduler>array[array.length - 1];
    if (scheduler && typeof scheduler.schedule === "function") {
      array.pop();
    } else {
      scheduler = void 0;
    }
    
    const len = array.length;
    if (len > 1) {
      return new ArrayObservable(array, scheduler);
    } else if (len === 1) {
      return new ScalarObservable(array[0], scheduler);
    } else {
      return new EmptyObservable(scheduler);
    }
  }

  static dispatch(state) {

    const { array, index, count, subscriber } = state;

    if (index >= count) {
      subscriber.complete();
      return;
    }

    subscriber.next(array[index]);

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

    let index = 0;
    const array = this.array;
    const count = array.length;
    const scheduler = this.scheduler;

    if (scheduler) {
      subscriber.add(scheduler.schedule(ArrayObservable.dispatch, 0, {
        array, index, count, subscriber
      }));
    } else {
      do {
        if (index >= count) {
          subscriber.complete();
          break;
        }
        subscriber.next(array[index++]);
        if (subscriber.isUnsubscribed) {
          break;
        }
      } while (true);
    }
  }
}
