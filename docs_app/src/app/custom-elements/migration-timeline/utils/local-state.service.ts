import {Injectable, OnDestroy} from '@angular/core';
import {ConnectableObservable, merge, Observable, OperatorFunction, Subject, Subscription} from 'rxjs';
import {distinctUntilChanged, mergeAll, publishReplay, scan, shareReplay} from 'rxjs/operators';

export interface SliceConfig {
  starWith?: any,
  endWith?: any,
}

const stateAccumulator = (acc, command): { [key: string]: number } => ({...acc, ...command});

@Injectable()
export class LocalState<T> implements OnDestroy {
  private subscription = new Subscription();
  private effectSubject = new Subject<Observable<{ [key: string]: number }>>();
  private stateObservables = new Subject<Observable<Partial<T>>>();
  private stateSlices = new Subject<T>();
  state$: Observable<T> =
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

  setSlice(s: T): void {
    this.stateSlices.next(s);
  }

  connectSlice(o: Observable<Partial<T>>): void {
    this.stateObservables.next(o);
  }

  connectEffect(o: Observable<any>): void {
    this.effectSubject.next(o);
  }

  // @TODO find out where the initial undefined is coming from
  select<R = T>(operator: OperatorFunction<T, R>): Observable<R>;
  select<R>(operator?: OperatorFunction<T, R>): Observable<T | R> {
    return this.state$
      .pipe(
        operator ? operator : (o) => o,
        // @TODO where to put? .select in the view is meh, and creating multiple properties in vm is not good!
        // .state$ should be the one source where we get state from
        // ATM I do:
        // - create properties as queries
        // - use pipes in the template
        // - use state$ | async in the template
        distinctUntilChanged(),
        shareReplay(1)
      );
  }

  /*
    select(selector) {
      return this.state$
        .pipe(
          map(s => selector(s)),
          // @TODO where to put? .select in the view is meh, and creating multiple properties in vm is not good!
          // .state$ should be the one source where we get state from
          // ATM I do:
          // - create properties as queries
          // - use pipes in the template
          // - use state$ | async in the template
          distinctUntilChanged(),
          shareReplay(1)
        );
    }
  */
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

}

/*
// export function select<T>(): ((value: T) => void) & ObservableInput<T>;
export function select<T, R = T>(operator: OperatorFunction<T, R>): ObservableInput<R>;
export function select<T, R>(operator?: OperatorFunction<T, R>):  ObservableInput<T | R> {
  return this.state$
    .pipe(
      operator ? operator : (o) => o,
      // @TODO where to put? .select in the view is meh, and creating multiple properties in vm is not good!
      // .state$ should be the one source where we get state from
      // ATM I do:
      // - create properties as queries
      // - use pipes in the template
      // - use state$ | async in the template
      distinctUntilChanged(),
      shareReplay(1)
    );
}
*/
