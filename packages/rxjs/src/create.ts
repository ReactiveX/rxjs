// COPYRIGHT (c) 2025 Ben Lesh <ben@benlesh.com> All rights reserved
import {
  getInstanceCtor,
  getStaticCtor,
  isObservableInstance,
} from './util/ctor-helpers.js';

export const create: unique symbol = Symbol('create');

declare global {
  interface ObservableCtor {
    [create]: <T>(init: (subscriber: Subscriber<T>) => void) => Observable<T>;
  }

  interface Observable<T> {
    [create]: <R>(init: (subscriber: Subscriber<R>) => void) => Observable<R>;
  }
}

Observable[create] = createImpl;
Observable.prototype[create] = createImpl;

function createImpl<T>(
  this: any,
  init: (subscriber: Subscriber<T>) => void
): Observable<T> {
  const ObservableCtor = isObservableInstance(this)
    ? getInstanceCtor(this)
    : getStaticCtor(this);
  return new ObservableCtor(init);
}
