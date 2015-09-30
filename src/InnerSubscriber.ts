import Subscriber from './Subscriber';
import Observer from './Observer';
import OuterSubscriber from './OuterSubscriber';
import tryCatch from './util/tryCatch';
import { errorObject } from './util/errorObject';

export default class InnerSubscriber<T, R> extends Subscriber<R> {
  index: number = 0;

  constructor(private parent: OuterSubscriber<T, R>, private outerValue: T, private outerIndex: number) {
    super();
  }

  _next(value: R) {
    const index = this.index++;
    this.parent.notifyNext(this.outerValue, value, this.outerIndex, index);
  }

  _error(error: any) {
    this.parent.notifyError(error, this);
  }

  _complete() {
    this.parent.notifyComplete(this);
  }
}