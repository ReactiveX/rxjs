import PromiseObservable from './PromiseObservable';
import IteratorObservable from'./IteratorObservable';
import ArrayObservable from './ArrayObservable';

import Scheduler from '../Scheduler';
import $$observable from '../util/Symbol_observable';
import $$iterator from '../util/Symbol_iterator';
import Observable from '../Observable';
import Subscriber from '../Subscriber';
import { ObserveOnSubscriber } from '../operators/observeOn-support';
import immediate from '../schedulers/immediate';

const isArray = Array.isArray;

export default class FromObservable<T> extends Observable<T> {
  constructor(private ish: any, private scheduler: Scheduler) {
    super(null);
  }

  static create<T>(ish: any, scheduler: Scheduler = immediate): Observable<T> {
    if (ish) {
      if (isArray(ish)) {
        return new ArrayObservable(ish, scheduler);
      } else if (typeof ish.then === 'function') {
        return new PromiseObservable(ish, scheduler);
      } else if (typeof ish[$$observable] === 'function') {
        if (ish instanceof Observable) {
          return ish;
        }
        return new FromObservable(ish, scheduler);
      } else if (typeof ish[$$iterator] === 'function') {
        return new IteratorObservable(ish, null, null, scheduler);
      }
    }

    throw new TypeError((typeof ish) + ' is not observable');
  }

  _subscribe(subscriber: Subscriber<T>) {
    const ish = this.ish;
    const scheduler = this.scheduler;
    if (scheduler === immediate) {
      return ish[$$observable]().subscribe(subscriber);
    } else {
      return ish[$$observable]().subscribe(new ObserveOnSubscriber(subscriber, scheduler, 0));
    }
  }
}