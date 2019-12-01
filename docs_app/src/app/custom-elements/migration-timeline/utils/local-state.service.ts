import {Injectable, OnDestroy} from '@angular/core';
import {ConnectableObservable, merge, noop, Observable, OperatorFunction, pipe, Subject, Subscription, UnaryFunction} from 'rxjs';
import {distinctUntilChanged, filter, map, mergeAll, publishReplay, scan, shareReplay} from 'rxjs/operators';

/** RxJS INTERNAL */
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

export function select<T>(): UnaryFunction<T, T>;
export function select<T, A>(op: OperatorFunction<T, T>): UnaryFunction<T, A>;
export function select<T, A, B>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>): UnaryFunction<T, B>;
// tslint:disable-next-line:max-line-length
export function select<T, A, B, C>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>): UnaryFunction<T, C>;
// tslint:disable-next-line:max-line-length
export function select<T, A, B, C, D>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>): UnaryFunction<T, D>;
export function select<T>(...ops: OperatorFunction<T, any>[]) {
  return pipe(
    pipeFromArray(ops),
    filter(v => v !== undefined),
    distinctUntilChanged(),
    shareReplay(1)
  );
}

/*
interface AbstractLocalState<T> {
  setSlice(s: Partial<T>): void;

  connectSlice(o: Observable<Partial<T>>): void;

  connectEffect(o: Observable<any>): void;

  select(): Observable<T>;
  select<A = T>(op: OperatorFunction<T, A>): Observable<A>;
  select<A = T, B = A>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>): Observable<B>;
  select<A = T, B = A, C = B>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>): Observable<C>;
  select<A extends keyof T>(path: A): Observable<T[A]>;
  select(...opOrMapFn: OperatorFunction<T, any>[] | string[]): Observable<any>;

  teardown(): void;
}
*/
export const stateAccumulator = (acc, command): { [key: string]: number } => ({...acc, ...command});
// @TODO use accumulator with cleanup logic for undefined state slices
export const deleteUndefinedStateAccumulator = (state, [keyToDelete, value]: [string, number]): { [key: string]: number } => {
  const isKeyToDeletePresent = keyToDelete in state;
  // The key you want to delete is not stored :)
  if (!isKeyToDeletePresent && value === undefined) {
    return state;
  }
  // Delete slice
  if (value === undefined) {
    const {[keyToDelete]: v, ...newS} = state as any;
    return newS;
  }
  // update state
  return ({...state, [keyToDelete]: value});
};

@Injectable()
export class LocalState<T> implements OnDestroy {
  private _subscription = new Subscription();
  private _stateObservables = new Subject<Observable<Partial<T>>>();
  private _stateSlices = new Subject<Partial<T>>();
  private _effectSubject = new Subject<any>();

  private stateAccumulator = (acc: T, command: Partial<T>): T => ({...acc, ...command});

  // tslint:disable-next-line:member-ordering
  private _state$ = merge(
    this._stateObservables.pipe(mergeAll()),
    this._stateSlices
  ).pipe(
    scan(this.stateAccumulator, {} as T),
    publishReplay(1)
  );

  constructor() {
    this._subscription.add((this._state$ as ConnectableObservable<T>).connect());
    this._subscription.add((this._effectSubject
      .pipe(mergeAll(), publishReplay(1)
      ) as ConnectableObservable<any>).connect()
    );
  }

  /**
   * setSlice(s: Partial<T>) => void
   *
   * @param s: Partial<T>
   *
   * @example
   * const ls = new LocalState<{test: string, bar: number}>();
   * // Error
   * // ls.setSlice({test: 7});
   * ls.setSlice({test: 'tau'});
   * // Error
   * // ls.setSlice({bar: 'tau'});
   * ls.setSlice({bar: 7});
   */
  setSlice(s: Partial<T>): void {
    this._stateSlices.next(s);
  }


  /**
   * connectSlice(o: Observable<Partial<T>>) => void
   *
   * @param o: Observable<Partial<T>>
   *
   * @example
   * const ls = new LocalState<{test: string, bar: number}>();
   * // Error
   * // ls.connectSlice(of(7));
   * // ls.connectSlice(of('tau'));
   * ls.connectSlice(of());
   * // Error
   * // ls.connectSlice(of({test: 7}));
   * ls.connectSlice(of({test: 'tau'}));
   * // Error
   * // ls.connectSlice(of({bar: 'tau'}));
   * ls.connectSlice(of({bar: 7}));
   *
   * @TODO implement SliceConfig to end a stream automatically with undefined => cleanup of sate
   */
  connectSlice<A extends keyof T>(strOrObs: A | Observable<Partial<T>>, obs?: Observable<T[A]>): void {
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
   * connectEffect(o: Observable<any>) => void
   *
   * @param o: Observable<any>
   *
   * @example
   * const ls = new LocalState<{test: string, bar: number}>();
   * // Error
   * // ls.connectEffect();
   * ls.connectEffect(of());
   * ls.connectEffect(of().pipe(tap(n => console.log('side effect', n))));
   */
  connectEffect(o: Observable<any>): void {
    this._effectSubject.next(o);
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
  select<A = T>(op: OperatorFunction<T, A>): Observable<A>;
  select<A = T, B = A>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>): Observable<B>;
  select<A = T, B = A, C = B>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>): Observable<C>;
  select<A extends keyof T>(path: A): Observable<T[A]>;
  select(...opOrMapFn: OperatorFunction<T, any>[] | string[]): Observable<any> {
    if (!opOrMapFn || opOrMapFn.length === 0) {
      return this._state$
        .pipe(
          distinctUntilChanged(),
          shareReplay(1)
        );
    } else if (!this.isOperateFnArray(opOrMapFn)) {
      const [path] = opOrMapFn;
      return this._state$.pipe(
        map((x: T) => x[path]),
        filter(v => v !== undefined),
        distinctUntilChanged(),
        shareReplay(1)
      );
    } else {
      return this._state$.pipe(
        select(...opOrMapFn as [])
      );
    }
  }

  private isOperateFnArray(op: OperatorFunction<T, any>[] | string[]): op is OperatorFunction<T, any>[] {
    return !(op.length === 1 && typeof op[0] === 'string');
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
