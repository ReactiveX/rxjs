import { Observable } from 'rxjs/internal/Observable';
import { Operator, OperatorFunction, FOType, Sink, SinkArg, PartialObserver } from 'rxjs/internal/types';
import { Subscriber } from '../Subscriber';
import { Subscription } from '../Subscription';
import { OperatorSubscriber } from '../OperatorSubscriber';
import { isPartialObserver } from '../util/isPartialObserver';
import { noop } from '../util/noop';
import { tryUserFunction, resultIsError } from '../util/userFunction';

export function tap<T>(
  observer: PartialObserver<T>
): OperatorFunction<T, T>;

export function tap<T>(
  nextHandler?: (value: T) => void,
  errorHandler?: (err: any) => void,
  completeHandler?: () => void,
): OperatorFunction<T, T>;

export function tap<T>(
  nextOrObserver?: PartialObserver<T>|((value: T) => void),
  errorHandler?: (err: any) => void,
  completeHandler?: () => void,
): OperatorFunction<T, T>;

export function tap<T>(
  nextOrObserver?: PartialObserver<T>|((value: T) => void),
  errorHandler?: (err: any) => void,
  completeHandler?: () => void,
): OperatorFunction<T, T> {
  return (source: Observable<T>) =>
    new Observable(subscriber => source.subscribe(new TapSubscriber(subscriber, nextOrObserver, errorHandler, completeHandler)));
}

class TapSubscriber<T> extends OperatorSubscriber<T> {
  private _tapNext: (value: T, subscription: Subscription) => void;
  private _tapError: (error: any) => void;
  private _tapComplete: () => void;

  constructor(
    destination: Subscriber<T>,
    nextOrObserver: PartialObserver<T>|((value: T) => void)|undefined,
    errorHandler: ((err: any) => void)|undefined,
    completeHandler: (() => void)|undefined
  ) {
    super(destination);

    if (isPartialObserver(nextOrObserver)) {
      this._tapNext = (nextOrObserver.next || noop).bind(nextOrObserver);
      this._tapError = (nextOrObserver.error || noop).bind(nextOrObserver);
      this._tapComplete = (nextOrObserver.complete || noop).bind(nextOrObserver);
    } else {
      this._tapNext = nextOrObserver as any || noop;
      this._tapError = errorHandler || noop;
      this._tapComplete = completeHandler || noop;
    }
  }

  _next(value: T) {
    const { _destination } = this;
    const result = tryUserFunction(this._tapNext, [value, this._subscription]);
    if (resultIsError(result)) {
      _destination.error(result.error);
    } else {
      _destination.next(value);
    }
  }

  _error(err: any) {
    const { _destination } = this;
    const result = tryUserFunction(this._tapError, [err]);
    if (resultIsError(result)) {
      _destination.error(result.error);
    } else {
      _destination.error(err);
    }
  }

  _complete() {
    const { _destination } = this;
    const result = tryUserFunction(this._tapComplete);
    if (resultIsError(result)) {
      _destination.error(result.error);
    } else {
      _destination.complete();
    }
  }
}
