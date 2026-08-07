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

// BEGIN GENERATED FUNCTIONAL SURFACE

/**
 * Creates the pipeable `zipWith` form of the exact-Symbol `[zipWith]` capability.
 *
 * The source is supplied when the returned unary function is composed with
 * `rx`, `pipe`, or another function-composition helper. The result uses the same construction, error-forwarding, and AbortSignal cancellation behavior as the Symbol form.
 *
 * @returns A unary function that applies `[zipWith]` to its source.
 */
export function pipeableZipWith<T, OtherSources extends readonly ObservableInput<any>[]>(...otherSources: OtherSources): (source: Observable<T>) => Observable<ZipWithValues<T, OtherSources>>;
export function pipeableZipWith(...args: any[]): any {
  return (source: Observable<any>) => Reflect.apply(source[zipWith] as (...values: any[]) => any, source, args);
}

// END GENERATED FUNCTIONAL SURFACE
