import { PerSubscriptionSubjectBase } from './per-subscription-subject-base.js';

class BehaviorSubject<T> extends PerSubscriptionSubjectBase<T> {
  #currentValue: T;

  constructor(initialValue: T) {
    super();
    this.#currentValue = initialValue;
  }

  protected override _subscribe(subscriber: Subscriber<T>) {
    if (this.active) {
      subscriber.next(this.#currentValue);
    }
    super._subscribe(subscriber);
  }

  override next(value: T) {
    if (this.active) {
      this.#currentValue = value;
    }

    super.next(value);
  }
}

export function behaviorSubject<T>(initialValue: T) {
  return new BehaviorSubject(initialValue);
}
