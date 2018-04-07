import { Observable, SubscribableOrPromise, iif } from 'rxjs';

export class IfObservable<T> extends Observable<T> {
  static create<T, R>(condition: () => boolean | void,
                      thenSource?: SubscribableOrPromise<T> | void,
                      elseSource?: SubscribableOrPromise<R> | void): Observable<T|R> {
    return iif(<() => boolean>condition, <SubscribableOrPromise<T>>thenSource, <SubscribableOrPromise<R>>elseSource);
  }
}