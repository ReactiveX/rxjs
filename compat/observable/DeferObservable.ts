import { Observable, SubscribableOrPromise, defer } from 'rxjs';

export class DeferObservable<T> extends Observable<T> {
  static create<T>(observableFactory: () => SubscribableOrPromise<T> | void): Observable<T> {
    return defer(observableFactory);
  }
}