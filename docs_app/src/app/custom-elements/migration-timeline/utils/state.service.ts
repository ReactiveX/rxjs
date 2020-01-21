import {Injectable, OnDestroy} from '@angular/core';
import {ConnectableObservable, merge, noop, Observable, OperatorFunction, Subject, Subscription, UnaryFunction} from 'rxjs';
import {map, mergeAll, pluck, publishReplay, scan, tap} from 'rxjs/operators';
import {stateful} from './operators';

function pipeFromArray<T, R>(fns: Array<UnaryFunction<T, R>>): UnaryFunction<T, R> {
  if (!fns) {
    return noop as UnaryFunction<any, any>;
  }

  if (fns.length === 1) {
    return fns[0];
  }

  return function piped(input: T): R {
    return fns.reduce((prev: any, fn: UnaryFunction<T, R>) => fn(prev), input as any);
  };
}

@Injectable()
export class State<T> implements OnDestroy {
  private subscription = new Subscription();
  private stateObservables = new Subject<Observable<Partial<T>>>();
  private effectSubject = new Subject<any>();
  private stateSlices = new Subject<Partial<T>>();

  private state$ = merge(
    this.stateObservables.pipe(mergeAll()),
    this.stateSlices
  ).pipe(
    scan(this.stateAccumulator, {} as T),
    publishReplay(1)
  );

  constructor() {
    this.init();
  }

  private stateAccumulator(acc: T, command: Partial<T>): T {
    const a = (acc as any) as object;
    const c = (command as any) as object;
    return ({...a, ...c} as T);
  }

  init() {
    this.subscription.add((this.state$ as ConnectableObservable<T>).connect());
    this.subscription.add(
      this.effectSubject.pipe(mergeAll())
        .subscribe()
    );
  }

  /**
   * setState(s: Partial<T>) => void
   *
   * @param s: Partial<T>
   *
   * @example
   * const ls = new LocalState<{test: string, bar: number}>();
   * ls.setState({test: 'tau'});
   * ls.setState({bar: 7});
   */
  setState(s: Partial<T>): void {
    this.stateSlices.next(s);
  }

  /**
   * @example
   * const ls = new LocalState<{test: string, bar: number}>();
   * ls.connectState(of({test: 'tau'}));
   * ls.connectState('bar', of(42));
   */
  connectState<A extends keyof T>(str: A, obs: Observable<T[A]>): void;
  connectState<A extends keyof T>(obs: Observable<Partial<T>>): void;
  connectState<A extends keyof T>(strOrObs: any, obs?: any): void {
    if (typeof strOrObs === 'string') {
      this.stateObservables.next(obs.pipe(map(s => ({[strOrObs as A]: s}))) as Observable<T[A]>);
    } else {
      this.stateObservables.next(strOrObs);
    }
  }

  /**
   * @example
   * const ls = new LocalState<{test: string, foo: {baz: 42}, bar: number}>();
   * ls.select();
   * ls.select('test');
   * ls.select('foo', 'baz');
   * ls.select(mapTo(7));
   * ls.select(map(s => s.test), startWith('unknown test value'));
   * ls.select(pipe(map(s => s.test), startWith('unknown test value')));
   */
  select(): Observable<T>;
  // ========================
  select<A = T>(
    op: OperatorFunction<T, A>
  ): Observable<A>;
  select<A = T, B = A>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>
  ): Observable<B>;
  select<A = T, B = A, C = B>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>
  ): Observable<C>;
  select<A = T, B = A, C = B, D = C>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
  ): Observable<D>;
  select<A = T, B = A, C = B, D = C, E = D>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>,
  ): Observable<E>;
  // ================================
  select<K1 extends keyof T>(k1: K1): Observable<T[K1]>;
  select<K1 extends keyof T,
    K2 extends keyof T[K1]>(k1: K1, k2: K2): Observable<T[K1][K2]>;
  select<K1 extends keyof T,
    K2 extends keyof T[K1],
    K3 extends keyof T[K1][K2]>(k1: K1, k2: K2, k3: K3): Observable<T[K1][K2][K3]>;
  select<K1 extends keyof T,
    K2 extends keyof T[K1],
    K3 extends keyof T[K1][K2],
    K4 extends keyof T[K1][K2][K3]>(k1: K1, k2: K2, k3: K3, k4: K4): Observable<T[K1][K2][K3][K4]>;
  select<K1 extends keyof T,
    K2 extends keyof T[K1],
    K3 extends keyof T[K1][K2],
    K4 extends keyof T[K1][K2][K3],
    K5 extends keyof T[K1][K2][K3][K4]>(k1: K1, k2: K2, k3: K3, k4: K4, k5: K5): Observable<T[K1][K2][K3][K4][K5]>;
  select<K1 extends keyof T,
    K2 extends keyof T[K1],
    K3 extends keyof T[K1][K2],
    K4 extends keyof T[K1][K2][K3],
    K5 extends keyof T[K1][K2][K3][K4],
    K6 extends keyof T[K1][K2][K3][K4][K5]>(k1: K1, k2: K2, k3: K3, k4: K4, k5: K5, k6: K6): Observable<T[K1][K2][K3][K4][K5][K6]>;
  // ===========================
  select(...opOrMapFn: any[]): Observable<any> {
    if (!opOrMapFn || opOrMapFn.length === 0) {
      return this.state$
        .pipe(
          stateful()
        );
    } else if (!this.isStringArray(opOrMapFn)) {
      const path = (opOrMapFn as any) as string[];
      return this.state$.pipe(
        pluck(...path),
        stateful()
      );
    } else if (this.isOperateFnArray(opOrMapFn)) {
      const oprs = opOrMapFn as OperatorFunction<T, any>[];
      return this.state$.pipe(
        pipeFromArray(oprs),
        stateful()
      );
    }

    throw new Error('Wrong params passed' + JSON.stringify(opOrMapFn));
  }


  /**
   * holdEffect(o: Observable<any>) => void
   *
   * @example
   * const ls = new LocalState<{test: string, bar: number}>();
   * ls.holdEffect(of());
   * ls.holdEffect(of().pipe(tap(n => console.log('side effect', n))));
   * ls.holdEffect(of(), n => console.log('side effect', n));
   */
  holdEffect<S>(observableWithSideEffect: Observable<S>): void;
  holdEffect<S>(obsOrObsWithSideEffect: Observable<S>, sideEffectFn?: (arg: S) => void): void {
    if (sideEffectFn) {
      this.effectSubject.next(obsOrObsWithSideEffect.pipe(tap(sideEffectFn)));
    }
    this.effectSubject.next(obsOrObsWithSideEffect);
  }


  /**
   * teardown(): void
   *
   * When called it teardown all internal logic
   * used to connect to the `OnDestroy` life-cycle hook of services, components, directives, pipes
   */
  teardown(): void {
    this.subscription.unsubscribe();
  }

  private isOperateFnArray(op: any[]): op is OperatorFunction<T, any>[] {
    return op.every((i: any) => typeof i !== 'string');
  }

  private isStringArray(op: any[]): op is string[] {
    return op.every((i: any) => typeof i !== 'string');
  }

  /**
   * ngOnDestroy(): void
   *
   * When called it teardown all internal logic
   * used to connect to the `OnDestroy` life-cycle hook of services, components, directives, pipes
   */
  ngOnDestroy(): void {
    this.teardown();
  }

}

@Injectable({
  providedIn: 'root'
})
export class GlobalState<T> extends State<T> {

}
