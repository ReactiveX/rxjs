import Observable from '../Observable';
import Subscriber from '../Subscriber';

import tryCatch from '../util/tryCatch';
import {errorObject} from '../util/errorObject';

export default class DeferObservable<T> extends Observable<T> {
  static create<T>(observableFactory: () => Observable<T>): Observable<T> {
    return new DeferObservable(observableFactory);
  }

  constructor(private observableFactory: () => Observable<T>) {
    super();
  }

  _subscribe(subscriber: Subscriber<T>) {
    const result = tryCatch(this.observableFactory)();
    if (result === errorObject) {
      subscriber.error(errorObject.e);
    } else {
      result.subscribe(subscriber);
    }
  }
}
