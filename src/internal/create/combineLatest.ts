import { ObservableInput, FOType, Sink, Source, SinkArg } from 'rxjs/internal/types';
import { Observable } from 'rxjs/internal/Observable';
import { sourceAsObservable } from 'rxjs/internal/util/sourceAsObservable';
import { Subscription } from 'rxjs/internal/Subscription';
import { fromSource } from 'rxjs/internal/sources/fromSource';
import { identity } from 'rxjs/internal/util/identity';
import { tryUserFunction, resultIsError } from 'rxjs/internal/util/userFunction';

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

export function combineLatest<T>(...sources: ObservableInput<T>[]): Observable<T> {
  if (sources && sources.length === 1 && Array.isArray(sources[0])) {
    sources = sources[0] as any;
  }
  return sourceAsObservable(combineLatestSource(sources));
}

export function combineLatestSource<T>(sources: ObservableInput<T>[]): Source<T> {
  return (type: FOType, dest: Sink<T>, subs: Subscription) => {
    if (type === FOType.SUBSCRIBE) {
      const values = new Array(sources.length);
      let emittedOnce = sources.map(() => false);
      let completed = sources.map(() => false);
      let hasValues = false;

      for (let s = 0; s < sources.length; s++) {
        const source = sources[s];
        const src = tryUserFunction(fromSource, source);
        if (resultIsError(src)) {
          dest(FOType.ERROR, src.error, subs);
          return;
        }

        src(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T>, subs: Subscription) => {
          switch (t) {
            case FOType.NEXT:
              values[s] = v;
              emittedOnce[s] = true;
              if (hasValues || (hasValues = emittedOnce.every(identity))) {
                dest(FOType.NEXT, values.slice(0), subs);
              }
              break;
            case FOType.ERROR:
              dest(t, v, subs);
              break;
            case FOType.COMPLETE:
              completed[s] = true;
              if (completed.every(identity)) {
                dest(FOType.COMPLETE, undefined, subs);
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
