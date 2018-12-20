import { ObservableInput, FOType, Sink, Source, SinkArg } from 'rxjs/internal/types';
import { Observable } from 'rxjs/internal/Observable';
import { Subscription } from 'rxjs/internal/Subscription';
import { identity } from 'rxjs/internal/util/identity';
import { tryUserFunction, resultIsError } from 'rxjs/internal/util/userFunction';
import { from } from 'rxjs/internal/create/from';

/* tslint:disable:max-line-length */
export function combineLatest<T, T2>(v1: ObservableInput<T>, v2: ObservableInput<T2>): Observable<[T, T2]>;
export function combineLatest<T, T2, T3>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>): Observable<[T, T2, T3]>;
export function combineLatest<T, T2, T3, T4>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>): Observable<[T, T2, T3, T4]>;
export function combineLatest<T, T2, T3, T4, T5>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>): Observable<[T, T2, T3, T4, T5]>;
export function combineLatest<T, T2, T3, T4, T5, T6>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>): Observable<[T, T2, T3, T4, T5, T6]>;
export function combineLatest<T>(array: ObservableInput<T>[]): Observable<T[]>;
export function combineLatest<R>(array: ObservableInput<any>[]): Observable<R>;
export function combineLatest<T>(...observables: Array<ObservableInput<T>>): Observable<T[]>;
/* tslint:enable:max-line-length */

export function combineLatest<T>(...sources: ObservableInput<T>[]): Observable<T[]> {
  if (sources && sources.length === 1 && Array.isArray(sources[0])) {
    sources = sources[0] as any;
  }
  return new Observable<T[]>(subscriber => {
    const values = new Array(sources.length);
    let emittedOnce = 0;
    let allHaveEmittedOnce = false;
    let completed = 0;
    const subscription = new Subscription();

    for (let s = 0; s < sources.length; s++) {
      let first = true;
      subscription.add(from(sources[s]).subscribe({
        next(value: T) {
          values[s] = value;
          if (!allHaveEmittedOnce && first) {
            emittedOnce++;
            first = false;
            allHaveEmittedOnce = emittedOnce === sources.length;
          }
          if (allHaveEmittedOnce) {
            subscriber.next(values.slice(0));
          }
        },
        error(err: any) {
          subscriber.error(err);
        },
        complete() {
          completed++;
          if (completed === sources.length) {
            subscriber.complete();
          }
        }
      }));
    }

    return subscription;
  });
}
