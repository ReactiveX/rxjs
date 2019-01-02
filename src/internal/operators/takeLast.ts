import { OperatorFunction } from 'rxjs/internal/types';
import { Observable } from 'rxjs/internal/Observable';
import { Subscription } from 'rxjs/internal/Subscription';
import { Subscriber } from '../Subscriber';
import { OperatorSubscriber } from '../OperatorSubscriber';
import { EMPTY } from '../EMPTY';

export function takeLast<T>(count: number = 1): OperatorFunction<T, T> {
  count = Math.max(count, 0);
  return (source: Observable<T>) => count === 0 ? EMPTY : new Observable(subscriber => source.subscribe(new TakeLastSubscriber(subscriber, count)));
}

class TakeLastSubscriber<T> extends OperatorSubscriber<T> {
  private _buffer: T[] = [];

  constructor(destination: Subscriber<T>, private _count: number) {
    super(destination);
  }

  _next(value: T) {
    const { _buffer } = this;
    _buffer.push(value);
    _buffer.splice(0, _buffer.length - this._count);
  }

  _complete() {
    const { _buffer, _destination } = this;
    for (let i = 0; i < _buffer.length && !_destination.closed; i++) {
      _destination.next(_buffer[i]);
    }
    _destination.complete();
    this._buffer = null;
  }
}
