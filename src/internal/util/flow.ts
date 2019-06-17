import { Observable, OperatorFunction } from 'rxjs';

/* tslint:disable:max-line-length */
export function flow<T>(obs: Observable<T>): Observable<T>;
export function flow<T, A>(obs: Observable<T>, op1: OperatorFunction<T, A>): Observable<A>;
export function flow<T, A, B>(obs: Observable<T>, op1: OperatorFunction < T, A >, op2: OperatorFunction<A, B>): Observable<B>;
export function flow<T, A, B, C>(obs: Observable<T>, op1: OperatorFunction < T, A >, op2: OperatorFunction < A, B >, op3: OperatorFunction<B, C>): Observable<C>;
export function flow<T, A, B, C, D>(obs: Observable<T>, op1: OperatorFunction < T, A >, op2: OperatorFunction < A, B >, op3: OperatorFunction < B, C >, op4: OperatorFunction<C, D>): Observable<D>;
export function flow<T, A, B, C, D, E>(obs: Observable<T>, op1: OperatorFunction < T, A >, op2: OperatorFunction < A, B >, op3: OperatorFunction < B, C >, op4: OperatorFunction < C, D >, op5: OperatorFunction<D, E>): Observable<E>;
export function flow<T, A, B, C, D, E, F>(obs: Observable<T>, op1: OperatorFunction < T, A >, op2: OperatorFunction < A, B >, op3: OperatorFunction < B, C >, op4: OperatorFunction < C, D >, op5: OperatorFunction < D, E >, op6: OperatorFunction<E, F>): Observable<F>;
export function flow<T, A, B, C, D, E, F, G>(obs: Observable<T>, op1: OperatorFunction < T, A >, op2: OperatorFunction < A, B >, op3: OperatorFunction < B, C >, op4: OperatorFunction < C, D >, op5: OperatorFunction < D, E >, op6: OperatorFunction < E, F >, op7: OperatorFunction<F, G>): Observable<G>;
export function flow<T, A, B, C, D, E, F, G, H>(obs: Observable<T>, op1: OperatorFunction < T, A >, op2: OperatorFunction < A, B >, op3: OperatorFunction < B, C >, op4: OperatorFunction < C, D >, op5: OperatorFunction < D, E >, op6: OperatorFunction < E, F >, op7: OperatorFunction < F, G >, op8: OperatorFunction<G, H>): Observable<H>;
export function flow<T, A, B, C, D, E, F, G, H, I>(obs: Observable<T>, op1: OperatorFunction < T, A >, op2: OperatorFunction < A, B >, op3: OperatorFunction < B, C >, op4: OperatorFunction < C, D >, op5: OperatorFunction < D, E >, op6: OperatorFunction < E, F >, op7: OperatorFunction < F, G >, op8: OperatorFunction < G, H >, op9: OperatorFunction<H, I>): Observable<I>;
export function flow<T, A, B, C, D, E, F, G, H, I>(obs: Observable<T>, op1: OperatorFunction < T, A >, op2: OperatorFunction < A, B >, op3: OperatorFunction < B, C >, op4: OperatorFunction < C, D >, op5: OperatorFunction < D, E >, op6: OperatorFunction < E, F >, op7: OperatorFunction < F, G >, op8: OperatorFunction < G, H >, op9: OperatorFunction < H, I >, ...operations: OperatorFunction < any, any > []): Observable<{}>;

  /**
   * Functional version pipe, it more readable than pipe
   * @method flow
   * @return {Observable} the Observable result of all of the operators having
   * been called in the order they were passed in.
   *
   * ### Example
   * ```ts
   * import { interval, flow } from 'rxjs';
   * import { map, filter, scan } from 'rxjs/operators';
   *
   * flow(
   *    interval(1000),
   *    filter(x => x % 2 === 0),
   *    map(x => x + x),
   *    scan((acc, x) => acc + x)
   * ).subscribe(x => console.log(x))
   * ```
   */
export function flow<T>(obs: Observable<T>, ...operators: OperatorFunction<any, any>[]) {
  // @ts-ignore
  return obs.pipe(...operators);
}
