import {Injectable, OnDestroy} from '@angular/core';
import {ConnectableObservable, merge, Observable, OperatorFunction, Subject, Subscription} from 'rxjs';
import {distinctUntilChanged, filter, mergeAll, publishReplay, scan, shareReplay} from 'rxjs/operators';

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

  setSlice(s: Partial<T>): void {
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

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

}
