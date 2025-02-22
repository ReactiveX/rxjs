import '../observable-polyfill';

export const pipe: unique symbol = Symbol('pipe');

type Fn<A, B> = (a: A) => B;

declare global {
  interface ObservableCtor {
    [pipe]: {
      <T, A, B, C, D, E, F, G>(
        source: ObservableValue<T>,
        t: Fn<Observable<T>, A>,
        a: Fn<A, B>,
        b: Fn<B, C>,
        c: Fn<C, D>,
        d: Fn<D, E>,
        e: Fn<E, F>,
        f: Fn<F, G>
      ): G;
      <T, A, B, C, D, E, F>(
        source: ObservableValue<T>,
        t: Fn<Observable<T>, A>,
        a: Fn<A, B>,
        b: Fn<B, C>,
        c: Fn<C, D>,
        d: Fn<D, E>,
        e: Fn<E, F>
      ): F;
      <T, A, B, C, D, E>(source: ObservableValue<T>, t: Fn<Observable<T>, A>, a: Fn<A, B>, b: Fn<B, C>, c: Fn<C, D>, d: Fn<D, E>): E;
      <T, A, B, C, D>(source: ObservableValue<T>, t: Fn<Observable<T>, A>, a: Fn<A, B>, b: Fn<B, C>, c: Fn<C, D>): D;
      <T, A, B, C>(source: ObservableValue<T>, t: Fn<Observable<T>, A>, a: Fn<A, B>, b: Fn<B, C>): C;
      <T, A, B>(source: ObservableValue<T>, t: Fn<Observable<T>, A>, a: Fn<A, B>): B;
      <T, A>(source: ObservableValue<T>, t: Fn<Observable<T>, A>): A;
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

Observable.prototype[pipe] = function (this: Observable<any>, ...fns: Fn<any, any>[]): any {
  return fns.reduce((prev, fn) => fn(prev), this);
};

Observable[pipe] = function (this: ObservableCtor, source: ObservableValue<any>, ...fns: Fn<any, any>[]) {
  const actualSource = this.from(source);
  return fns.reduce((prev, fn) => fn(prev), actualSource);
};
