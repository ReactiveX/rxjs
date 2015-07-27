import Observable from '../Observable';

export default class InfiniteObservable<T> extends Observable<T> {

  static create<T>() {
    return new InfiniteObservable();
  }

  constructor() {
    super();
  }

  _subscribe(subscriber) {
  }
}
