import {Observable} from '../Observable';
import {Subscriber} from '../Subscriber';
import {noop} from '../util/noop';

export function create<T>() {
  return new InfiniteObservable<T>();
}

export class InfiniteObservable<T> extends Observable<T> {
  constructor() {
    super();
  }

  protected _subscribe(subscriber: Subscriber<T>): void {
    noop();
  }
}
