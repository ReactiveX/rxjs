import {Injectable, OnDestroy} from '@angular/core';
import {ConnectableObservable, merge, Observable, OperatorFunction, pipe, Subject, Subscription} from 'rxjs';
import {distinctUntilChanged, filter, mergeAll, publishReplay, scan, shareReplay} from 'rxjs/operators';

// @TODO implement SliceConfig is `connectSlice`
export interface SliceConfig {
  starWith?: any,
  endWith?: any,
}

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
  private subscription = new Subscription();
  private effectSubject = new Subject<Observable<{ [key: string]: number }>>();
  private stateObservables = new Subject<Observable<Partial<T>>>();
  private stateSlices = new Subject<Partial<T>>();

  private state$: Observable<Partial<T>> =
    merge(
      this.stateObservables.pipe(mergeAll()),
      this.stateSlices
    )
      .pipe(
        scan(stateAccumulator, {}),
        publishReplay(1)
      );

  constructor() {
    this.subscription.add((this.state$ as ConnectableObservable<any>).connect());
    this.subscription.add((this.effectSubject
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
    this.stateSlices.next(s);
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
  connectSlice(o: Observable<Partial<T>>): void {
    this.stateObservables.next(o);
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
    this.effectSubject.next(o);
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
   * // ls.select2('foo');
   * ls.select2('test');
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
   // select<R, K extends keyof T>(operator?: K): Observable<T>;
   * @TODO consider ngrx selectors could be passed
   * select<R, D)>(mapFn: (s: T) => D): Observable<R>;
   */
  select<R = T>(operator?: OperatorFunction<T, R>): Observable<R>;
  select<R>(operator?: OperatorFunction<T, R>): Observable<T | R> {
    const operators: OperatorFunction<T, R | T> = operator ? operator : pipe();
    /*
    if (typeof operator === 'string') {
      const key: string = operator;
      operators = pipe(map(s => operator ? s[key] : s));
    }
    if (typeof operator === 'function') {
      // const mapFn = (value: T, index: number) => value;
      operator = pipe(map((value: T, index: number) => value));
    }
    */
    return this.state$
      .pipe(
        // We need to accept operators to enable composition of local scope related observables
        // createSelector
        operators,
        // @TODO how to deal with undefined values?
        // map(state => state.property) can return undefined if not set.
        // This leads to unwanted behaviour in views.
        // Should filter out undefined values be done here?
        filter(v => v !== undefined),
        // State should get pushed only if changed. as this is a repetitive task we do it here
        distinctUntilChanged(),
        // I don't want to run the same computation for multiple subscribers.
        // Therefore we share the computed value
        shareReplay(1)
      );
  }

  /**
   * ngOnDestroy(): void
   *
   * When called it teardown all internal logic
   * used to connect to the `OnDestroy` life-cycle hook of services, components, directives, pipes
   */
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

}
