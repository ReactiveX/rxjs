import {Observable} from '../Observable';
import {Subscriber} from '../Subscriber';
import {Subscription} from '../Subscription';

export class IfObservable<T, R> extends Observable<T> {
  " tag_class_IfObservable": [T, R];

  static create<T, R>(condition: () => boolean,
                      thenSource?: Observable<T>,
                      elseSource?: Observable<R>): Observable<T|R> {
    return new IfObservable(condition, thenSource, elseSource);
  }

  constructor(private condition: () => boolean,
              private thenSource?: Observable<T>,
              private elseSource?: Observable<R>) {
    super();
  }

  protected _subscribe(subscriber: Subscriber<T|R>): Subscription | Function | void {

    const { condition, thenSource, elseSource } = this;

    let result: boolean, error: any, errorHappened = false;

    try {
      result = condition();
    } catch (e) {
      error = e;
      errorHappened = true;
    }

    if (errorHappened) {
      subscriber.error(error);
    } else if (result && thenSource) {
      return thenSource.subscribe(subscriber);
    } else if (elseSource) {
      return elseSource.subscribe(subscriber);
    } else {
      subscriber.complete();
    }
  }
}
