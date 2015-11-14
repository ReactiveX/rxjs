import {PromiseObservable} from './PromiseObservable';
import {IteratorObservable} from'./IteratorObservable';
import {ArrayObservable} from './ArrayObservable';

import {Scheduler} from '../Scheduler';
import {Observable, ObservableOrPromise, ArrayOrIterator} from '../Observable';
import {$$observable} from '../util/Symbol_observable';
import {Subscriber} from '../Subscriber';
import {ObserveOnSubscriber} from '../operators/observeOn-support';
import {immediate} from '../schedulers/immediate';
import {isPromise} from '../util/isPromise';
import {isObservable} from '../util/isObservable';
import {isIterator} from '../util/isIterator';

const isArray = Array.isArray;

export class FromObservable<T> extends Observable<T> {
  constructor(private ish: Observable<T>, private scheduler: Scheduler) {
    super(null);
  }

  static create<T>(ish: ObservableOrPromise<T>, scheduler?: Scheduler): Observable<T>;
  static create<T>(ish: ArrayOrIterator<T>, scheduler?: Scheduler): Observable<T>;
  static create<T>(ish: any, scheduler: Scheduler = immediate): Observable<T> {
    if (ish) {
      if (isArray(ish)) {
        return new ArrayObservable<T>(ish, scheduler);
      } else if (isPromise(ish)) {
        return new PromiseObservable<T>(ish, scheduler);
      } else if (isObservable(ish)) {
        if (ish instanceof Observable) {
          return ish;
        }
        return new FromObservable<T>(ish, scheduler);
      } else if (isIterator(ish)) {
        return new IteratorObservable<T, T>(ish, null, null, scheduler);
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