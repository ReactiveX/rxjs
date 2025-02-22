import { combine } from './combine';
import { ObservedValuesOf } from './util/types';

export const withLatestFrom = Symbol('withLatestFrom');

declare global {
  interface Observable<T> {
    [withLatestFrom]: <Sources extends readonly ObservableValue<any>[]>(sources: Sources) => Observable<[T, ...ObservedValuesOf<Sources>]>;
  }
}

Observable.prototype[withLatestFrom] = function withLatestFromImpl<T, Sources extends readonly ObservableValue<any>[]>(
  this: Observable<T>,
  sources: Sources
): Observable<[T, ...ObservedValuesOf<Sources>]> {
  return this[combine]([{ source: this, causesEmit: true }, ...sources.map((source) => ({ source, causesEmit: false }))]) as any;
};
