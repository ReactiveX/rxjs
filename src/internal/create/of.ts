import { Observable } from 'rxjs/internal/Observable';
import { sourceAsObservable } from 'rxjs/internal/util/sourceAsObservable';
import { FOType, Sink, Source } from 'rxjs/internal/types';
import { Subscription } from 'rxjs/internal/Subscription';

/* tslint:disable:max-line-length */
export function of<T>(a: T): Observable<T>;
export function of<T, B>(a: T, b: B): Observable<T|B>;
export function of<T, B, C>(a: T, b: B, c: C): Observable<T|B|C>;
export function of<T, B, C, D>(a: T, b: B, c: C, d: D): Observable<T|B|C|D>;
export function of<T, B, C, D, E>(a: T, b: B, c: C, d: D, e: E): Observable<T|B|C|D|E>;
export function of<T, B, C, D, E, F>(a: T, b: B, c: C, d: D, e: E, f: F): Observable<T|B|C|D|E|F>;
export function of<T, B, C, D, E, F, G>(a: T, b: B, c: C, d: D, e: E, f: F, g: G):
  Observable<T|B|C|D|E|F|G>;
export function of<T, B, C, D, E, F, G, H>(a: T, b: B, c: C, d: D, e: E, f: F, g: G, h: H):
  Observable<T|B|C|D|E|F|G|H>;
export function of<T, B, C, D, E, F, G, H, I>(a: T, b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I):
  Observable<T|B|C|D|E|F|G|H|I>;
export function of<T>(...values: T[]): Observable<T>;
/* tslint:enable:max-line-length */

export function of<T>(...values: T[]): Observable<T> {
  return sourceAsObservable(ofSource(values));
}

export function ofSource<T>(values: ArrayLike<T>): Source<T> {
  return (type: FOType, sink: Sink<T>, subs: Subscription) => {
    if (type === FOType.SUBSCRIBE) {
      for (let i = 0; i < values.length && !subs.closed; i++) {
        if (subs.closed) { return; }
        sink(FOType.NEXT, values[i], subs);
      }
      if (!subs.closed) { sink(FOType.COMPLETE, undefined, subs); }
    }
  };
}

const x = of(1, 'test');
