import {Observable} from '../Observable';
import {Subscriber} from '../Subscriber';
import {tryCatch} from '../util/tryCatch';
import {errorObject} from '../util/errorObject';

/**
 *
 */
export class DeferObservable<T> extends Observable<T> {

  /**
   * @param observableFactory
   * @return {DeferObservable}
   * @static true
   * @name defer
   * @owner Observable
   */
  static create<T>(observableFactory: () => Observable<T> | void): Observable<T> {
    return new DeferObservable(observableFactory);
  }

  constructor(private observableFactory: () => Observable<T> | void) {
    super();
  }

  protected _subscribe(subscriber: Subscriber<T>) {
    const result = tryCatch(this.observableFactory)();
    if (result === errorObject) {
      subscriber.error(errorObject.e);
    } else {
      (<Observable<T>>result).subscribe(subscriber);
    }
  }
}
