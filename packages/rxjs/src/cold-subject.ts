// COPYRIGHT (c) 2025 Ben Lesh <ben@benlesh.com> All rights reserved
import { ColdObservable } from './cold-observable';
import { SubjectLike } from './util/types';

export class ColdSubject<In, Out = In>
  extends ColdObservable<Out>
  implements SubjectLike<In, Out>
{
  #complete = false;
  #hasError = false;
  #error: any = null;

  get active() {
    return !this.#complete && !this.#hasError;
  }

  #observers = new Set<Observer<Out>>();

  protected addSubscriber(subscriber: Subscriber<Out>): void {
    this.#observers.add(subscriber);
    subscriber.addTeardown(() => {
      this.#observers.delete(subscriber);
    });
  }

  constructor(init?: (subscriber: Subscriber<Out>) => void) {
    super(
      init ??
        ((subscriber: Subscriber<Out>) => {
          if (!this.active) {
            if (this.#hasError) {
              subscriber.error(this.#error);
              return;
            }

            subscriber.complete();
            return;
          }

          this.addSubscriber(subscriber);
        })
    );
  }

  next(value: In) {
    if (this.active) {
      const observers = Array.from(this.#observers);
      for (const observer of observers) {
        observer.next(value as any);
      }
    }
  }

  error(error: any) {
    if (this.active) {
      this.#hasError = true;
      this.#error = error;
      const observers = Array.from(this.#observers);
      this.#observers.clear();
      for (const observer of observers) {
        observer.error(error);
      }
    }
  }

  complete() {
    if (this.active) {
      this.#complete = true;
      const observers = Array.from(this.#observers);
      this.#observers.clear();
      for (const observer of observers) {
        observer.complete();
      }
    }
  }
}
