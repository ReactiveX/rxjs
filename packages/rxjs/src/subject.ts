import { SubjectLike } from './util/types';

export class Subject<T> extends Observable<T> implements SubjectLike<T> {
  #completed = false;
  #hasError = false;
  #error: any = null;

  get active() {
    return !this.#completed && !this.#hasError;
  }

  #internalSubscriber: Subscriber<T> | null = null;

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

      this.#internalSubscriber = subscriber;
      subscriber.addTeardown(() => {
        this.#internalSubscriber = null;
      });
    });
  }

  next(value: T) {
    if (this.active) {
      this.#internalSubscriber?.next?.(value);
    }
  }

  error(error: any) {
    if (this.active) {
      this.#hasError = true;
      this.#error = error;
      this.#internalSubscriber?.error?.(error);
    }
  }

  complete() {
    if (this.active) {
      this.#completed = true;
      this.#internalSubscriber?.complete?.();
    }
  }
}
