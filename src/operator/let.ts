import {Observable, IObservable} from '../Observable';

/**
 * @param func
 * @return {Observable<R>}
 * @method let
 * @owner Observable
 */
export function letProto<T, R>(func: (selector: IObservable<T>) => Observable<R>): IObservable<R> {
  return func(this);
}

export interface LetSignature<T> {
  <R>(func: (selector: IObservable<T>) => Observable<R>): IObservable<R>;
}
