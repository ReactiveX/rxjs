import { create } from './create.js';
import type { SubjectLike } from './util/types.js';

const ObservableBase = Observable;

/**
 * A hot producer: the Subject exists before observers subscribe and fans its
 * notifications out to the currently subscribed observers.
 */
export class Subject<T> extends ObservableBase<T> implements SubjectLike<T> {
  #completed = false;
  #hasError = false;
  #error: any = null;

  get active() {
    return !this.#completed && !this.#hasError;
  }

  #internalSubscribers = new Set<Subscriber<T>>();

  constructor() {
    super((subscriber: Subscriber<T>) => {
      if (this.#completed) {
        subscriber.complete();
        return;
      }

      if (this.#hasError) {
        subscriber.error(this.#error);
        return;
      }

      this.#internalSubscribers.add(subscriber);
      subscriber.addTeardown(() => {
        this.#internalSubscribers.delete(subscriber);
      });
    });
  }

  next(value: T) {
    if (this.active) {
      for (const subscriber of Array.from(this.#internalSubscribers)) {
        subscriber.next(value);
      }
    }
  }

  error(error: any) {
    if (this.active) {
      this.#hasError = true;
      this.#error = error;
      const subscribers = Array.from(this.#internalSubscribers);
      this.#internalSubscribers.clear();
      for (const subscriber of subscribers) {
        subscriber.error(error);
      }
    }
  }

  complete() {
    if (this.active) {
      this.#completed = true;
      const subscribers = Array.from(this.#internalSubscribers);
      this.#internalSubscribers.clear();
      for (const subscriber of subscribers) {
        subscriber.complete();
      }
    }
  }

  /**
   * Subject constructors do not accept Observable producer callbacks. Keep
   * Symbol-keyed operator results on the selected platform Observable base
   * instead of accidentally constructing another mutable Subject.
   */
  [create] = <R>(init: (subscriber: Subscriber<R>) => void): Observable<R> => new ObservableBase<R>(init);

  /**
   * Returns an Observable view that cannot be used to mutate this Subject.
   *
   * The view is constructed from Subject's selected platform Observable base
   * rather than from `this.constructor`, because a Subject constructor does
   * not accept an Observable producer callback.
   */
  asObservable(): Observable<T> {
    return new ObservableBase<T>((subscriber) => {
      this.subscribe(subscriber, { signal: subscriber.signal });
    });
  }
}
