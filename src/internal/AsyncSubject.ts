/** @prettier */
import { Subject } from './Subject';
import { Subscriber } from './Subscriber';

/**
 * A variant of Subject that only emits a value when it completes. It will emit
 * its latest value to all its observers on completion.
 *
 * @class AsyncSubject<T>
 */
export class AsyncSubject<T> extends Subject<T> {
  private value: T | null = null;
  private hasValue = false;
  private isComplete = false;

  protected _checkFinalizedStatuses(subscriber: Subscriber<T>) {
    const { hasError, hasValue, value, thrownError, isStopped } = this;
    if (hasError) {
      subscriber.error(thrownError);
    } else if (isStopped) {
      hasValue && subscriber.next(value!);
      subscriber.complete();
    }
  }

  next(value: T): void {
    if (!this.isStopped) {
      this.value = value;
      this.hasValue = true;
    }
  }

  complete(): void {
    const { hasValue, value, isComplete } = this;
    if (!isComplete) {
      this.isComplete = true;
      hasValue && super.next(value!);
      super.complete();
    }
  }
}
