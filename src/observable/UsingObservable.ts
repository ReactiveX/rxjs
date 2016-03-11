import {Observable} from '../Observable';
import {Subscriber} from '../Subscriber';
import {Subscription} from '../Subscription';

export class UsingObservable<T> extends Observable<T> {
  " tag_class_UsingObservable": T;

  static create<T>(resourceFactory: () => Subscription,
                   observableFactory: (resource: Subscription) => Observable<T>): Observable<T> {
    return new UsingObservable<T>(resourceFactory, observableFactory);
  }

  constructor(private resourceFactory: () => Subscription,
              private observableFactory: (resource: Subscription) => Observable<T>) {
    super();
  }

  protected _subscribe(subscriber: Subscriber<T>): Subscription | Function | void {

    const { resourceFactory, observableFactory } = this;

    let resource: Subscription,
        source: Observable<T>,
        error: any, errorHappened = false;

    try {
      resource = resourceFactory();
    } catch (e) {
      error = e;
      errorHappened = true;
    }

    if (errorHappened) {
      subscriber.error(error);
    } else {
      subscriber.add(resource);
      try {
        source = observableFactory(resource);
      } catch (e) {
        error = e;
        errorHappened = true;
      }

      if (errorHappened) {
        subscriber.error(error);
      } else {
        return source.subscribe(subscriber);
      }
    }
  }
}
