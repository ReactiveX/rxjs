import { zip } from './zip.js';

type ObservedValueOf<Input> = Input extends ObservableInput<infer T> ? T : never;
type ZipWithValues<T, OtherSources extends readonly ObservableInput<any>[]> = [
  T,
  ...{
    [K in keyof OtherSources]: ObservedValueOf<OtherSources[K]>;
  }
];

export const zipWith: unique symbol = Symbol('zipWith');

declare global {
  interface Observable<T> {
    [zipWith]: <OtherSources extends readonly ObservableInput<any>[]>(
      ...otherSources: OtherSources
    ) => Observable<ZipWithValues<T, OtherSources>>;
  }
}

Observable.prototype[zipWith] = function <T, OtherSources extends readonly ObservableInput<any>[]>(
  this: Observable<T>,
  ...otherSources: OtherSources
): Observable<ZipWithValues<T, OtherSources>> {
  return zip([this, ...otherSources] as [Observable<T>, ...OtherSources]);
};
