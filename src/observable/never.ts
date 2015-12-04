import {Observable} from '../Observable';
import {Subscriber} from '../Subscriber';
import {noop} from '../util/noop';

export class InfiniteObservable<T> extends Observable<T> {
  static create<T>() {
    return new InfiniteObservable();
  }

  constructor() {
    super();
  }

  _subscribe(subscriber: Subscriber<T>): void {
    noop();
  }
}
