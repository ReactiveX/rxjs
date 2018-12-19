import { ObservableInput, OperatorFunction } from 'rxjs/internal/types';
import { Observable } from 'rxjs/internal/Observable';
import { Subscription } from 'rxjs/internal/Subscription';
import { Subscriber } from 'rxjs/internal/Subscriber';
import { OperatorSubscriber } from 'rxjs/internal/OperatorSubscriber';
import { tryUserFunction, resultIsError } from 'rxjs/internal/util/userFunction';
import { from } from 'rxjs/internal/create/from';

export function mergeMap<T, R>(
  project: (value: T, index: number) => ObservableInput<R>,
  concurrent = Number.POSITIVE_INFINITY,
): OperatorFunction<T, R> {
  return (source: Observable<T>) => source.lift(mergeMapOperator(project, concurrent));
}

function mergeMapOperator<T, R>(project: (value: T, index: number) => ObservableInput<R>, concurrent: number) {
  return function mergeMapLift(this: Subscriber<R>, source: Observable<T>, subscription: Subscription) {
    return source.subscribe(new MergeMapSubscriber(subscription, this, project, concurrent), subscription);
  };
}

class MergeMapSubscriber<T, R> extends OperatorSubscriber<T> {
  private _index = 0;
  private _active = 0;
  private _buffer: T[] = [];
  private _complete = false;

  constructor(
    subscription: Subscription,
    destination: Subscriber<R>,
    private project: (value: T, index: number) => ObservableInput<R>,
    private concurrent: number
  ) {
    super(subscription, destination);
  }

  next(value: T) {
    this._buffer.push(value);
    this._tryInnerSubscribe();
  }

  complete() {
    this._complete = true;
    if (this._active === 0 && this._buffer.length === 0) {
      this._destination.complete();
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
        _subscription.add(result.subscribe({
          next: (value: R) => _destination.next(value),
          error: (err: any) => _destination.error(err),
          complete: () => {
            this._active--;
            if (this._buffer.length > 0) {
              this._tryInnerSubscribe();
            } else if (this._complete && this._active === 0) {
              _destination.complete();
            }
          }
        }));
      }
    }
  }
}
