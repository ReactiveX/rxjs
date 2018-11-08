import { Observable } from 'rxjs/internal/Observable';
import { sourceAsObservable } from 'rxjs/internal/util/sourceAsObservable';
import { ObservableInput, Source, FOType, Sink, SinkArg } from 'rxjs/internal/types';
import { Subscription } from 'rxjs/internal/Subscription';
import { fromSource } from 'rxjs/internal/sources/fromSource';
import { identity } from 'rxjs/internal/util/identity';
import { tryUserFunction, resultIsError } from 'rxjs/internal/util/userFunction';
import { isIterable } from '../util/isIterable';

/* tslint:disable:max-line-length */
export function zip<T, T2>(v1: ObservableInput<T>, v2: ObservableInput<T2>): Observable<[T, T2]>;
export function zip<T, T2, T3>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>): Observable<[T, T2, T3]>;
export function zip<T, T2, T3, T4>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>): Observable<[T, T2, T3, T4]>;
export function zip<T, T2, T3, T4, T5>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>): Observable<[T, T2, T3, T4, T5]>;
export function zip<T, T2, T3, T4, T5, T6>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>): Observable<[T, T2, T3, T4, T5, T6]>;

export function zip<T>(array: ObservableInput<T>[]): Observable<T[]>;
export function zip<R>(array: ObservableInput<any>[]): Observable<R>;
export function zip<T>(...observables: Array<ObservableInput<T>>): Observable<T[]>;
export function zip<T, R>(...observables: Array<ObservableInput<T> | ((...values: Array<T>) => R)>): Observable<R>;
export function zip<R>(...observables: Array<ObservableInput<any> | ((...values: Array<any>) => R)>): Observable<R>;
/* tslint:enable:max-line-length */

export function zip<T>(...sources: ObservableInput<T>[]): Observable<T> {
  return sourceAsObservable(zipSource(sources));
}

function zipSource<T>(sources: ObservableInput<T>[]): Source<T> {
  return (type: FOType.SUBSCRIBE, sink: Sink<T>, subs: Subscription) => {
    if (type === FOType.SUBSCRIBE) {
      if (sources.length === 0) {
        sink(FOType.COMPLETE, undefined, subs);
        return;
      }
      const state: Array<{ buffer: T[], complete: boolean }> = [];
      for (let i = 0; i < sources.length; i++) {
        const buffer = [] as T[];
        const currentState = {
          buffer,
          complete: false,
        };
        state.push(currentState);

        const source = sources[i];
        const src = tryUserFunction(fromSource, source);
        if (resultIsError(src)) {
          sink(FOType.ERROR, src.error, subs);
          return;
        }

        src(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T>, subs: Subscription) => {
          switch (t) {
            case FOType.NEXT:
              buffer.push(v);
              while (state.length === sources.length && state.every(({ buffer }) => buffer.length > 0)) {
                sink(FOType.NEXT, state.map(s => s.buffer.shift()), subs);
              }
              if (state.some(s => s.complete && s.buffer.length === 0)) {
                sink(FOType.COMPLETE, undefined, subs);
                subs.unsubscribe();
              }
              break;
            case FOType.ERROR:
              sink(t, v, subs);
              break;
            case FOType.COMPLETE:
              currentState.complete = true;
              if (buffer.length === 0) {
                sink(t, v, subs);
                subs.unsubscribe();
              }
              break;
            default:
              break;
          }
        }, subs);
      }
    }
  };
}
