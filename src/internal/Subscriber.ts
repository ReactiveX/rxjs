import { Observer } from './types';
import { Subscription } from './Subscription';
import { MutableSubscriber } from 'rxjs/internal/MutableSubscriber';

export class Subscriber<T> {
  get closed() {
    return this._mut.closed;
  }

  constructor(private _mut: MutableSubscriber<T>) {}

  next(value: T) {
    const _mut = this._mut;
    if (!_mut.closed) {
      _mut.next(value);
    }
  }

  error(err: any) {
    const _mut = this._mut;
    if (!_mut.closed) {
      _mut.error(err);
    }
  }

  complete() {
    const _mut = this._mut;
    if (!_mut.closed) {
      _mut.complete();
    }
  }
}
