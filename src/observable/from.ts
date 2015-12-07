import {PromiseObservable} from './fromPromise';
import {IteratorObservable} from'./IteratorObservable';
import {ArrayObservable} from './fromArray';

import {Scheduler} from '../Scheduler';
import {SymbolShim} from '../util/SymbolShim';
import {Observable} from '../Observable';
import {Subscriber} from '../Subscriber';
import {ObserveOnSubscriber} from '../operator/observeOn-support';
import {queue} from '../scheduler/queue';

const isArray = Array.isArray;

export class FromObservable<T> extends Observable<T> {
  constructor(private ish: any, private scheduler: Scheduler) {
    super(null);
  }

  static create<T>(ish: any, scheduler: Scheduler = queue): Observable<T> {
    if (ish) {
      if (isArray(ish)) {
        return new ArrayObservable(ish, scheduler);
      } else if (typeof ish.then === 'function') {
        return new PromiseObservable(ish, scheduler);
      } else if (typeof ish[SymbolShim.observable] === 'function') {
        if (ish instanceof Observable) {
          return ish;
        }
        return new FromObservable(ish, scheduler);
      } else if (typeof ish[SymbolShim.iterator] === 'function') {
        return new IteratorObservable(ish, null, null, scheduler);
      }
    }

    throw new TypeError((typeof ish) + ' is not observable');
  }

  _subscribe(subscriber: Subscriber<T>) {
    const ish = this.ish;
    const scheduler = this.scheduler;
    if (scheduler === queue) {
      return ish[SymbolShim.observable]().subscribe(subscriber);
    } else {
      return ish[SymbolShim.observable]().subscribe(new ObserveOnSubscriber(subscriber, scheduler, 0));
    }
  }
}
