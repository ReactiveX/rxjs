import noop from './util/noop';
import throwError from './util/throwError';
import tryOrOnError from './util/tryOrOnError';

export default class Observer<T> {

  destination: Observer<any>;

  constructor(destination?: Observer<any>) {
    if (!destination) {
      return;
    }
    (typeof destination.next === "function") || (destination.next = noop);
    (typeof destination.error === "function") || (destination.error = throwError);
    (typeof destination.complete === "function") || (destination.complete = noop);
    this.destination = destination;
  }

  next(value?): void {
    this._next(value);
  }

  error(error?): void {
    this._error(error);
  }

  complete(): void {
    this._complete();
  }

  _next(value?) {
    this.destination.next(value);
  }

  _error(error?) {
    this.destination.error(error);
  }

  _complete() {
    this.destination.complete();
  }
}
