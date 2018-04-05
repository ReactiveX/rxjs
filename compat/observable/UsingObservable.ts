import { Observable, Unsubscribable, SubscribableOrPromise, using } from 'rxjs';

export class UsingObservable<T> extends Observable<T> {
  static create<T>(resourceFactory: () => Unsubscribable | void,
                   observableFactory: (resource: Unsubscribable | void) => SubscribableOrPromise<T> | void): Observable<T> {
    return using(resourceFactory, observableFactory);
  }
}