import {Injectable, OnDestroy} from '@angular/core';
import {ConnectableObservable, isObservable, merge, noop, Observable, OperatorFunction, Subject, Subscription, UnaryFunction} from 'rxjs';
import {filter, map, mergeAll, pluck, publishReplay, scan, tap} from 'rxjs/operators';
import {stateful} from './operators';


type ProjectStateFn<T> = (oldState: T) => Partial<T>;
type ProjectValueFn<T, K extends keyof T> = (oldState: T) => T[K];
type ProjectStateReducer<T, K extends keyof T> = (
    oldState: T,
    value: any
) => Partial<T>;
type ProjectValueReducer<T, K extends keyof T> = (
    oldState: T,
    value: any
) => T[K];

export function isKeyOf<O>(k: unknown): k is keyof O {
  return (
      !!k &&
      (typeof k === 'string' || typeof k === 'symbol' || typeof k === 'number')
  );
}

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
  private state = {} as T;

  private state$ = merge(
    this.stateObservables.pipe(mergeAll()),
    this.stateSlices
  ).pipe(
    scan(this.stateAccumulator, {} as T),
    tap(newState => (this.state = newState)),
    publishReplay(1)
  );

  /**
   * @description
   * The full state exposed as `Observable<T>`
   */
  readonly $ = this.state$;


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
   * @description
   * Manipulate one or many properties of the state by providing a `Partial<T>` state or a `ProjectionFunction<T>`.
   *
   * @example
   * Update one or many properties of the state by providing a `Partial<T>`
   * ```TypeScript
   * const partialState = {
   *   foo: 'bar',
   *   bar: 5
   * };
   * state.set(partialState);
   * ```
   *
   * Update one or many properties of the state by providing a `ProjectionFunction<T>`
   * ```TypeScript
   * const reduceFn = oldState => ({
   *   bar: oldState.bar + 5
   * });
   * state.set(reduceFn);
   * ```
   *
   * @param {Partial<T>|ProjectStateFn<T>} stateOrProjectState
   * @return void
   */
  set(stateOrProjectState: Partial<T> | ProjectStateFn<T>): void;

  /**
   * @description
   * Manipulate a single property of the state by the property name and a `ProjectionFunction<T>`.
   *
   * @example
   * ```TypeScript
   * const reduceFn = oldState => oldState.bar + 5;
   * state.set('bar', reduceFn);
   * ```
   *
   * @param {K} key
   * @param {ProjectValueFn<T, K>} projectSlice
   * @return void
   */
  set<K extends keyof T, O>(key: K, projectSlice: ProjectValueFn<T, K>): void;
  // TODO: set correct parameters
  /**
   * @description
   * Manipulate a single property by providing the property name and a value.
   *
   * @example
   * ```TypeScript
   * state.set('bar', 5);
   * ```
   *
   * @param {K} keyOrStateOrProjectState
   * @param {ProjectValueFn<T, K>} stateOrSliceProjectFn
   * @return void
   */
  set<K extends keyof T>(
      keyOrStateOrProjectState: Partial<T> | ProjectStateFn<T> | K,
      stateOrSliceProjectFn?: ProjectValueFn<T, K>
  ): void {
    if (
        typeof keyOrStateOrProjectState === 'object' &&
        stateOrSliceProjectFn === undefined
    ) {
      this.stateSlices.next(keyOrStateOrProjectState);
      return;
    }

    if (
        typeof keyOrStateOrProjectState === 'function' &&
        stateOrSliceProjectFn === undefined
    ) {
      this.stateSlices.next(
          keyOrStateOrProjectState(this.state)
      );
      return;
    }

    if (
        isKeyOf<T>(keyOrStateOrProjectState) &&
        typeof stateOrSliceProjectFn === 'function'
    ) {
      const state: Partial<T> = {};
      state[keyOrStateOrProjectState] = stateOrSliceProjectFn(
          this.state
      );
      this.stateSlices.next(state);
      return;
    }

    throw new Error('wrong param');
  }



  /**
   * @description
   * Read from the state in imperative manner. Returns the state object in its current state.
   *
   * @example
   * ```Typescript
   * const { disabled } = state.get();
   * if (!disabled) {
   *   doStuff();
   * }
   * ```
   *
   * @return T
   */
  get(): T {
    return this.state;
  }

  /**
   * @description
   * Connect an `Observable<Partial<T>>` to the state `T`.
   * Any change emitted by the source will get merged into the state.
   * Subscription handling is done automatically.
   *
   * @example
   * ```Typescript
   * const sliceToAdd$ = interval(250).pipe(mapTo({
   *   bar: 5,
   *   foo: 'foo'
   * });
   * state.connect(sliceToAdd$);
   * // every 250ms the properties bar and foo get updated due to the emission of sliceToAdd$
   * ```
   *
   * Additionally you can provide a `projectionFunction` to access the current state object and do custom mappings.
   * ```Typescript
   * const sliceToAdd$ = interval(250).pipe(mapTo({
   *   bar: 5,
   *   foo: 'foo'
   * });
   * state.connect(sliceToAdd$, (state, slice) => state.bar += slice.bar);
   * // every 250ms the properties bar and foo get updated due to the emission of sliceToAdd$. Bar will increase by
   * 5 due to the projectionFunction
   * ```
   */
  connect<K extends keyof T>(
      slice$: Observable<any | Partial<T>>,
      projectFn?: ProjectStateReducer<T, K>
  ): void;
  /**
   *
   * @description
   * Connect an `Observable<T[K]>` source to a specific property `K` in the state `T`. Any emitted change will update
   * this
   * specific property in the state.
   * Subscription handling is done automatically.
   *
   * @example
   * ```Typescript
   * const myTimer$ = interval(250);
   * state.connect('timer', myTimer$);
   * // every 250ms the property timer will get updated
   * ```
   */
  connect<K extends keyof T>(key: K, slice$: Observable<T[K]>): void;
  /**
   *
   * @description
   * Connect an `Observable<Partial<T>>` source to a specific property in the state. Additionally you can provide a
   * `projectionFunction` to access the current state object on every emission of your connected `Observable`.
   * Any change emitted by the source will get merged into the state.
   * Subscription handling is done automatically.
   *
   * @example
   *
   * ```Typescript
   * const myTimer$ = interval(250);
   * state.connect('timer', myTimer$, (state, timerChange) => state.timer += timerChange);
   * // every 250ms the property timer will get updated
   * ```
   */
  connect<K extends keyof T>(
      key: K,
      slice$: Observable<any>,
      projectSliceFn: ProjectValueReducer<T, K>
  ): void;
  connect<K extends keyof T>(
      keyOrSlice$: K | Observable<any>,
      projectOrSlices$?: ProjectStateReducer<T, K> | Observable<T[K] | any>,
      projectValueFn?: ProjectValueReducer<T, K>
  ): void {
    if (
        isObservable<any>(keyOrSlice$) &&
        projectOrSlices$ === undefined &&
        projectValueFn === undefined
    ) {
      const slice$ = keyOrSlice$.pipe(filter(slice => slice !== undefined));
      this.stateObservables.next(slice$);
      return;
    }

    if (
        isObservable<any>(keyOrSlice$) &&
        typeof projectOrSlices$ === 'function' &&
        !isObservable<T[K]>(projectOrSlices$) &&
        projectValueFn === undefined
    ) {
      const project = projectOrSlices$;
      const slice$ = keyOrSlice$.pipe(
          filter(slice => slice !== undefined),
          map(v => project(this.get(), v))
      );
      this.stateObservables.next(slice$);
      return;
    }

    if (
        isKeyOf<T>(keyOrSlice$) &&
        isObservable<T[K]>(projectOrSlices$) &&
        projectValueFn === undefined
    ) {
      const key = keyOrSlice$;
      const slice$ = projectOrSlices$.pipe(
          filter(slice => slice !== undefined),
          map(value => ({ ...{}, [key]: value }))
      );
      this.stateObservables.next(slice$);
      return;
    }

    if (
        isKeyOf<T>(keyOrSlice$) &&
        isObservable<any>(projectOrSlices$) &&
        typeof projectValueFn === 'function'
    ) {
      const key = keyOrSlice$;
      const slice$ = projectOrSlices$.pipe(
          filter(slice => slice !== undefined),
          map(value => ({ ...{}, [key]: projectValueFn(this.get(), value) }))
      );
      this.stateObservables.next(slice$);
      return;
    }

    throw new Error('wrong params passed to connect');
  }


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

  hold<S>(observableWithSideEffect: Observable<S>): void;
  hold<S>(obsOrObsWithSideEffect: Observable<S>, sideEffectFn?: (arg: S) => void): void {
    if (sideEffectFn) {
      this.effectSubject.next(obsOrObsWithSideEffect.pipe(tap(sideEffectFn)));
    }
    this.effectSubject.next(obsOrObsWithSideEffect);
  }

  teardown(): void {
    this.subscription.unsubscribe();
  }

  private isOperateFnArray(op: any[]): op is OperatorFunction<T, any>[] {
    return op.every((i: any) => typeof i !== 'string');
  }

  private isStringArray(op: any[]): op is string[] {
    return op.every((i: any) => typeof i !== 'string');
  }

  ngOnDestroy(): void {
    this.teardown();
  }

}

@Injectable({
  providedIn: 'root'
})
export class GlobalState<T> extends State<T> {

}
