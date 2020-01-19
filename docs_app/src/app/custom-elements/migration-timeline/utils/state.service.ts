import {Injectable, OnDestroy} from '@angular/core';
import {ConnectableObservable, merge, noop, Observable, OperatorFunction, Subject, Subscription, UnaryFunction} from 'rxjs';
import {map, mergeAll, pluck, publishReplay, scan} from 'rxjs/operators';
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
export class State<T extends object> implements OnDestroy {
  private _subscription = new Subscription();
  private _stateObservables = new Subject<Observable<Partial<T>>>();
  private _effectSubject = new Subject<any>();
  private _stateSlices = new Subject<Partial<T>>();

  private _state$ = merge(
    this._stateObservables.pipe(mergeAll()),
    this._stateSlices
  ).pipe(
    scan(this.stateAccumulator, {} as T),
    publishReplay(1)
  );

  constructor() {
    this.init();
  }

  private stateAccumulator(acc: object, command: object): T {
    return ({...acc, ...command} as T);
  }

  init() {
    this._subscription.add((this._state$ as ConnectableObservable<T>).connect());
    this._subscription.add(
      this._effectSubject.pipe(mergeAll())
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
   * // Error
   * // ls.setState({test: 7});
   * ls.setState({test: 'tau'});
   * // Error
   * // ls.setState({bar: 'tau'});
   * ls.setState({bar: 7});
   */
  setState(s: Partial<T>): void {
    this._stateSlices.next(s);
  }

  /**
   * connectState(o: Observable<Partial<T>>) => void
   *
   * @param o: Observable<Partial<T>>
   *
   * @example
   * const ls = new LocalState<{test: string, bar: number}>();
   * // Error
   * // ls.connectState(of(7));
   * // ls.connectState(of('tau'));
   * ls.connectState(of());
   * // Error
   * // ls.connectState(of({test: 7}));
   * ls.connectState(of({test: 'tau'}));
   * // Error
   * // ls.connectState(of({bar: 'tau'}));
   * ls.connectState(of({bar: 7}));
   */
  connectState<A extends keyof T>(strOrObs: A | Observable<Partial<T>>, obs?: Observable<T[A]>): void {
    let _obs;
    if (typeof strOrObs === 'string') {
      const str: A = strOrObs;
      const o = obs as Observable<T[A]>;
      _obs = o.pipe(
        map(s => ({[str]: s}))
      );
    } else {
      const ob = strOrObs as Observable<Partial<T>>;
      _obs = ob;
    }
    this._stateObservables.next(_obs as Observable<Partial<T>> | Observable<T[A]>);
  }

  /**
   * select<R>(operator?: OperatorFunction<T, R>): Observable<T | R>
   *
   * @param operator?: OperatorFunction<T, R>
   *
   * @example
   * const ls = new LocalState<{test: string, bar: number}>();
   * ls.select();
   * // Error
   * // ls.select('foo');
   * ls.select('test');
   * // Error
   * // ls.select(of(7));
   * ls.select(mapTo(7));
   * // Error
   * // ls.select(map(s => s.foo));
   * ls.select(map(s => s.test));
   * // Error
   * // ls.select(pipe());
   * // ls.select(pipe(map(s => s.test), startWith(7)));
   * ls.select(pipe(map(s => s.test), startWith('unknown test value')));
   * @TODO consider state keys as string could be passed
   * // For state keys as string i.e. 'bar'
   select<R, K extends keyof T>(operator?: K): Observable<T>;
   if (typeof operator === 'string') {
      const key: string = operator;
      operators = pipe(map(s => operator ? s[key] : s));
    }
   * @TODO consider ngrx selectors could be passed
   * // For project functions i.e. (s) => s.slice, (s) => s.slice * 2 or (s) => 2
   * select<R>(operator: (value: T, index?: number) => T | R, thisArg?: any): Observable<T | R>;
   if (typeof operator === 'function') {
      const mapFn: (value: T, index: number) => R = operator ? operator : (value: T, index: number): R => value;
      operators = pipe(map(mapFn));
    }
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
      return this._state$
        .pipe(
          stateful()
        );
    } else if (!this.isStringArray(opOrMapFn)) {
      const path = (opOrMapFn as any) as string[];
      return this._state$.pipe(
        pluck(...path),
        stateful()
      );
    } else if (this.isOperateFnArray(opOrMapFn)) {
      const oprs = opOrMapFn as OperatorFunction<T, any>[];
      return this._state$.pipe(
        pipeFromArray(oprs),
        stateful()
      );
    }

    throw new Error('Wrong params passed' + JSON.stringify(opOrMapFn));
  }

  holdEffect(o: Observable<any>): void {
    this._effectSubject.next(o);
  }


  /**
   * teardown(): void
   *
   * When called it teardown all internal logic
   * used to connect to the `OnDestroy` life-cycle hook of services, components, directives, pipes
   */
  teardown(): void {
    this._subscription.unsubscribe();
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
