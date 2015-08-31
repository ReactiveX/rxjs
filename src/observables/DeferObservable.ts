import Observable from '../Observable';
import Subscription from '../Subscription';

import tryCatch from '../util/tryCatch';
import {errorObject} from '../util/errorObject';

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
    const result = tryCatch(this.observableFactory)();
    if(result === errorObject) {
      subscriber.error(errorObject.e);
    } else {
      result.subscribe(subscriber);
    }
  }
}
