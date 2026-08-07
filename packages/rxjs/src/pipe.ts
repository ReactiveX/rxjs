import { convertObservableValue } from './util/observable-helpers.js';

export const pipe: unique symbol = Symbol('pipe');

type Fn<A, B> = (a: A) => B;

declare global {
  interface ObservableCtor {
    [pipe]: {
      <T, A, B, C, D, E, F, G>(
        source: ObservableInput<T>,
        t: Fn<Observable<T>, A>,
        a: Fn<A, B>,
        b: Fn<B, C>,
        c: Fn<C, D>,
        d: Fn<D, E>,
        e: Fn<E, F>,
        f: Fn<F, G>
      ): G;
      <T, A, B, C, D, E, F>(
        source: ObservableInput<T>,
        t: Fn<Observable<T>, A>,
        a: Fn<A, B>,
        b: Fn<B, C>,
        c: Fn<C, D>,
        d: Fn<D, E>,
        e: Fn<E, F>
      ): F;
      <T, A, B, C, D, E>(source: ObservableInput<T>, t: Fn<Observable<T>, A>, a: Fn<A, B>, b: Fn<B, C>, c: Fn<C, D>, d: Fn<D, E>): E;
      <T, A, B, C, D>(source: ObservableInput<T>, t: Fn<Observable<T>, A>, a: Fn<A, B>, b: Fn<B, C>, c: Fn<C, D>): D;
      <T, A, B, C>(source: ObservableInput<T>, t: Fn<Observable<T>, A>, a: Fn<A, B>, b: Fn<B, C>): C;
      <T, A, B>(source: ObservableInput<T>, t: Fn<Observable<T>, A>, a: Fn<A, B>): B;
      <T, A>(source: ObservableInput<T>, t: Fn<Observable<T>, A>): A;
    };
  }

  interface Observable<T> {
    [pipe]: {
      <A, B, C, D, E, F, G>(t: Fn<Observable<T>, A>, a: Fn<A, B>, b: Fn<B, C>, c: Fn<C, D>, d: Fn<D, E>, e: Fn<E, F>, f: Fn<F, G>): G;
      <A, B, C, D, E, F>(t: Fn<Observable<T>, A>, a: Fn<A, B>, b: Fn<B, C>, c: Fn<C, D>, d: Fn<D, E>, e: Fn<E, F>): F;
      <A, B, C, D, E>(t: Fn<Observable<T>, A>, a: Fn<A, B>, b: Fn<B, C>, c: Fn<C, D>, d: Fn<D, E>): E;
      <A, B, C, D>(t: Fn<Observable<T>, A>, a: Fn<A, B>, b: Fn<B, C>, c: Fn<C, D>): D;
      <A, B, C>(t: Fn<Observable<T>, A>, a: Fn<A, B>, b: Fn<B, C>): C;
      <A, B>(t: Fn<Observable<T>, A>, a: Fn<A, B>): B;
      <A>(t: Fn<Observable<T>, A>): A;
    };
  }
}

function instancePipe(this: Observable<any>, ...fns: Fn<any, any>[]): any {
  return fns.reduce((prev, fn) => fn(prev), this);
}

function staticPipe(this: ObservableCtor, source: ObservableInput<any>, ...fns: Fn<any, any>[]): any {
  const actualSource = convertObservableValue({ value: source });
  return fns.reduce((prev, fn) => fn(prev), actualSource);
}

Observable[pipe] = staticPipe;
Observable.prototype[pipe] = instancePipe;

// BEGIN GENERATED FUNCTIONAL SURFACE

/**
 * Creates the pipeable `pipe` form of the exact-Symbol `[pipe]` capability.
 *
 * The source is supplied when the returned unary function is composed with
 * `rx`, `pipe`, or another function-composition helper. Any non-Observable result is returned unchanged.
 *
 * @returns A unary function that applies `[pipe]` to its source.
 */
export function pipeablePipe<T, A, B, C, D, E, F, G>(t: Fn<Observable<T>, A>, a: Fn<A, B>, b: Fn<B, C>, c: Fn<C, D>, d: Fn<D, E>, e: Fn<E, F>, f: Fn<F, G>): (source: Observable<T>) => G;
export function pipeablePipe<T, A, B, C, D, E, F>(t: Fn<Observable<T>, A>, a: Fn<A, B>, b: Fn<B, C>, c: Fn<C, D>, d: Fn<D, E>, e: Fn<E, F>): (source: Observable<T>) => F;
export function pipeablePipe<T, A, B, C, D, E>(t: Fn<Observable<T>, A>, a: Fn<A, B>, b: Fn<B, C>, c: Fn<C, D>, d: Fn<D, E>): (source: Observable<T>) => E;
export function pipeablePipe<T, A, B, C, D>(t: Fn<Observable<T>, A>, a: Fn<A, B>, b: Fn<B, C>, c: Fn<C, D>): (source: Observable<T>) => D;
export function pipeablePipe<T, A, B, C>(t: Fn<Observable<T>, A>, a: Fn<A, B>, b: Fn<B, C>): (source: Observable<T>) => C;
export function pipeablePipe<T, A, B>(t: Fn<Observable<T>, A>, a: Fn<A, B>): (source: Observable<T>) => B;
export function pipeablePipe<T, A>(t: Fn<Observable<T>, A>): (source: Observable<T>) => A;
export function pipeablePipe(...args: any[]): any {
  return (source: Observable<any>) => Reflect.apply(source[pipe] as (...values: any[]) => any, source, args);
}

// END GENERATED FUNCTIONAL SURFACE
