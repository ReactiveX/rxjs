import {IObservable} from '../Observable';

/**
 * @param func
 * @return {Observable<R>}
 * @method let
 * @owner Observable
 */
export function letProto<T, R>(func: (selector: IObservable<T>) => IObservable<R>): IObservable<R> {
  return func(this);
}

export interface LetSignature<T> {
  <R>(func: (selector: IObservable<T>) => IObservable<R>): IObservable<R>;
}
