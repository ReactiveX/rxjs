import { ObservableInput, OperatorFunction } from 'rxjs/internal/types';
import { Observable } from 'rxjs/internal/Observable';
import { Subscriber } from 'rxjs/internal/Subscriber';
import { OperatorSubscriber } from 'rxjs/internal/OperatorSubscriber';
import { tryUserFunction, resultIsError } from 'rxjs/internal/util/userFunction';
import { from } from 'rxjs/internal/create/from';

export function mergeMap<T, R>(
  project: (value: T, index: number) => ObservableInput<R>,
  concurrent = Number.POSITIVE_INFINITY,
): OperatorFunction<T, R> {
  return (source: Observable<T>) =>
    new Observable(subscriber => source.subscribe(new MergeMapSubscriber<T, R>(subscriber, project, concurrent)));
}

class MergeMapSubscriber<T, R> extends OperatorSubscriber<T> {
  private _index = 0;
  private _active = 0;
  private _buffer: T[] = [];
  private _completed = false;

  constructor(
    destination: Subscriber<R>,
    private project: (value: T, index: number) => ObservableInput<R>,
    private concurrent: number
  ) {
    super(destination);
  }

  _next(value: T) {
    this._buffer.push(value);
    this._tryInnerSubscribe();
  }

  complete() {
    this._completed = true;
    if (this._active === 0 && this._buffer.length === 0) {
      super.complete();
    }
  }

  private _tryInnerSubscribe() {
    const { _destination, _subscription } = this;
    while (this._buffer.length > 0 && this._active < this.concurrent) {
      this._active++;
      const value = this._buffer.shift();
      const result = tryUserFunction((value, index) => from(this.project(value, index)), [value, this._index++]);
      if (resultIsError(result)) {
        _destination.error(result.error);
      } else {
        _subscription.add(result.subscribe(new InnerSubscriber(this._destination, this)));
      }
    }
  }
}

class InnerSubscriber<T> extends OperatorSubscriber<T> {
  constructor(_destination: Subscriber<T>, private _outer: MergeMapSubscriber<any, T>) {
    super(_destination);
  }

  _complete() {
    const outer = this._outer as any;
    outer._active--;
    if (outer._buffer.length > 0) {
      outer._tryInnerSubscribe();
    } else if (outer._completed && outer._active === 0) {
      this._destination.complete();
    }
  }
}
