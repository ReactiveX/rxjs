// COPYRIGHT (c) 2025 Ben Lesh <ben@benlesh.com> All rights reserved
import { ColdSubject } from './cold-subject';

interface ReplaySubjectConfig {
  size?: number;
  maxAge?: number;
}

class ReplaySubject<T> extends ColdSubject<T> {
  #bufferValues: T[] = [];
  #bufferTimestamps: number[] = [];

  readonly #size: number;
  readonly #maxAge: number;

  constructor(
    init?: (subscriber: Subscriber<T>) => void,
    config?: ReplaySubjectConfig
  ) {
    super(init);
    const { size = Infinity, maxAge = Infinity } = config ?? {};
    this.#size = size;
    this.#maxAge = maxAge;
  }

  #scheduleAgeFlush() {
    setTimeout(() => {
      const tooOld = Date.now() - this.#maxAge;
      const indexOfOldestAllowedItem = this.#bufferTimestamps.findIndex(
        (timestamp) => tooOld < timestamp
      );
      const indexOfLastAgedOutItem = indexOfOldestAllowedItem - 1;
      if (indexOfLastAgedOutItem >= 0) {
        this.#bufferTimestamps.splice(0, indexOfLastAgedOutItem + 1);
        this.#bufferValues.splice(0, indexOfLastAgedOutItem + 1);
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

  override addSubscriber(subscriber: Subscriber<T>) {
    const buffer = Array.from(this.#bufferValues);
    for (const value of buffer) {
      subscriber.next(value);
    }
    super.addSubscriber(subscriber);
  }

  override next(value: T) {
    if (this.active) {
      this.#bufferValues.push(value);
      if (this.#size !== Infinity) {
        this.#checkSize();
      }

      if (this.#maxAge !== Infinity) {
        this.#bufferTimestamps.push(Date.now());
        this.#scheduleAgeFlush();
      }
    }
    super.next(value);
  }
}

export function replaySubject<T>(config: ReplaySubjectConfig) {
  return new ReplaySubject<T>(undefined, config);
}
