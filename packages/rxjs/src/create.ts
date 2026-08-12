import '@rxjs/observable-polyfill';
import { isObservableInstance } from './util/ctor-helpers.js';

const CREATE_SYMBOL_KEY = 'rxjs.kernel.create.v1';

/**
 * The shared construction protocol used by RxJS Symbol extensions.
 *
 * Unlike public operator Symbols, this key is global so operators and
 * Observable subclasses from duplicate compatible RxJS installations can
 * agree on how a derived Observable is constructed.
 */
export const create: unique symbol = Symbol.for(CREATE_SYMBOL_KEY);

declare global {
  interface ObservableCtor {
    [create]: <T>(init: (subscriber: Subscriber<T>) => void) => Observable<T>;
  }

  interface Observable<T> {
    [create]: <R>(init: (subscriber: Subscriber<R>) => void) => Observable<R>;
  }
}

installCreate(Observable);
installCreate(Observable.prototype);

function createImpl<T>(this: any, init: (subscriber: Subscriber<T>) => void): Observable<T> {
  const ObservableCtor = isObservableInstance(this) ? getInstanceCtor(this) : getStaticCtor(this);
  return new ObservableCtor(init);
}

function getInstanceCtor(value: any): ObservableCtor {
  return value.constructor;
}

function getStaticCtor(value: any): ObservableCtor {
  if (typeof value === 'function') {
    return value;
  }

  return Observable;
}

function installCreate(target: object) {
  const existing = Object.getOwnPropertyDescriptor(target, create);
  if (existing) {
    if (typeof existing.value !== 'function') {
      throw new TypeError(`Cannot install the RxJS create protocol: ${CREATE_SYMBOL_KEY} is already occupied`);
    }
    return;
  }

  Object.defineProperty(target, create, {
    configurable: true,
    value: createImpl,
    writable: true,
  });
}
