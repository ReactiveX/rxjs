import {Injectable, OnDestroy} from '@angular/core';
import {ConnectableObservable, merge, Observable, Subject, Subscription} from 'rxjs';
import {distinctUntilChanged, map, mergeAll, publishReplay, scan, shareReplay} from 'rxjs/operators';

export interface SliceConfig {
  starWith?: any,
  endWith?: any,
}

const stateAccumulator = (acc, command): { [key: string]: number } => ({...acc, ...command});

@Injectable()
export class LocalState<T> implements OnDestroy {
  private subscription = new Subscription();
  private effectSubject = new Subject<Observable<{ [key: string]: number }>>();
  private stateObservables = new Subject<Observable<T>>();
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

  connectSlice(o: Observable<T>): void {
    this.stateObservables.next(o);
  }

  connectEffect(o: Observable<any>): void {
    this.effectSubject.next(o);
  }

  select(selector?) {
    return selector ? this.state$
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
      ) : this.state$;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

}
