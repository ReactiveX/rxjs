import {Operator} from '../Operator';
import {Observer} from '../Observer';
import {Subscriber} from '../Subscriber';

import {noop} from '../util/noop';
import {Observable} from '../Observable';

/**
 * Returns a mirrored Observable of the source Observable, but modified so that the provided Observer is called
 * for every item emitted by the source.
 * This operator is useful for debugging your observables for the correct values or performing other side effects.
 * @param {Observer|function} [nextOrObserver] a normal observer callback or callback for onNext.
 * @param {function} [error] callback for errors in the source.
 * @param {function} [complete] callback for the completion of the source.
 * @reurns {Observable} a mirrored Observable with the specified Observer or callback attached for each item.
 */
export function _do<T>(nextOrObserver?: Observer<T> | ((x: T) => void), error?: (e: any) => void, complete?: () => void): Observable<T> {
  let next: (x: T) => void;
  if (nextOrObserver && typeof nextOrObserver === 'object') {
    next = (<Observer<T>>nextOrObserver).next;
    error = (<Observer<T>>nextOrObserver).error;
    complete = (<Observer<T>>nextOrObserver).complete;
  } else {
    next = <(x: T) => void>nextOrObserver;
  }
  return this.lift(new DoOperator(next || noop, error || noop, complete || noop));
}

class DoOperator<T> implements Operator<T, T> {

  next: (x: T) => void;
  error: (e: any) => void;
  complete: () => void;

  constructor(next: (x: T) => void, error: (e: any) => void, complete: () => void) {
    this.next = next;
    this.error = error;
    this.complete = complete;
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new DoSubscriber(subscriber, this.next, this.error, this.complete);
  }
}

class DoSubscriber<T> extends Subscriber<T> {

  private __next: (x: T) => void;
  private __error: (e: any) => void;
  private __complete: () => void;

  constructor(destination: Subscriber<T>, next: (x: T) => void, error: (e: any) => void, complete: () => void) {
    super(destination);
    this.__next = next;
    this.__error = error;
    this.__complete = complete;
  }

  // NOTE: important, all try catch blocks below are there for performance
  // reasons. tryCatcher approach does not benefit this operator.
  protected _next(value: T) {
    try {
      this.__next(value);
    } catch (err) {
      this.destination.error(err);
      return;
    }
    this.destination.next(value);
  }

  protected _error(err: any) {
    try {
      this.__error(err);
    } catch (err) {
      this.destination.error(err);
      return;
    }
    this.destination.error(err);
  }

  protected _complete() {
    try {
      this.__complete();
    } catch (err) {
      this.destination.error(err);
      return;
    }
    this.destination.complete();
  }
}
