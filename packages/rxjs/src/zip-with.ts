import { zip } from './zip.js';

type ObservedValueOf<Input> = Input extends ObservableValue<infer T> ? T : never;
type ZipWithValues<T, OtherSources extends readonly ObservableValue<any>[]> = [
  T,
  ...{
    [K in keyof OtherSources]: ObservedValueOf<OtherSources[K]>;
  }
];

export const zipWith: unique symbol = Symbol('zipWith');

declare global {
  interface Observable<T> {
    [zipWith]: <OtherSources extends readonly ObservableValue<any>[]>(
      ...otherSources: OtherSources
    ) => Observable<ZipWithValues<T, OtherSources>>;
  }
}

Observable.prototype[zipWith] = function <T, OtherSources extends readonly ObservableValue<any>[]>(
  this: Observable<T>,
  ...otherSources: OtherSources
): Observable<ZipWithValues<T, OtherSources>> {
  return zip([this, ...otherSources] as [Observable<T>, ...OtherSources]);
};
