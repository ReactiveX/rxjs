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
  return (source: Observable<T>) => source.lift(tapOperator(nextOrObserver, errorHandler, completeHandler));
}

export function tapOperator<T>(
  nextOrObserver?: PartialObserver<T>|((value: T) => void),
  errorHandler?: (err: any) => void,
  completeHandler?: () => void,
) {
  return function tapLift(this: Subscriber<T>, source: Observable<T>, subscription: Subscription) {
    return source.subscribe(new TapSubscriber(subscription, this, nextOrObserver, errorHandler, completeHandler))
  }
}

class TapSubscriber<T> extends OperatorSubscriber<T> {
  private _tapNext: (value: T, subscription: Subscription) => void;
  private _tapError: (error: any) => void;
  private _tapComplete: () => void;

  constructor(
    subscription: Subscription,
    destination: Subscriber<T>,
    nextOrObserver: PartialObserver<T>|((value: T) => void)|undefined,
    errorHandler: ((err: any) => void)|undefined,
    completeHandler: (() => void)|undefined
  ) {
    super(subscription, destination);

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
  next(value: T) {
    const result = tryUserFunction(this._tapNext, value, this._subscription);
    if (resultIsError(result)) {
      this._destination.error(result.error);
    } else {
      this._destination.next(value);
    }
  }

  error(err: any) {
    const result = tryUserFunction(this._tapError, err);
    if (resultIsError(result)) {
      this._destination.error(result.error);
    } else {
      this._destination.error(err);
    }
  }

  complete() {
    const result = tryUserFunction(this._tapComplete);
    if (resultIsError(result)) {
      this._destination.error(result.error);
    } else {
      this._destination.complete();
    }
  }
}