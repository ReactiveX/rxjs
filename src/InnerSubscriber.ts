import {Subscriber} from './Subscriber';
import {OuterSubscriber} from './OuterSubscriber';

export class InnerSubscriber<T, R> extends Subscriber<R> {
  private index: number = 0;

  constructor(private parent: OuterSubscriber<T, R>, private outerValue: T, private outerIndex: number) {
    super();
  }

  protected _next(value: R) {
    this.parent.notifyNext(this.outerValue, value, this.outerIndex, this.index++);
  }

  protected _error(error: any) {
    this.parent.notifyError(error, this);
    this.unsubscribe();
  }

  protected _complete() {
    this.parent.notifyComplete(this);
    this.unsubscribe();
  }
}
