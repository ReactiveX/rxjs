import {Observable} from '../Observable';
import {Subscriber} from '../Subscriber';
import {noop} from '../util/noop';

export class InfiniteObservable<T> extends Observable<T> {
  static create<T>() {
    return new InfiniteObservable<T>();
  }

  constructor() {
    super();
  }

  protected _subscribe(subscriber: Subscriber<T>): void {
    noop();
  }
}
