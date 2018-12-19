import { OperatorFunction } from 'rxjs/internal/types';
import { Observable } from 'rxjs/internal/Observable';
import { Subscription } from 'rxjs/internal/Subscription';
import { tryUserFunction, resultIsError } from 'rxjs/internal/util/userFunction';
import { Subscriber } from '../Subscriber';
import { OperatorSubscriber } from '../OperatorSubscriber';

export function scan<T>(reducer: (state: T, value: T, index: number) => T): OperatorFunction<T, T>;
export function scan<T, R>(reducer: (state: T|R, value: T, index: number) => R): OperatorFunction<T, R>;
export function scan<T, R>(reducer: (state: R, valeu: T, index: number) => R, initialState: R): OperatorFunction<T, R>;
export function scan<T, R, I>(reducer: (state: I|R, value: T, index: number) => R, initialState: I): OperatorFunction<T, R|I>;
export function scan<T, R, I>(reducer: (state: T|R|I, value: T, index: number) => R, initialState?: R|I): OperatorFunction<T, T|R|I> {
  let hasState = arguments.length >= 2;
  return (source: Observable<T>) => source.lift(scanOperator<T, R, I>(reducer, initialState, hasState));
}

function scanOperator<T, R, I>(reducer: (state: T|R|I, value: T, index: number) => R, initialState: R|I, hasState: boolean) {
  return function scanLift(this: Subscriber<T|R|I>, source: Observable<T>, subscription: Subscription) {
    return source.subscribe(new ScanSubscriber<T, R, I>(subscription, this, reducer, initialState, hasState));
  };
}

class ScanSubscriber<T, R, I> extends OperatorSubscriber<T> {
  private _index = 0;
  private _state: T|R|I;

  constructor(
    subscription: Subscription,
    destination: Subscriber<T|R|I>,
    private _reducer: (state: T|R|I, value: T, index: number) => R,
    _initialState: R|I,
    private _hasState: boolean
  ) {
    super(subscription, destination);
    if (_hasState) {
      this._state = _initialState;
    }
  }

  next(value: T) {
    const { _destination } = this;
    const index = this._index++;
    if (this._hasState) {
      value = tryUserFunction(this._reducer, [this._state, value, index]) as any;
      if (resultIsError(value)) {
        _destination.error(value.error);
        return;
      }
    }
    this._state = value;
    this._hasState = true;
    _destination.next(value);
  }
}
