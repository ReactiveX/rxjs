import {isArray} from '../util/isArray';
import {isPromise} from '../util/isPromise';
import {PromiseObservable} from './fromPromise';
import {IteratorObservable} from'./IteratorObservable';
import {ArrayObservable} from './fromArray';

import {Scheduler} from '../Scheduler';
import {SymbolShim} from '../util/SymbolShim';
import {Observable} from '../Observable';
import {Subscriber} from '../Subscriber';
import {ObserveOnSubscriber} from '../operator/observeOn-support';

export function create<T>(ish: any, scheduler: Scheduler = null): Observable<T> {
  if (ish != null) {
    if (typeof ish[SymbolShim.observable] === 'function') {
      if (ish instanceof Observable && !scheduler) {
        return ish;
      }
      return new FromObservable(ish, scheduler);
    } if (isArray(ish)) {
      return new ArrayObservable(ish, scheduler);
    } else if (isPromise(ish)) {
      return new PromiseObservable(ish, scheduler);
    } else if (typeof ish[SymbolShim.iterator] === 'function' || typeof ish === 'string') {
      return new IteratorObservable<T>(<any>ish, null, null, scheduler);
    }
  }

  throw new TypeError((ish !== null && typeof ish || ish) + ' is not observable');
}

export class FromObservable<T> extends Observable<T> {
  constructor(private ish: Observable<T> | Promise<T> | Iterator<T> | ArrayLike<T>, private scheduler: Scheduler) {
    super(null);
  }

  protected _subscribe(subscriber: Subscriber<T>) {
    const ish = this.ish;
    const scheduler = this.scheduler;
    if (scheduler == null) {
      return ish[SymbolShim.observable]().subscribe(subscriber);
    } else {
      return ish[SymbolShim.observable]().subscribe(new ObserveOnSubscriber(subscriber, scheduler, 0));
    }
  }
}
