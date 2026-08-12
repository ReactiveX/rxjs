import { PerSubscriptionSubjectBase } from './per-subscription-subject-base.js';

export interface ReplaySubjectConfig {
  size?: number;
  maxAge?: number;
}

class ReplaySubject<T> extends PerSubscriptionSubjectBase<T> {
  #bufferValues: T[] = [];
  #bufferTimestamps: number[] = [];
  #completed = false;
  #hasError = false;
  #error: any;

  readonly #size: number;
  readonly #maxAge: number;

  constructor(config?: ReplaySubjectConfig) {
    super();

    const { size = Infinity, maxAge = Infinity } = config ?? {};
    this.#size = size;
    this.#maxAge = maxAge;
  }

  #scheduleAgeFlush() {
    globalThis.setTimeout(() => {
      const tooOld = globalThis.Date.now() - this.#maxAge;
      const indexOfOldestAllowedItem = this.#bufferTimestamps.findIndex((timestamp) => tooOld < timestamp);
      const amountToTrim = indexOfOldestAllowedItem < 0 ? this.#bufferTimestamps.length : indexOfOldestAllowedItem;
      if (amountToTrim > 0) {
        this.#bufferTimestamps.splice(0, amountToTrim);
        this.#bufferValues.splice(0, amountToTrim);
      }
    }, this.#maxAge);
  }

  #checkSize() {
    const bufferLength = this.#bufferValues.length;
    const maxSize = this.#size;
    if (bufferLength > maxSize) {
      const amountToTrim = bufferLength - maxSize;
      this.#bufferValues.splice(0, amountToTrim);
      if (this.#maxAge !== Infinity) {
        this.#bufferTimestamps.splice(0, amountToTrim);
      }
    }
  }

  protected override _subscribe(subscriber: Subscriber<T>) {
    const buffer = Array.from(this.#bufferValues);
    if (!this.#hasError && !this.#completed) {
      // Match ReplaySubject's reentrant contract: an active subscriber joins
      // live fanout before its buffered values are replayed.
      super.addSubscriber(subscriber);
    }

    for (const value of buffer) {
      if (!subscriber.active) {
        return;
      }
      subscriber.next(value);
    }

    if (this.#hasError) {
      subscriber.error(this.#error);
      return;
    }

    if (this.#completed) {
      subscriber.complete();
      return;
    }
  }

  override next(value: T) {
    if (this.active) {
      this.#bufferValues.push(value);
      if (this.#maxAge !== Infinity) {
        this.#bufferTimestamps.push(globalThis.Date.now());
        this.#scheduleAgeFlush();
      }
      if (this.#size !== Infinity) {
        this.#checkSize();
      }
    }
    super.next(value);
  }

  override error(error: any) {
    if (this.active) {
      this.#hasError = true;
      this.#error = error;
    }
    super.error(error);
  }

  override complete() {
    if (this.active) {
      this.#completed = true;
    }
    super.complete();
  }
}

export function replaySubject<T>(config: ReplaySubjectConfig) {
  return new ReplaySubject<T>(config);
}
