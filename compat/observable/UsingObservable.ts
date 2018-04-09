import { Observable, ObservableInput, Unsubscribable, SubscribableOrPromise, using } from 'rxjs';

export class UsingObservable<T> extends Observable<T> {
  static create<T, Resource>(
    resourceFactory: () => Resource | void,
    observableFactory: (resource: Resource | void) => ObservableInput<T> | void,
    disposeFunction: (resource: Resource | void) => void
  ): Observable<T> {
    return using(resourceFactory, observableFactory, disposeFunction);
  }
}