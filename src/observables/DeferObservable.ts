import Observable from '../Observable';
import Subscription from '../Subscription';

export default class DeferObservable<T> extends Observable<T> {

  static create<T>(observableFactory) {
    return new DeferObservable(observableFactory);
  }

  observableFactory: () => Observable<T>;

  constructor(observableFactory) {
    super();
    this.observableFactory = observableFactory;
  }

  _subscribe(subscriber) {
    return this.observableFactory().subscribe(subscriber);
  }
}
