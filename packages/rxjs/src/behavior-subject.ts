// COPYRIGHT (c) 2025 Ben Lesh <ben@benlesh.com> All rights reserved
import { ColdSubject } from './cold-subject';

class BehaviorSubject<T> extends ColdSubject<T> {
  #currentValue: T;

  constructor(
    init: undefined | ((subscriber: Subscriber<T>) => void),
    initialValue: T
  ) {
    super(init);
    this.#currentValue = initialValue;
  }

  override addSubscriber(subcriber: Subscriber<T>) {
    subcriber.next(this.#currentValue);
    super.addSubscriber(subcriber);
  }

  override next(value: T) {
    if (this.active) {
      this.#currentValue = value;
    }

    super.next(value);
  }
}

export function behaviorSubject<T>(initialValue: T) {
  return new BehaviorSubject(undefined, initialValue);
}
