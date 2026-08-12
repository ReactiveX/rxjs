import { create } from './create.js';
import type { SubjectLike } from './util/types.js';

const ObservableBase = Observable;

export class AsyncSubject<T> extends ObservableBase<T> implements SubjectLike<T> {
  #completed = false;
  #hasError = false;
  #error: any;
  #hasValue = false;
  #value: T | undefined;
  #subscribers = new Set<Subscriber<T>>();

  get active(): boolean {
    return !this.#completed && !this.#hasError;
  }

  constructor() {
    super(() => {});
  }

  override subscribe(
    observer?: Partial<Observer<T>> | ((value: T) => void) | null,
    options?: SubscribeOptions
  ): void {
    new ObservableBase<T>((subscriber) => this.#addSubscriber(subscriber)).subscribe(observer, options);
  }

  #addSubscriber(subscriber: Subscriber<T>): void {
    if (this.#hasError) {
      subscriber.error(this.#error);
      return;
    }
    if (this.#completed) {
      if (this.#hasValue) {
        subscriber.next(this.#value as T);
      }
      subscriber.complete();
      return;
    }

    this.#subscribers.add(subscriber);
    subscriber.addTeardown(() => this.#subscribers.delete(subscriber));
  }

  next(value: T): void {
    if (this.active) {
      this.#value = value;
      this.#hasValue = true;
    }
  }

  error(error: any): void {
    if (!this.active) {
      return;
    }

    this.#hasError = true;
    this.#error = error;
    const subscribers = Array.from(this.#subscribers);
    this.#subscribers.clear();
    for (const subscriber of subscribers) {
      subscriber.error(error);
    }
  }

  complete(): void {
    if (!this.active) {
      return;
    }

    // Mark completion before notifying so reentrant subscriptions observe the
    // final value exactly once and reentrant next/complete calls are ignored.
    this.#completed = true;
    const subscribers = Array.from(this.#subscribers);
    this.#subscribers.clear();
    for (const subscriber of subscribers) {
      if (this.#hasValue) {
        subscriber.next(this.#value as T);
      }
      subscriber.complete();
    }
  }

  [create] = <R>(init: (subscriber: Subscriber<R>) => void): Observable<R> => new ObservableBase<R>(init);

  asObservable(): Observable<T> {
    return new ObservableBase<T>((subscriber) => {
      this.subscribe(subscriber, { signal: subscriber.signal });
    });
  }
}
